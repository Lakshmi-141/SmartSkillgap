const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const seedData = require('./seedData');

const User = require('../models/User');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const UserSkill = require('../models/UserSkill');
const CareerSkill = require('../models/CareerSkill');
const Roadmap = require('../models/Roadmap');
const Resource = require('../models/Resource');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Progress = require('../models/Progress');
const Project = require('../models/Project');

let passedTests = 0;
let failedTests = 0;

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details}`);
    failedTests++;
  }
};

const runVerificationTests = async () => {
  console.log('🧪 Starting PHASE 2 Verification Test Suite...\n');

  // 1. SEED DATABASE
  console.log('--- 1. Seeding Database ---');
  await seedData();
  console.log('--- Seed completed successfully ---\n');

  // 2. VERIFY COLLECTIONS & COUNTS
  console.log('--- 2. Verifying Collections & Item Counts ---');
  const userCount = await User.countDocuments();
  assert(userCount >= 2, 'User Collection Count', `(Found: ${userCount}, Expected >= 2)`);

  const skillCount = await Skill.countDocuments();
  assert(skillCount >= 30, 'Skill Collection Count', `(Found: ${skillCount}, Expected >= 30)`);

  const careerCount = await Career.countDocuments();
  assert(careerCount >= 10, 'Career Collection Count', `(Found: ${careerCount}, Expected >= 10)`);

  const careerSkillCount = await CareerSkill.countDocuments();
  assert(careerSkillCount >= 20, 'CareerSkill Requirements Count', `(Found: ${careerSkillCount}, Expected >= 20)`);

  const resourceCount = await Resource.countDocuments();
  assert(resourceCount >= 50, 'Resource Collection Count', `(Found: ${resourceCount}, Expected >= 50)`);

  const projectCount = await Project.countDocuments();
  assert(projectCount >= 10, 'Project Collection Count', `(Found: ${projectCount}, Expected >= 10)`);

  const assessmentCount = await Assessment.countDocuments();
  assert(assessmentCount >= 5, 'Assessment Collection Count', `(Found: ${assessmentCount}, Expected >= 5)`);

  const assessments = await Assessment.find();
  let totalQuestions = 0;
  assessments.forEach(a => { totalQuestions += a.questions.length; });
  assert(totalQuestions >= 50, 'Total Assessment Questions Count', `(Found: ${totalQuestions}, Expected >= 50)`);

  const userSkillCount = await UserSkill.countDocuments();
  assert(userSkillCount >= 1, 'UserSkill Collection Count', `(Found: ${userSkillCount})`);

  const roadmapCount = await Roadmap.countDocuments();
  assert(roadmapCount >= 1, 'Roadmap Collection Count', `(Found: ${roadmapCount})`);

  const assessmentResultCount = await AssessmentResult.countDocuments();
  assert(assessmentResultCount >= 1, 'AssessmentResult Collection Count', `(Found: ${assessmentResultCount})`);

  const progressCount = await Progress.countDocuments();
  assert(progressCount >= 1, 'Progress Collection Count', `(Found: ${progressCount})\n`);

  // 3. VERIFY RELATIONSHIPS & POPULATION
  console.log('--- 3. Verifying Relationships & Population ---');
  const userSkillSample = await UserSkill.findOne().populate('user').populate('skill');
  assert(userSkillSample && userSkillSample.user.name && userSkillSample.skill.name, 'UserSkill -> User & Skill Population');

  const careerSkillSample = await CareerSkill.findOne().populate('career').populate('skill');
  assert(careerSkillSample && careerSkillSample.career.title && careerSkillSample.skill.name, 'CareerSkill -> Career & Skill Population');

  const roadmapSample = await Roadmap.findOne().populate('user').populate('career').populate('steps.skill');
  assert(roadmapSample && roadmapSample.user.name && roadmapSample.career.title && roadmapSample.steps[0].skill.name, 'Roadmap -> User, Career & Steps.Skill Population');

  const resourceSample = await Resource.findOne().populate('skill');
  assert(resourceSample && resourceSample.skill.name, 'Resource -> Skill Population');

  const projectSample = await Project.findOne().populate('requiredSkills').populate('skillsGained');
  assert(projectSample && projectSample.requiredSkills.length > 0 && projectSample.requiredSkills[0].name, 'Project -> requiredSkills Population\n');

  // 4. VERIFY PASSWORD HASHING & SECURITY
  console.log('--- 4. Verifying Password Hashing & Security ---');
  const studentWithPass = await User.findOne({ email: 'student@smartskill.com' }).select('+password');
  assert(studentWithPass.password && studentWithPass.password !== 'Student@123', 'Password is Hashed in DB (Not Plaintext)');
  assert(studentWithPass.password.startsWith('$2a$') || studentWithPass.password.startsWith('$2b$'), 'Password Hash Uses Bcrypt format');

  const correctMatch = await studentWithPass.matchPassword('Student@123');
  assert(correctMatch === true, 'matchPassword returns true for correct password');

  const wrongMatch = await studentWithPass.matchPassword('WrongPassword123');
  assert(wrongMatch === false, 'matchPassword returns false for wrong password');

  // 5. VERIFY PASSWORD FIELD ISN'T RETURNED IN QUERIES/JSON
  console.log('--- 5. Verifying Password Field Isn\'t Returned ---');
  const studentNormalQuery = await User.findOne({ email: 'student@smartskill.com' });
  assert(studentNormalQuery.password === undefined, 'User model query excludes password field by default');

  const studentJSON = studentNormalQuery.toJSON();
  assert(studentJSON.password === undefined, 'User toJSON() strips password field\n');

  // 6. VERIFY QUESTION correctAnswer SECURITY
  console.log('--- 6. Verifying Question correctAnswer Security ---');
  const assessmentSample = await Assessment.findOne();
  assert(assessmentSample.questions[0].correctAnswer === undefined, 'Assessment questions query excludes correctAnswer by default');
  const assessmentJSON = assessmentSample.toJSON();
  assert(assessmentJSON.questions[0].correctAnswer === undefined, 'Assessment toJSON() strips question correctAnswer\n');

  // 7. VERIFY DUPLICATE CONSTRAINTS
  console.log('--- 7. Verifying Unique Constraints ---');
  try {
    await User.create({ name: 'Duplicate User', email: 'student@smartskill.com', password: 'Password@123' });
    assert(false, 'Duplicate User Email Constraint', 'Failed to block duplicate email');
  } catch (err) {
    assert(err.code === 11000 || err.name === 'ValidationError', 'Duplicate User Email Constraint Rejected Duplicate');
  }

  try {
    await Skill.create({ name: 'JavaScript', category: 'Frontend', description: 'Dup test' });
    assert(false, 'Duplicate Skill Name Constraint', 'Failed to block duplicate skill name');
  } catch (err) {
    assert(err.code === 11000 || err.name === 'ValidationError', 'Duplicate Skill Name Constraint Rejected Duplicate');
  }

  try {
    await Career.create({ title: 'Full Stack Developer', slug: 'full-stack-developer', description: 'Dup test', salaryRange: '$50k' });
    assert(false, 'Duplicate Career Title/Slug Constraint', 'Failed to block duplicate career');
  } catch (err) {
    assert(err.code === 11000 || err.name === 'ValidationError', 'Duplicate Career Title/Slug Constraint Rejected Duplicate');
  }

  try {
    const existingUserSkill = await UserSkill.findOne();
    await UserSkill.create({ user: existingUserSkill.user, skill: existingUserSkill.skill, proficiency: 2 });
    assert(false, 'Duplicate UserSkill Compound Index Constraint', 'Failed to block duplicate user+skill');
  } catch (err) {
    assert(err.code === 11000 || err.name === 'ValidationError', 'Duplicate UserSkill (user + skill) Constraint Rejected Duplicate');
  }

  try {
    const existingCareerSkill = await CareerSkill.findOne();
    await CareerSkill.create({ career: existingCareerSkill.career, skill: existingCareerSkill.skill, requiredLevel: 2, priority: 'high' });
    assert(false, 'Duplicate CareerSkill Compound Index Constraint', 'Failed to block duplicate career+skill');
  } catch (err) {
    assert(err.code === 11000 || err.name === 'ValidationError', 'Duplicate CareerSkill (career + skill) Constraint Rejected Duplicate\n');
  }

  // 8. VERIFY INVALID VALUES ARE REJECTED
  console.log('--- 8. Verifying Validation & Enums ---');

  // Invalid proficiency (> 4)
  try {
    const sampleUser = await User.findOne();
    const sampleSkill = await Skill.findOne();
    await UserSkill.create({ user: sampleUser._id, skill: sampleSkill._id, proficiency: 99 });
    assert(false, 'Invalid Proficiency (>4) Validation', 'Failed to reject proficiency 99');
  } catch (err) {
    assert(err.name === 'ValidationError', 'Invalid Proficiency (>4) Rejected by Schema Validation');
  }

  // Invalid priority enum
  try {
    const sampleCareer = await Career.findOne();
    const sampleSkill = await Skill.findOne();
    await CareerSkill.create({ career: sampleCareer._id, skill: sampleSkill._id, requiredLevel: 2, priority: 'super_high' });
    assert(false, 'Invalid Priority Enum Validation', 'Failed to reject priority super_high');
  } catch (err) {
    assert(err.name === 'ValidationError', 'Invalid Priority Enum Rejected by Schema Validation');
  }

  // Invalid user role enum
  try {
    await User.create({ name: 'Role Test', email: 'role@test.com', password: 'Password@123', role: 'superadmin' });
    assert(false, 'Invalid Role Enum Validation', 'Failed to reject role superadmin');
  } catch (err) {
    assert(err.name === 'ValidationError', 'Invalid Role Enum Rejected by Schema Validation');
  }

  // Invalid email format
  try {
    await User.create({ name: 'Email Test', email: 'invalid-email-format', password: 'Password@123' });
    assert(false, 'Invalid Email Format Validation', 'Failed to reject bad email syntax');
  } catch (err) {
    assert(err.name === 'ValidationError', 'Invalid Email Syntax Rejected by Schema Validation');
  }

  // Invalid Resource URL format
  try {
    const sampleSkill = await Skill.findOne();
    await Resource.create({ title: 'Bad URL', url: 'invalid-url-string', type: 'article', skill: sampleSkill._id });
    assert(false, 'Invalid Resource URL Validation', 'Failed to reject invalid URL');
  } catch (err) {
    assert(err.name === 'ValidationError', 'Invalid Resource URL Rejected by Schema Validation\n');
  }

  // FINAL RESULTS SUMMARY
  console.log('==================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('==================================================\n');

  if (failedTests > 0) {
    console.error('❌ Some tests failed. Please inspect errors above.');
    process.exit(1);
  } else {
    console.log('🎉 ALL PHASE 2 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await runVerificationTests();
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = runVerificationTests;
