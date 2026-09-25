const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validateUrlSecurity } = require('../utils/urlValidator');

// @desc    Get all projects with filtering and search
// @route   GET /api/projects
// @access  Private / Public
const getProjects = async (req, res, next) => {
  try {
    const { skill, difficulty, search } = req.query;
    const filter = {};

    if (skill && mongoose.Types.ObjectId.isValid(skill)) {
      filter.$or = [
        { requiredSkills: skill },
        { skillsGained: skill }
      ];
    }

    if (difficulty) {
      filter.difficulty = difficulty.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('requiredSkills', 'name category')
      .populate('skillsGained', 'name category')
      .sort({ createdAt: -1 });

    let userProgressMap = {};
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user && Array.isArray(user.projectProgress)) {
        user.projectProgress.forEach(p => {
          userProgressMap[p.project.toString()] = {
            status: p.status,
            repoLink: p.repoLink,
            demoLink: p.demoLink,
            notes: p.notes,
            completedAt: p.completedAt
          };
        });
      }
    }

    const projectsWithProgress = projects.map(proj => {
      const prog = userProgressMap[proj._id.toString()] || {
        status: 'not_started',
        repoLink: '',
        demoLink: '',
        notes: ''
      };
      return {
        ...proj.toObject(),
        userProgress: prog
      };
    });

    res.json({
      success: true,
      count: projectsWithProgress.length,
      projects: projectsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private / Public
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format' });
    }

    const project = await Project.findById(id)
      .populate('requiredSkills', 'name category description')
      .populate('skillsGained', 'name category description');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create project (Admin Only)
// @route   POST /api/projects
// @access  Private / Admin
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      difficulty,
      requiredSkills,
      skillsGained,
      estimatedDuration,
      githubUrl,
      demoUrl
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'title and description are required' });
    }

    // Validate external URLs
    const cleanGithubUrl = githubUrl ? validateUrlSecurity(githubUrl, 'GitHub URL') : '';
    const cleanDemoUrl = demoUrl ? validateUrlSecurity(demoUrl, 'Demo URL') : '';

    const project = await Project.create({
      title,
      description,
      difficulty: (difficulty || 'intermediate').toLowerCase(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      skillsGained: Array.isArray(skillsGained) ? skillsGained : [],
      estimatedDuration: estimatedDuration || '10-15 hours',
      githubUrl: cleanGithubUrl,
      demoUrl: cleanDemoUrl
    });

    const populatedProject = await Project.findById(project._id)
      .populate('requiredSkills', 'name category')
      .populate('skillsGained', 'name category');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project (Admin Only)
// @route   PUT /api/projects/:id
// @access  Private / Admin
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const {
      title,
      description,
      difficulty,
      requiredSkills,
      skillsGained,
      estimatedDuration,
      githubUrl,
      demoUrl
    } = req.body;

    if (githubUrl !== undefined) {
      project.githubUrl = githubUrl ? validateUrlSecurity(githubUrl, 'GitHub URL') : '';
    }
    if (demoUrl !== undefined) {
      project.demoUrl = demoUrl ? validateUrlSecurity(demoUrl, 'Demo URL') : '';
    }
    if (title) project.title = title;
    if (description) project.description = description;
    if (difficulty) project.difficulty = difficulty.toLowerCase();
    if (requiredSkills && Array.isArray(requiredSkills)) project.requiredSkills = requiredSkills;
    if (skillsGained && Array.isArray(skillsGained)) project.skillsGained = skillsGained;
    if (estimatedDuration) project.estimatedDuration = estimatedDuration;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('requiredSkills', 'name category')
      .populate('skillsGained', 'name category');

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (Admin Only)
// @route   DELETE /api/projects/:id
// @access  Private / Admin
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid project ID format' });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project progress (status, links, notes)
// @route   POST /api/projects/progress
// @access  Private
const updateProjectProgress = async (req, res, next) => {
  try {
    const { projectId, status, repoLink, demoLink, notes } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: 'Valid Project ID is required' });
    }

    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Validate URL security if links are provided
    const cleanRepoLink = repoLink ? validateUrlSecurity(repoLink, 'Repository URL') : '';
    const cleanDemoLink = demoLink ? validateUrlSecurity(demoLink, 'Demo URL') : '';

    const user = await User.findById(req.user.id);
    const existingIndex = user.projectProgress.findIndex(
      p => p.project.toString() === projectId
    );

    const progressData = {
      project: projectId,
      status,
      repoLink: cleanRepoLink,
      demoLink: cleanDemoLink,
      notes: notes ? notes.trim() : '',
      completedAt: status === 'completed' ? new Date() : null
    };

    if (existingIndex > -1) {
      user.projectProgress[existingIndex] = progressData;
    } else {
      user.projectProgress.push(progressData);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Project progress updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectProgress
};
