const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');

const getProjects = async (req, res, next) => {
  try {
    let user;
    if (req.user) {
      user = await User.findById(req.user.id).populate('targetCareer');
    }

    const filter = {};
    if (user && user.targetCareer) {
      filter.careerPath = user.targetCareer._id;
    }

    const projects = await Project.find(filter)
      .populate('careerPath', 'title')
      .populate('skills', 'name category');

    let userProgressMap = {};
    if (user) {
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

const updateProjectProgress = async (req, res, next) => {
  try {
    const { projectId, status, repoLink, demoLink, notes } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: 'Valid Project ID is required' });
    }

    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    if (repoLink && !/^https?:\/\//i.test(repoLink)) {
      return res.status(400).json({ success: false, message: 'Repository URL must start with http:// or https://' });
    }
    if (demoLink && !/^https?:\/\//i.test(demoLink)) {
      return res.status(400).json({ success: false, message: 'Demo URL must start with http:// or https://' });
    }

    const user = await User.findById(req.user.id);
    const existingIndex = user.projectProgress.findIndex(
      p => p.project.toString() === projectId
    );

    const progressData = {
      project: projectId,
      status,
      repoLink: repoLink ? repoLink.trim() : '',
      demoLink: demoLink ? demoLink.trim() : '',
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

module.exports = { getProjects, updateProjectProgress };
