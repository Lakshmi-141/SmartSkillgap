const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('targetCareer')
      .populate('skills.skill')
      .populate('resourceBookmarks.resource')
      .populate('projectProgress.project');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, education, githubUrl, linkedinUrl } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (education !== undefined) user.education = education.trim();
    if (githubUrl !== undefined) {
      if (githubUrl && !/^https?:\/\//i.test(githubUrl)) {
        return res.status(400).json({ success: false, message: 'GitHub URL must start with http:// or https://' });
      }
      user.githubUrl = githubUrl.trim();
    }
    if (linkedinUrl !== undefined) {
      if (linkedinUrl && !/^https?:\/\//i.test(linkedinUrl)) {
        return res.status(400).json({ success: false, message: 'LinkedIn URL must start with http:// or https://' });
      }
      user.linkedinUrl = linkedinUrl.trim();
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id)
      .populate('targetCareer')
      .populate('skills.skill');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
