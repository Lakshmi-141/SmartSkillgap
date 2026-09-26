const Project = require('../models/Project');
const UserProjectProgress = require('../models/UserProjectProgress');
const User = require('../models/User');
const SkillGap = require('../models/SkillGap');
const seedPlatformDataIfEmpty = require('../utils/seedPlatformData');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    await seedPlatformDataIfEmpty();

    const { search, difficulty } = req.query;
    const filter = {};

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: searchRegex },
        { skillsGained: searchRegex }
      ];
    }

    if (difficulty && typeof difficulty === 'string' && difficulty.trim()) {
      filter.difficulty = difficulty.trim();
    }

    const projects = await Project.find(filter).sort({ title: 1 });
    const userProgress = await UserProjectProgress.find({ user: req.user._id });

    const progressMap = new Map();
    userProgress.forEach(p => progressMap.set(p.project.toString(), p));

    const projectsWithProgress = projects.map(proj => {
      const p = progressMap.get(proj._id.toString());
      return {
        ...proj.toObject(),
        userStatus: p ? p.status : 'NOT_STARTED',
        githubRepoUrl: p ? p.githubRepoUrl : '',
        notes: p ? p.notes : ''
      };
    });

    return res.status(200).json({
      success: true,
      count: projectsWithProgress.length,
      projects: projectsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized project recommendations based on student's target career & skill gaps
// @route   GET /api/projects/recommendations
// @access  Private
const getProjectRecommendations = async (req, res, next) => {
  try {
    await seedPlatformDataIfEmpty();

    const userId = req.user._id;
    const user = await User.findById(userId);
    const targetCareer = user ? (user.targetCareer || user.targetRole || 'Full Stack Developer') : 'Full Stack Developer';

    const skillGapDoc = await SkillGap.findOne({ user: userId });
    const missingSkillNames = skillGapDoc ? skillGapDoc.missingSkills.map(s => s.name.toLowerCase()) : [];
    const improveSkillNames = skillGapDoc ? skillGapDoc.skillsToImprove.map(s => s.name.toLowerCase()) : [];

    const allProjects = await Project.find();
    const userProgress = await UserProjectProgress.find({ user: userId });
    const progressMap = new Map();
    userProgress.forEach(p => progressMap.set(p.project.toString(), p));

    // Score each project for relevance
    const scoredProjects = allProjects.map(proj => {
      let score = 0;
      
      // Match target career
      if (proj.targetCareers && proj.targetCareers.some(c => c.toLowerCase().includes(targetCareer.toLowerCase()))) {
        score += 10;
      }

      // Match skills to gain with student missing/improving skills
      (proj.skillsGained || []).forEach(sg => {
        if (missingSkillNames.includes(sg.toLowerCase())) score += 5;
        if (improveSkillNames.includes(sg.toLowerCase())) score += 3;
      });

      const p = progressMap.get(proj._id.toString());

      return {
        ...proj.toObject(),
        relevanceScore: score,
        userStatus: p ? p.status : 'NOT_STARTED',
        githubRepoUrl: p ? p.githubRepoUrl : '',
        notes: p ? p.notes : ''
      };
    });

    // Sort by relevance score descending
    scoredProjects.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return res.status(200).json({
      success: true,
      targetCareer,
      count: scoredProjects.length,
      recommendations: scoredProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project progress status for authenticated student
// @route   POST /api/projects/:id/progress
// @access  Private
const updateProjectProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, githubRepoUrl, notes } = req.body;

    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: NOT_STARTED, IN_PROGRESS, COMPLETED'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let progress = await UserProjectProgress.findOne({ user: req.user._id, project: id });
    if (!progress) {
      progress = new UserProjectProgress({
        user: req.user._id,
        project: id,
        status: status || 'IN_PROGRESS',
        githubRepoUrl: githubRepoUrl || '',
        notes: notes || ''
      });
    } else {
      if (status) progress.status = status;
      if (githubRepoUrl !== undefined) progress.githubRepoUrl = String(githubRepoUrl).trim();
      if (notes !== undefined) progress.notes = String(notes).trim();
    }

    await progress.save();

    return res.status(200).json({
      success: true,
      message: 'Project progress updated successfully',
      progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project (Admin only)
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const { title, description, difficulty, requiredSkills, skillsGained, estimatedDuration, githubUrl, demoUrl, targetCareers } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      difficulty: difficulty || 'Intermediate',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      skillsGained: Array.isArray(skillsGained) ? skillsGained : [],
      estimatedDuration: estimatedDuration || '1-2 Weeks',
      githubUrl: githubUrl || '',
      demoUrl: demoUrl || '',
      targetCareers: Array.isArray(targetCareers) ? targetCareers : []
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (Admin only)
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, requiredSkills, skillsGained, estimatedDuration, githubUrl, demoUrl, targetCareers } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (difficulty) project.difficulty = difficulty;
    if (Array.isArray(requiredSkills)) project.requiredSkills = requiredSkills;
    if (Array.isArray(skillsGained)) project.skillsGained = skillsGained;
    if (estimatedDuration) project.estimatedDuration = estimatedDuration;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (demoUrl !== undefined) project.demoUrl = demoUrl;
    if (Array.isArray(targetCareers)) project.targetCareers = targetCareers;

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (Admin only)
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Project "${project.title}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectRecommendations,
  updateProjectProgress,
  createProject,
  updateProject,
  deleteProject
};
