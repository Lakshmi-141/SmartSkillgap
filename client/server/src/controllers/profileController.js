const mongoose = require('mongoose');
const User = require('../models/User');
const Career = require('../models/Career');

// @desc    Get current user's profile
// @route   GET /api/users/profile  or  GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId)
      .populate('targetCareer')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    res.status(200).json({
      success: true,
      profile: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile  or  PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, education, interests, targetCareer, bio, githubUrl, linkedinUrl } = req.body;

    // Strict field whitelisting to prevent mass assignment / privilege escalation
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      user.name = name.trim();
    }

    if (education !== undefined) {
      user.education = typeof education === 'string' ? education.trim() : '';
    }

    if (interests !== undefined) {
      if (Array.isArray(interests)) {
        user.interests = interests.map(i => typeof i === 'string' ? i.trim() : '').filter(Boolean);
      } else if (typeof interests === 'string') {
        user.interests = interests.split(',').map(i => i.trim()).filter(Boolean);
      }
    }

    if (targetCareer !== undefined) {
      if (targetCareer === null || targetCareer === '') {
        user.targetCareer = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(targetCareer)) {
          return res.status(400).json({ success: false, message: 'Invalid target career ID' });
        }
        const careerExists = await Career.findById(targetCareer);
        if (!careerExists) {
          return res.status(404).json({ success: false, message: 'Target career not found' });
        }
        user.targetCareer = targetCareer;
      }
    }

    if (bio !== undefined) {
      user.bio = typeof bio === 'string' ? bio.trim() : '';
    }

    if (githubUrl !== undefined) {
      if (githubUrl && !/^https?:\/\//i.test(githubUrl.trim())) {
        return res.status(400).json({ success: false, message: 'GitHub URL must start with http:// or https://' });
      }
      user.githubUrl = typeof githubUrl === 'string' ? githubUrl.trim() : '';
    }

    if (linkedinUrl !== undefined) {
      if (linkedinUrl && !/^https?:\/\//i.test(linkedinUrl.trim())) {
        return res.status(400).json({ success: false, message: 'LinkedIn URL must start with http:// or https://' });
      }
      user.linkedinUrl = typeof linkedinUrl === 'string' ? linkedinUrl.trim() : '';
    }

    // Explicitly prevent role escalation or modifying system fields
    // user.role remains unchanged!

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('targetCareer')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
