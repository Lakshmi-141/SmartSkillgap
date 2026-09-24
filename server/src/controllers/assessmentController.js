const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const UserSkill = require('../models/UserSkill');
const Skill = require('../models/Skill');

// Helper to sanitize assessment questions so correctAnswer/correctOption is NEVER exposed before submission
const sanitizeAssessmentQuestions = (assessment) => {
  const obj = assessment.toObject ? assessment.toObject() : assessment;
  if (Array.isArray(obj.questions)) {
    obj.questions = obj.questions.map(q => {
      delete q.correctAnswer;
      delete q.correctOption;
      delete q.explanation;
      return q;
    });
  }
  return obj;
};

// @desc    Get all assessments (Excludes correctAnswer & explanation)
// @route   GET /api/assessments
// @access  Public / Private
const getAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find()
      .select('-questions.correctAnswer -questions.correctOption -questions.explanation')
      .populate('skill', 'name category description');

    const sanitized = assessments.map(a => sanitizeAssessmentQuestions(a));

    res.status(200).json({
      success: true,
      count: sanitized.length,
      assessments: sanitized
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assessment for taking quiz (QUESTIONS ONLY - NO ANSWERS)
// @route   GET /api/assessments/:id
// @access  Public / Private
const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Assessment ID format' });
    }

    const assessment = await Assessment.findById(id)
      .select('-questions.correctAnswer -questions.correctOption -questions.explanation')
      .populate('skill', 'name category description');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const sanitized = sanitizeAssessmentQuestions(assessment);

    res.status(200).json({
      success: true,
      assessment: sanitized
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment & evaluate score server-side
// @route   POST /api/assessments/:id/submit
// @access  Private
const submitAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedAnswer / selectedOption }
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Assessment ID format' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    // Retrieve assessment from DB with correct answers on server only
    const assessment = await Assessment.findById(id)
      .select('+questions.correctAnswer +questions.correctOption +questions.explanation')
      .populate('skill');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Build map of valid question IDs in this assessment
    const validQuestionMap = {};
    assessment.questions.forEach(q => {
      validQuestionMap[q._id.toString()] = q;
    });

    const processedQuestionIds = new Set();
    const evaluatedUserAnswers = [];
    let correctCount = 0;
    let totalScorePoints = 0;
    let earnedPoints = 0;

    for (const ansItem of answers) {
      if (!ansItem || !ansItem.questionId) {
        return res.status(400).json({ success: false, message: 'Each answer item must contain questionId' });
      }
      const qIdStr = ansItem.questionId.toString();

      // 1. Fake Question ID Check
      if (!validQuestionMap[qIdStr]) {
        return res.status(400).json({ success: false, message: `Invalid or fake question ID: ${qIdStr}` });
      }

      // 2. Duplicate Question Submission Handling
      if (processedQuestionIds.has(qIdStr)) {
        return res.status(400).json({ success: false, message: `Duplicate question submission for ID: ${qIdStr}` });
      }
      processedQuestionIds.add(qIdStr);

      const targetQuestion = validQuestionMap[qIdStr];
      const selectedIndex = ansItem.selectedAnswer !== undefined ? Number(ansItem.selectedAnswer) : Number(ansItem.selectedOption);

      // 3. Invalid Answer Index Check
      if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= targetQuestion.options.length) {
        return res.status(400).json({ success: false, message: `Invalid answer index ${selectedIndex} for question ${qIdStr}` });
      }

      const correctIdx = targetQuestion.correctAnswer !== undefined ? targetQuestion.correctAnswer : targetQuestion.correctOption;
      const isCorrect = selectedIndex === correctIdx;

      const qPoints = targetQuestion.points || 10;
      totalScorePoints += qPoints;
      if (isCorrect) {
        correctCount++;
        earnedPoints += qPoints;
      }

      evaluatedUserAnswers.push({
        questionId: targetQuestion._id,
        questionText: targetQuestion.questionText,
        selectedOption: selectedIndex,
        selectedAnswer: selectedIndex,
        correctAnswer: correctIdx,
        correctOption: correctIdx,
        isCorrect,
        explanation: targetQuestion.explanation || 'No explanation provided'
      });
    }

    // 4. Server-Side Score Calculation (Client-submitted score is ignored)
    const totalQuestions = assessment.questions.length;
    const scorePercentage = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    // 5. Proficiency Level Calculation:
    // 0-39%: Level 1 (Beginner)
    // 40-69%: Level 2 (Intermediate)
    // 70-89%: Level 3 (Advanced)
    // 90-100%: Level 4 (Expert)
    let assignedLevel = 1;
    if (scorePercentage >= 90) {
      assignedLevel = 4;
    } else if (scorePercentage >= 70) {
      assignedLevel = 3;
    } else if (scorePercentage >= 40) {
      assignedLevel = 2;
    } else {
      assignedLevel = 1;
    }

    // 6. Save AssessmentResult
    const result = await AssessmentResult.create({
      user: userId,
      assessment: assessment._id,
      skill: assessment.skill._id || assessment.skill,
      score: earnedPoints,
      percentage: scorePercentage,
      scorePercentage,
      totalQuestions,
      correctAnswersCount: correctCount,
      proficiency: assignedLevel,
      assignedProficiencyLevel: assignedLevel,
      answers: evaluatedUserAnswers
    });

    // 7. Update UserSkill proficiency for this user and skill
    const skillId = assessment.skill._id || assessment.skill;
    let userSkill = await UserSkill.findOne({ user: userId, skill: skillId });
    if (userSkill) {
      if (assignedLevel > userSkill.proficiency) {
        userSkill.proficiency = assignedLevel;
      }
      userSkill.source = 'assessment';
      await userSkill.save();
    } else {
      await UserSkill.create({
        user: userId,
        skill: skillId,
        proficiency: assignedLevel,
        source: 'assessment'
      });
    }

    res.status(201).json({
      success: true,
      message: `Assessment completed! Score: ${scorePercentage}%`,
      resultId: result._id,
      result: {
        _id: result._id,
        score: earnedPoints,
        percentage: scorePercentage,
        scorePercentage,
        totalQuestions,
        correctAnswersCount: correctCount,
        proficiency: assignedLevel,
        assignedProficiencyLevel: assignedLevel,
        skillName: assessment.skill.name || '',
        answers: evaluatedUserAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's assessment results history (IDOR Protected)
// @route   GET /api/assessments/results  or  GET /api/assessments/my-results
// @access  Private
const getUserResults = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const results = await AssessmentResult.find({ user: userId })
      .populate('assessment', 'title difficulty description')
      .populate('skill', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single detailed result by ID (Only owner or admin can access)
// @route   GET /api/assessments/results/:resultId
// @access  Private
const getResultById = async (req, res, next) => {
  try {
    const { resultId } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({ success: false, message: 'Invalid Result ID format' });
    }

    const result = await AssessmentResult.findById(resultId)
      .populate('assessment', 'title difficulty description')
      .populate('skill', 'name category');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Assessment result not found' });
    }

    // IDOR Protection: Ensure user owns this result or is admin
    if (result.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view another user\'s result' });
    }

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================
// ADMIN ASSESSMENT CRUD ACTIONS
// ==============================================================

// @desc    Create new assessment (Admin only)
// @route   POST /api/assessments
// @access  Private/Admin
const createAssessment = async (req, res, next) => {
  try {
    const { title, description, skill, difficulty, timeLimitMinutes, passingScore, questions } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assessment title is required' });
    }

    if (!skill || !mongoose.Types.ObjectId.isValid(skill)) {
      return res.status(400).json({ success: false, message: 'Valid Skill ID is required' });
    }

    const skillExists = await Skill.findById(skill);
    if (!skillExists) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const assessment = await Assessment.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      skill,
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() : 'intermediate',
      timeLimitMinutes: timeLimitMinutes || 15,
      passingScore: passingScore || 60,
      questions: Array.isArray(questions) ? questions : []
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assessment (Admin only)
// @route   PUT /api/assessments/:id
// @access  Private/Admin
const updateAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Assessment ID format' });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const { title, description, difficulty, timeLimitMinutes, passingScore, questions } = req.body;

    if (title !== undefined) assessment.title = title.trim();
    if (description !== undefined) assessment.description = description.trim();
    if (difficulty !== undefined && ['beginner', 'intermediate', 'advanced'].includes(difficulty.toLowerCase())) {
      assessment.difficulty = difficulty.toLowerCase();
    }
    if (timeLimitMinutes !== undefined) assessment.timeLimitMinutes = timeLimitMinutes;
    if (passingScore !== undefined) assessment.passingScore = passingScore;
    if (questions !== undefined && Array.isArray(questions)) assessment.questions = questions;

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assessment (Admin only)
// @route   DELETE /api/assessments/:id
// @access  Private/Admin
const deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Assessment ID format' });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    await assessment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getUserResults,
  getResultById,
  createAssessment,
  updateAssessment,
  deleteAssessment
};

