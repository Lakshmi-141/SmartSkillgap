const Resource = require('../models/Resource');
const User = require('../models/User');
const mongoose = require('mongoose');

const getResources = async (req, res, next) => {
  try {
    const { skillId, type, targetLevel } = req.query;
    const filter = {};

    if (skillId && mongoose.Types.ObjectId.isValid(skillId)) {
      filter.skill = skillId;
    }
    if (type) {
      filter.type = type;
    }
    if (targetLevel) {
      filter.targetLevel = Number(targetLevel);
    }

    const resources = await Resource.find(filter)
      .populate('skill', 'name category')
      .sort({ targetLevel: 1, title: 1 });

    let bookmarksMap = {};
    if (req.user) {
      const user = await User.findById(req.user.id);
      user.resourceBookmarks.forEach(b => {
        bookmarksMap[b.resource.toString()] = b.status;
      });
    }

    const resourcesWithStatus = resources.map(res => {
      const status = bookmarksMap[res._id.toString()] || 'none';
      return {
        ...res.toObject(),
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

module.exports = { getResources, updateResourceStatus };
