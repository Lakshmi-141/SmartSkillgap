const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const seedPlatformDataIfEmpty = require('../utils/seedPlatformData');

// Helper to determine proficiency level from score percentage
const calculateProficiencyLevel = (percentage) => {
  if (percentage >= 90) return { level: 'Expert', numeric: 4 };
  if (percentage >= 75) return { level: 'Advanced', numeric: 3 };
  if (percentage >= 60) return { level: 'Intermediate', numeric: 2 };
  if (percentage >= 40) return { level: 'Beginner', numeric: 1 };
  return { level: 'No Knowledge', numeric: 0 };
};

// @desc    Get all available assessments
// @route   GET /api/assessments
// @access  Private
const getAssessments = async (req, res, next) => {
  try {
    await seedPlatformDataIfEmpty();

    const assessments = await Assessment.find().select('-questions.correctOptionIndex -questions.explanation').sort({ title: 1 });

    return res.status(200).json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment by ID for student taking test (hides correct answers)
// @route   GET /api/assessments/:id
// @access  Private
const getAssessmentById = async (req, res, next) => {
  try {
    await seedPlatformDataIfEmpty();

    const { id } = req.params;
    const assessment = await Assessment.findById(id).select('-questions.correctOptionIndex -questions.explanation');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    return res.status(200).json({
      success: true,
      assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment answers & calculate score/proficiency strictly on backend
// @route   POST /api/assessments/:id/submit
// @access  Private
const submitAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Expect object: { [questionIndexOrId]: selectedOptionIndex } or array

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Answers must be provided as an object mapping question indices to selected option indices'
      });
    }

    let score = 0;
    const userAnswers = [];
    const questions = assessment.questions || [];
    const totalQuestions = questions.length;

    questions.forEach((q, idx) => {
      const selectedOption = answers[idx] !== undefined ? Number(answers[idx]) : answers[q._id] !== undefined ? Number(answers[q._id]) : -1;
      const isCorrect = selectedOption === q.correctOptionIndex;
      if (isCorrect) score += 1;

      userAnswers.push({
        questionIndex: idx,
        selectedOption,
        isCorrect
      });
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const { level: proficiencyLevel, numeric: proficiencyNumeric } = calculateProficiencyLevel(percentage);

    const suggestions = [];
    if (percentage < 60) {
      suggestions.push(`Review core principles of ${assessment.skillName}. Consider completing beginner learning resources.`);
      suggestions.push('Retake the assessment after reviewing the recommended practice tasks.');
    } else if (percentage < 85) {
      suggestions.push(`Good grasp of ${assessment.skillName}. Focus on edge cases and advanced concepts.`);
    } else {
      suggestions.push(`Excellent mastery of ${assessment.skillName}! Ready for advanced project implementations.`);
    }

    const result = await AssessmentResult.create({
      user: req.user._id,
      assessment: assessment._id,
      score,
      totalQuestions,
      percentage,
      proficiencyLevel,
      proficiencyNumeric,
      suggestions,
      userAnswers
    });

    return res.status(200).json({
      success: true,
      message: 'Assessment evaluated successfully',
      result: {
        id: result._id,
        assessmentTitle: assessment.title,
        skillName: assessment.skillName,
        score,
        totalQuestions,
        percentage,
        proficiencyLevel,
        proficiencyNumeric,
        suggestions,
        submittedAt: result.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's assessment results
// @route   GET /api/assessments/results/me
// @access  Private
const getMyAssessmentResults = async (req, res, next) => {
  try {
    const results = await AssessmentResult.find({ user: req.user._id })
      .populate('assessment', 'title category skillName difficulty')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assessment (Admin only)
// @route   POST /api/assessments
// @access  Private/Admin
const createAssessment = async (req, res, next) => {
  try {
    const { title, description, category, skillName, difficulty, passingPercentage, questions } = req.body;

    if (!title || !skillName || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, skillName, and at least one question are required'
      });
    }

    const assessment = await Assessment.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'General',
      skillName: skillName.trim(),
      difficulty: difficulty || 'Intermediate',
      passingPercentage: passingPercentage || 60,
      questions
    });

    return res.status(201).json({
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
    const { title, description, category, skillName, difficulty, passingPercentage, questions } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (title) assessment.title = title.trim();
    if (description !== undefined) assessment.description = description.trim();
    if (category) assessment.category = category;
    if (skillName) assessment.skillName = skillName.trim();
    if (difficulty) assessment.difficulty = difficulty;
    if (passingPercentage !== undefined) assessment.passingPercentage = passingPercentage;
    if (Array.isArray(questions)) assessment.questions = questions;

    await assessment.save();

    return res.status(200).json({
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

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    await Assessment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Assessment "${assessment.title}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getMyAssessmentResults,
  createAssessment,
  updateAssessment,
  deleteAssessment
};
