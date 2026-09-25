const User = require('../models/User');
const Skill = require('../models/Skill');

// Standard master skills seed list if empty
const defaultMasterSkills = [
  { name: 'JavaScript (ES6+)', category: 'Frontend', description: 'Core programming language of modern web development' },
  { name: 'React.js', category: 'Frontend', description: 'Popular UI component library' },
  { name: 'Node.js', category: 'Backend', description: 'JavaScript runtime environment for backend APIs' },
  { name: 'Express.js', category: 'Backend', description: 'Fast, unopinionated web framework for Node.js' },
  { name: 'MongoDB', category: 'Database', description: 'NoSQL document database' },
  { name: 'TypeScript', category: 'Languages', description: 'Typed superset of JavaScript' },
  { name: 'HTML5 & CSS3', category: 'Frontend', description: 'Core structural and styling web standards' },
  { name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework' },
  { name: 'Python', category: 'Languages', description: 'Versatile language for AI, data science, and web' },
  { name: 'SQL & PostgreSQL', category: 'Database', description: 'Relational database management' },
  { name: 'Docker', category: 'DevOps', description: 'Containerization technology' },
  { name: 'Git & GitHub', category: 'Tools', description: 'Version control and collaboration' },
  { name: 'RESTful API Design', category: 'Backend', description: 'Standard HTTP architecture pattern' },
  { name: 'GraphQL', category: 'Backend', description: 'Query language for APIs' },
  { name: 'Next.js', category: 'Frontend', description: 'React framework for SSR and static web apps' }
];

// Seed master skills helper
const seedMasterSkillsIfEmpty = async () => {
  const count = await Skill.countDocuments();
  if (count === 0) {
    await Skill.insertMany(defaultMasterSkills);
  }
};

// @desc    Get user skills & master skill catalog
// @route   GET /api/skills
// @access  Private
const getSkills = async (req, res, next) => {
  try {
    await seedMasterSkillsIfEmpty();

    const user = await User.findById(req.user._id).select('skills');
    const masterSkills = await Skill.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      userSkills: user ? user.skills : [],
      masterSkills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add skill to user profile
// @route   POST /api/skills
// @access  Private
const addSkill = async (req, res, next) => {
  try {
    const { name, proficiency, category } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const trimmedName = name.trim();
    const validProficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const selectedProficiency = validProficiencies.includes(proficiency) ? proficiency : 'Beginner';
    const selectedCategory = category ? String(category).trim() : 'General';

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if skill already exists in master catalog; if not, create it
    let masterSkill = await Skill.findOne({ name: new RegExp(`^${trimmedName}$`, 'i') });
    if (!masterSkill) {
      masterSkill = await Skill.create({
        name: trimmedName,
        category: selectedCategory,
        description: `${trimmedName} skill competency`
      });
    }

    // Check if skill is already in user profile
    const existingIndex = user.skills.findIndex(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingIndex > -1) {
      // Update existing skill proficiency
      user.skills[existingIndex].proficiency = selectedProficiency;
      if (masterSkill) user.skills[existingIndex].skillId = masterSkill._id;
    } else {
      // Add new skill entry
      user.skills.push({
        skillId: masterSkill._id,
        name: masterSkill.name,
        proficiency: selectedProficiency,
        category: masterSkill.category || selectedCategory
      });
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Skill added to profile successfully',
      skills: user.skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update skill proficiency in user profile
// @route   PUT /api/skills/:id
// @access  Private
const updateSkillProficiency = async (req, res, next) => {
  try {
    const skillIdParam = req.params.id;
    const { proficiency } = req.body;

    const validProficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (!validProficiencies.includes(proficiency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid proficiency level. Allowed: Beginner, Intermediate, Advanced, Expert'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find skill by subdocument _id or skillId or name match
    const skillItem = user.skills.id(skillIdParam) || user.skills.find(
      (s) => s.skillId?.toString() === skillIdParam || s.name.toLowerCase() === skillIdParam.toLowerCase()
    );

    if (!skillItem) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found in user profile'
      });
    }

    skillItem.proficiency = proficiency;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Skill proficiency updated successfully',
      skills: user.skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove skill from user profile
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res, next) => {
  try {
    const skillIdParam = req.params.id;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const initialLength = user.skills.length;
    
    // Filter out skill by subdocument _id, skillId, or name match
    user.skills = user.skills.filter(
      (s) => s._id.toString() !== skillIdParam && s.skillId?.toString() !== skillIdParam && s.name.toLowerCase() !== skillIdParam.toLowerCase()
    );

    if (user.skills.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found in user profile'
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Skill removed from profile successfully',
      skills: user.skills
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  addSkill,
  updateSkillProficiency,
  deleteSkill
};
