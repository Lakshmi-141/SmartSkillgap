const Career = require('../models/Career');
const User = require('../models/User');
const seedCareersData = require('../utils/seedCareersData');

// Ensure all 11 initial careers exist in database
const seedCareersIfEmpty = async () => {
  const count = await Career.countDocuments();
  if (count < seedCareersData.length) {
    for (const seed of seedCareersData) {
      const exists = await Career.findOne({ title: seed.title });
      if (!exists) {
        await Career.create(seed);
      }
    }
    console.log('[Careers Engine] Guaranteed 11 initial careers seeded to MongoDB.');
  }
};

// @desc    Get all careers with optional search filter
// @route   GET /api/careers
// @access  Public / Private
const getCareers = async (req, res, next) => {
  try {
    await seedCareersIfEmpty();

    const { search } = req.query;
    let query = {};

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'requiredSkills.name': searchRegex },
          { recommendedSkills: searchRegex }
        ]
      };
    }

    const careers = await Career.find(query).sort({ title: 1 });

    return res.status(200).json({
      success: true,
      count: careers.length,
      careers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single career by ID
// @route   GET /api/careers/:id
// @access  Public / Private
const getCareerById = async (req, res, next) => {
  try {
    await seedCareersIfEmpty();

    const { id } = req.params;
    let career;

    // Check if valid ObjectId or title match
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      career = await Career.findById(id);
    } else {
      career = await Career.findOne({ title: new RegExp(`^${id}$`, 'i') });
    }

    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      });
    }

    return res.status(200).json({
      success: true,
      career
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Select a target career for authenticated user
// @route   POST /api/careers/:id/select
// @access  Private
const selectTargetCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    let career;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      career = await Career.findById(id);
    } else {
      career = await Career.findOne({ title: new RegExp(`^${id}$`, 'i') });
    }

    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Selected career path not found'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    user.targetCareer = career.title;
    user.targetRole = career.title; // keep backward compatibility
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Target career updated to "${career.title}"`,
      user: user.toSafeObject(),
      selectedCareer: career
    });
  } catch (error) {
    next(error);
  }
};

// Proficiency numeric weight mapping
const PROFICIENCY_WEIGHTS = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
};

// @desc    Compare user skills against multiple careers
// @route   POST /api/careers/compare
// @access  Private
const compareCareers = async (req, res, next) => {
  try {
    await seedCareersIfEmpty();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    let { careerIds, careerTitles } = req.body || {};
    let query = {};

    if (Array.isArray(careerIds) && careerIds.length > 0) {
      query = { _id: { $in: careerIds } };
    } else if (Array.isArray(careerTitles) && careerTitles.length > 0) {
      query = { title: { $in: careerTitles.map(t => new RegExp(`^${t.trim()}$`, 'i')) } };
    } else {
      // Default: compare default careers if no IDs or titles provided
      const defaultTitles = ['Full Stack Developer', 'Data Analyst', 'Cloud Engineer'];
      query = { title: { $in: defaultTitles.map(t => new RegExp(`^${t}$`, 'i')) } };
    }

    let careers = await Career.find(query);

    // If query returned fewer than 2 careers, fallback to initial careers list
    if (careers.length === 0) {
      careers = await Career.find().limit(3);
    }

    const userSkillsMap = new Map();
    (user.skills || []).forEach(sk => {
      if (sk && sk.name) {
        userSkillsMap.set(sk.name.trim().toLowerCase(), {
          name: sk.name.trim(),
          proficiency: sk.proficiency || 'Beginner',
          weight: PROFICIENCY_WEIGHTS[(sk.proficiency || 'Beginner').toLowerCase()] || 1
        });
      }
    });

    const comparisonResults = careers.map(career => {
      const matchingSkills = [];
      const skillsToImprove = [];
      const missingSkills = [];

      (career.requiredSkills || []).forEach(reqSk => {
        const reqSkillName = typeof reqSk === 'object' ? reqSk.name : reqSk;
        const minProficiency = typeof reqSk === 'object' ? (reqSk.minimumProficiency || 'Beginner') : 'Beginner';
        const minWeight = PROFICIENCY_WEIGHTS[minProficiency.toLowerCase()] || 1;

        const normalizedName = reqSkillName.trim().toLowerCase();
        const userSkill = userSkillsMap.get(normalizedName);

        if (userSkill) {
          if (userSkill.weight >= minWeight) {
            matchingSkills.push({
              name: reqSkillName,
              userProficiency: userSkill.proficiency,
              requiredProficiency: minProficiency
            });
          } else {
            skillsToImprove.push({
              name: reqSkillName,
              userProficiency: userSkill.proficiency,
              requiredProficiency: minProficiency
            });
          }
        } else {
          missingSkills.push({
            name: reqSkillName,
            requiredProficiency: minProficiency
          });
        }
      });

      const totalRequired = (career.requiredSkills || []).length;
      const matchingCount = matchingSkills.length;
      const matchPercentage = totalRequired > 0 ? Math.round((matchingCount / totalRequired) * 100) : 0;

      return {
        careerId: career._id,
        title: career.title,
        description: career.description,
        requiredSkillsCount: totalRequired,
        matchPercentage,
        matchingSkillsCount: matchingSkills.length,
        skillsToImproveCount: skillsToImprove.length,
        missingSkillsCount: missingSkills.length,
        matchingSkills,
        skillsToImprove,
        missingSkills,
        requiredSkills: career.requiredSkills || []
      };
    });

    return res.status(200).json({
      success: true,
      userSkillsCount: (user.skills || []).length,
      comparedCareers: comparisonResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new career path (Admin only)
// @route   POST /api/careers
// @access  Private/Admin
const createCareer = async (req, res, next) => {
  try {
    const { title, description, requiredSkills, recommendedSkills, roadmap } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const existingCareer = await Career.findOne({ title: new RegExp(`^${title.trim()}$`, 'i') });
    if (existingCareer) {
      return res.status(400).json({
        success: false,
        message: `Career with title "${title}" already exists`
      });
    }

    const career = await Career.create({
      title: title.trim(),
      description: description.trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      recommendedSkills: Array.isArray(recommendedSkills) ? recommendedSkills : [],
      roadmap: Array.isArray(roadmap) ? roadmap : []
    });

    return res.status(201).json({
      success: true,
      message: 'Career path created successfully',
      career
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a career path (Admin only)
// @route   PUT /api/careers/:id
// @access  Private/Admin
const updateCareer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, recommendedSkills, roadmap } = req.body;

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      });
    }

    if (title && title.trim()) career.title = title.trim();
    if (description && description.trim()) career.description = description.trim();
    if (Array.isArray(requiredSkills)) career.requiredSkills = requiredSkills;
    if (Array.isArray(recommendedSkills)) career.recommendedSkills = recommendedSkills;
    if (Array.isArray(roadmap)) career.roadmap = roadmap;

    await career.save();

    return res.status(200).json({
      success: true,
      message: 'Career path updated successfully',
      career
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a career path (Admin only)
// @route   DELETE /api/careers/:id
// @access  Private/Admin
const deleteCareer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const career = await Career.findById(id);
    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Career path not found'
      });
    }

    await Career.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Career path "${career.title}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCareers,
  getCareerById,
  selectTargetCareer,
  compareCareers,
  createCareer,
  updateCareer,
  deleteCareer
};


