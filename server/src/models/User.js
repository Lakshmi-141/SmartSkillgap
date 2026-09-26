const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSkillSchema = new mongoose.Schema({
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner',
    required: true
  },
  category: {
    type: String,
    default: 'General'
  }
}, { _id: true, timestamps: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'USER', 'ADMIN'],
      default: 'student'
    },
    education: {
      type: String,
      default: ''
    },
    college: {
      type: String,
      default: ''
    },
    degree: {
      type: String,
      default: ''
    },
    graduationYear: {
      type: String,
      default: ''
    },
    experienceLevel: {
      type: String,
      enum: ['Student', 'Entry Level', 'Intermediate', 'Experienced'],
      default: 'Student'
    },
    interests: [{
      type: String
    }],
    targetCareer: {
      type: String,
      default: 'Full Stack Web Developer'
    },
    skills: [userSkillSchema]
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to return user object without password
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
