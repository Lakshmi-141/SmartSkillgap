const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, targetRole } = req.body;

    // 1. NoSQL Injection protection: Ensure inputs are primitive strings
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data types. Fields must be strings.'
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();

    // 2. Validation for missing fields
    if (!trimmedName || !trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password'
      });
    }

    // 3. Validate password match if confirmPassword was passed
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // 4. Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 5. Duplicate email validation
    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please sign in instead.'
      });
    }

    // 6. Create user (Public registration ALWAYS creates role = student)
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: 'student',
      targetCareer: typeof targetRole === 'string' && targetRole.trim() ? targetRole.trim() : 'Full Stack Web Developer',
      targetRole: typeof targetRole === 'string' && targetRole.trim() ? targetRole.trim() : 'Full Stack Web Developer'
    });


    if (user) {
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          targetRole: user.targetRole,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. NoSQL Injection protection: Ensure inputs are primitive strings
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data types. Fields must be strings.'
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // 2. Validation for missing fields
    if (!trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // 3. Check for user
    const user = await User.findOne({ email: trimmedEmail });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          targetRole: user.targetRole,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRole: user.targetRole,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
