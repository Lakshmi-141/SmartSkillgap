const Resource = require('../models/Resource');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validateUrlSecurity } = require('../utils/urlValidator');

// @desc    Get all learning resources with optional filtering & search
// @route   GET /api/resources
// @access  Private / Public
const getResources = async (req, res, next) => {
  try {
    const { skill, skillId, type, difficulty, search } = req.query;
    const filter = {};

    const targetSkillId = skillId || skill;
    if (targetSkillId && mongoose.Types.ObjectId.isValid(targetSkillId)) {
      filter.skill = targetSkillId;
    }

    if (type) {
      filter.type = type.toLowerCase();
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

    const resources = await Resource.find(filter)
      .populate('skill', 'name category description')
      .sort({ createdAt: -1 });

    let bookmarksMap = {};
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user && Array.isArray(user.resourceBookmarks)) {
        user.resourceBookmarks.forEach(b => {
          bookmarksMap[b.resource.toString()] = b.status;
        });
      }
    }

    const resourcesWithStatus = resources.map(resObj => {
      const status = bookmarksMap[resObj._id.toString()] || 'none';
      return {
        ...resObj.toObject(),
        userStatus: status
      };
    });

    res.json({
      success: true,
      count: resourcesWithStatus.length,
      resources: resourcesWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resource by ID
// @route   GET /api/resources/:id
// @access  Private / Public
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(id).populate('skill', 'name category description');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new learning resource (Admin Only)
// @route   POST /api/resources
// @access  Private / Admin
const createResource = async (req, res, next) => {
  try {
    const { title, description, url, type, skill, difficulty, provider, isFree } = req.body;

    if (!title || !url || !type || !skill) {
      return res.status(400).json({ success: false, message: 'title, url, type, and skill are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(skill)) {
      return res.status(400).json({ success: false, message: 'Invalid skill ID format' });
    }

    // Validate URL security (reject javascript:, data:, file:, etc.)
    const cleanUrl = validateUrlSecurity(url, 'Resource URL');

    const resource = await Resource.create({
      title,
      description: description || '',
      url: cleanUrl,
      type: type.toLowerCase(),
      skill,
      difficulty: (difficulty || 'beginner').toLowerCase(),
      provider: provider || 'Web Resource',
      isFree: isFree !== undefined ? Boolean(isFree) : true
    });

    const populatedResource = await Resource.findById(resource._id).populate('skill', 'name category');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resource: populatedResource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource (Admin Only)
// @route   PUT /api/resources/:id
// @access  Private / Admin
const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const { title, description, url, type, skill, difficulty, provider, isFree } = req.body;

    if (url) {
      resource.url = validateUrlSecurity(url, 'Resource URL');
    }
    if (title) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (type) resource.type = type.toLowerCase();
    if (skill) {
      if (!mongoose.Types.ObjectId.isValid(skill)) {
        return res.status(400).json({ success: false, message: 'Invalid skill ID format' });
      }
      resource.skill = skill;
    }
    if (difficulty) resource.difficulty = difficulty.toLowerCase();
    if (provider !== undefined) resource.provider = provider;
    if (isFree !== undefined) resource.isFree = Boolean(isFree);

    await resource.save();

    const updatedResource = await Resource.findById(resource._id).populate('skill', 'name category');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      resource: updatedResource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource (Admin Only)
// @route   DELETE /api/resources/:id
// @access  Private / Admin
const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource bookmark/completion status for logged-in user
// @route   POST /api/resources/bookmark
// @access  Private
const updateResourceStatus = async (req, res, next) => {
  try {
    const { resourceId, status } = req.body;

    if (!resourceId || !mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ success: false, message: 'Valid Resource ID is required' });
    }

    const user = await User.findById(req.user.id);
    const existingIndex = user.resourceBookmarks.findIndex(
      b => b.resource.toString() === resourceId
    );

    if (status === 'none') {
      if (existingIndex > -1) {
        user.resourceBookmarks.splice(existingIndex, 1);
      }
    } else {
      if (!['bookmarked', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      if (existingIndex > -1) {
        user.resourceBookmarks[existingIndex].status = status;
        user.resourceBookmarks[existingIndex].updatedAt = new Date();
      } else {
        user.resourceBookmarks.push({
          resource: resourceId,
          status,
          updatedAt: new Date()
        });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Resource status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  updateResourceStatus
};
