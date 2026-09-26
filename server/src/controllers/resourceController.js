const Resource = require('../models/Resource');
const seedPlatformDataIfEmpty = require('../utils/seedPlatformData');

// @desc    Get resources with optional search, skill, difficulty, type filters
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res, next) => {
  try {
    await seedPlatformDataIfEmpty();

    const { search, skill, difficulty, type } = req.query;
    const filter = {};

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skill: searchRegex }
      ];
    }

    if (skill && typeof skill === 'string' && skill.trim()) {
      filter.skill = new RegExp(`^${skill.trim()}$`, 'i');
    }

    if (difficulty && typeof difficulty === 'string' && difficulty.trim()) {
      filter.difficulty = difficulty.trim();
    }

    if (type && typeof type === 'string' && type.trim()) {
      filter.type = type.trim();
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Private
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Learning resource not found'
      });
    }

    return res.status(200).json({
      success: true,
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create learning resource (Admin only)
// @route   POST /api/resources
// @access  Private/Admin
const createResource = async (req, res, next) => {
  try {
    const { title, description, url, type, skill, difficulty } = req.body;

    if (!title || !description || !url || !skill) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, URL, and skill are required'
      });
    }

    const trimmedUrl = String(url).trim();
    if (!/^(http:\/\/|https:\/\/)/i.test(trimmedUrl)) {
      return res.status(400).json({
        success: false,
        message: 'URL must start with http:// or https://'
      });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description.trim(),
      url: trimmedUrl,
      type: type || 'Documentation',
      skill: skill.trim(),
      difficulty: difficulty || 'Beginner',
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Learning resource created successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update learning resource (Admin only)
// @route   PUT /api/resources/:id
// @access  Private/Admin
const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, url, type, skill, difficulty } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Learning resource not found'
      });
    }

    if (url !== undefined) {
      const trimmedUrl = String(url).trim();
      if (!/^(http:\/\/|https:\/\/)/i.test(trimmedUrl)) {
        return res.status(400).json({
          success: false,
          message: 'URL must start with http:// or https://'
        });
      }
      resource.url = trimmedUrl;
    }

    if (title && title.trim()) resource.title = title.trim();
    if (description && description.trim()) resource.description = description.trim();
    if (type) resource.type = type;
    if (skill && skill.trim()) resource.skill = skill.trim();
    if (difficulty) resource.difficulty = difficulty;

    await resource.save();

    return res.status(200).json({
      success: true,
      message: 'Learning resource updated successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete learning resource (Admin only)
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Learning resource not found'
      });
    }

    await Resource.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Resource "${resource.title}" deleted successfully`
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
  deleteResource
};
