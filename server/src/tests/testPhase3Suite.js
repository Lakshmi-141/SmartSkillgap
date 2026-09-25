const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runPhase3Tests() {
  console.log('=== RUNNING PHASE 3 USER PROFILE & SKILL MANAGEMENT SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `profileuser_${timestamp}@example.com`;

  // 1. Register User to obtain JWT
  console.log('[Setup] Registering test user...');
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Sarah Connor',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Full Stack Web Developer'
  });

  const token = regRes.data.token;
  if (!token) {
    console.error('❌ Setup failed: Token missing');
    process.exit(1);
  }
  console.log('✅ User registered successfully. Token acquired.\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: GET /api/users/profile
  console.log('[Test 1] GET /api/users/profile...');
  const profileRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/users/profile',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', profileRes.status, 'User Name:', profileRes.data.user?.name);
  if (profileRes.status !== 200 || !profileRes.data.user) {
    console.error('❌ Test 1 FAILED! Unable to get user profile.');
    process.exit(1);
  }
  console.log('✅ Test 1 PASSED: Profile fetched successfully.\n');

  // Test 2: PUT /api/users/profile
  console.log('[Test 2] PUT /api/users/profile - Updating profile details...');
  const updateRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/users/profile',
    method: 'PUT',
    headers: authHeaders
  }, {
    education: 'Bachelor of Technology',
    college: 'MIT Institute of Technology',
    degree: 'Computer Science & Engineering',
    graduationYear: '2025',
    experienceLevel: 'Intermediate',
    interests: ['Web Development', 'Cloud Computing', 'AI Solutions'],
    targetCareer: 'Full Stack Web Developer'
  });

  console.log('Status:', updateRes.status, 'College:', updateRes.data.user?.college);
  if (updateRes.status !== 200 || updateRes.data.user?.college !== 'MIT Institute of Technology') {
    console.error('❌ Test 2 FAILED! Profile update failed.');
    process.exit(1);
  }
  console.log('✅ Test 2 PASSED: Profile updated successfully.\n');

  // Test 3: GET /api/skills
  console.log('[Test 3] GET /api/skills - Fetching skills catalog...');
  const skillsRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Status:', skillsRes.status, 'Master Skills Count:', skillsRes.data.masterSkills?.length);
  if (skillsRes.status !== 200 || !Array.isArray(skillsRes.data.masterSkills)) {
    console.error('❌ Test 3 FAILED! Master skills catalog missing.');
    process.exit(1);
  }
  console.log('✅ Test 3 PASSED: Master skills catalog loaded.\n');

  // Test 4: POST /api/skills - Add Skill
  console.log('[Test 4] POST /api/skills - Adding React.js skill (Advanced)...');
  const addSkillRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: authHeaders
  }, {
    name: 'React.js',
    proficiency: 'Advanced',
    category: 'Frontend'
  });

  console.log('Status:', addSkillRes.status, 'User Skills:', addSkillRes.data.skills);
  const addedSkill = addSkillRes.data.skills?.find(s => s.name === 'React.js');

  if (addSkillRes.status !== 201 || !addedSkill || addedSkill.proficiency !== 'Advanced') {
    console.error('❌ Test 4 FAILED! Skill addition failed.');
    process.exit(1);
  }
  console.log('✅ Test 4 PASSED: React.js added to user skills with Advanced proficiency.\n');

  // Test 5: PUT /api/skills/:id - Update Proficiency
  const skillId = addedSkill._id;
  console.log(`[Test 5] PUT /api/skills/${skillId} - Updating proficiency to Expert...`);
  const updateSkillRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/skills/${skillId}`,
    method: 'PUT',
    headers: authHeaders
  }, {
    proficiency: 'Expert'
  });

  const updatedSkill = updateSkillRes.data.skills?.find(s => s._id === skillId);
  console.log('Status:', updateSkillRes.status, 'New Proficiency:', updatedSkill?.proficiency);

  if (updateSkillRes.status !== 200 || updatedSkill?.proficiency !== 'Expert') {
    console.error('❌ Test 5 FAILED! Skill proficiency update failed.');
    process.exit(1);
  }
  console.log('✅ Test 5 PASSED: Skill proficiency updated to Expert.\n');

  // Test 6: DELETE /api/skills/:id - Delete Skill
  console.log(`[Test 6] DELETE /api/skills/${skillId} - Removing skill...`);
  const delSkillRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/skills/${skillId}`,
    method: 'DELETE',
    headers: authHeaders
  });

  console.log('Status:', delSkillRes.status, 'Remaining Skills:', delSkillRes.data.skills?.length);
  if (delSkillRes.status !== 200 || delSkillRes.data.skills?.length !== 0) {
    console.error('❌ Test 6 FAILED! Skill deletion failed.');
    process.exit(1);
  }
  console.log('✅ Test 6 PASSED: Skill removed successfully.\n');

  console.log('🎉 ALL PHASE 3 PROFILE & SKILL API TESTS PASSED SUCCESSFULLY!');
}

runPhase3Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
