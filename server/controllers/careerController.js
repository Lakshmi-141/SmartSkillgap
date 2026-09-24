const CareerPath = require('../models/CareerPath');
const User = require('../models/User');
const mongoose = require('mongoose');

const getAllCareers = async (req, res, next) => {
  try {
    const careers = await CareerPath.find()
      .populate('requiredSkills.skill')
      .populate('roadmapSteps.skill');
      
    res.json({
      success: true,
      careers
    });
  } catch (error) {
    next(error);
  }
};

const getCareerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Career ID format' });
    }

    const career = await CareerPath.findById(id)
      .populate('requiredSkills.skill')
      .populate('roadmapSteps.skill');

    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found' });
    }

    res.json({
      success: true,
      career
    });
  } catch (error) {
    next(error);
  }
};

const selectTargetCareer = async (req, res, next) => {
  try {
    const { careerId } = req.body;

    if (!careerId || !mongoose.Types.ObjectId.isValid(careerId)) {
      return res.status(400).json({ success: false, message: 'Valid Career ID is required' });
    }

    const career = await CareerPath.findById(careerId);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found' });
    }

    const user = await User.findById(req.user.id);
    user.targetCareer = careerId;
    await user.save();

    const updatedUser = await User.findById(req.user.id)
      .populate('targetCareer')
      .populate('skills.skill');

    res.json({
      success: true,
      message: `Target career set to ${career.title}`,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCareers,
  getCareerById,
  selectTargetCareer
};
