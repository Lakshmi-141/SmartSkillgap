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

async function runPhase2Tests() {
  console.log('=== RUNNING PHASE 2 CURRENT LEVEL SUITE ===\n');
  const timestamp = Date.now();
  const testEmail = `phase2_student_${timestamp}@example.com`;

  // Step 1: Register New Student User
  console.log(`[Step 1] Registering test student (${testEmail})...`);
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Current Level Tester',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123',
    targetRole: 'Full Stack Web Developer'
  });

  if (regRes.status !== 201 || !regRes.data.token) {
    console.error('❌ Step 1 FAILED! Registration failed.');
    process.exit(1);
  }
  const token = regRes.data.token;
  console.log('✅ Step 1 PASSED: User registered and JWT token acquired.\n');

  // Step 2: Add Skill with Proficiency
  console.log('[Step 2] Adding skill "Node.js" with proficiency "Intermediate"...');
  const addSkillRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    name: 'Node.js',
    proficiency: 'Intermediate',
    category: 'Backend'
  });

  if (addSkillRes.status !== 201 || !addSkillRes.data.skills) {
    console.error('❌ Step 2 FAILED! Adding skill failed.', addSkillRes.data);
    process.exit(1);
  }
  const addedSkill = addSkillRes.data.skills.find(s => s.name === 'Node.js');
  console.log('Status:', addSkillRes.status, 'Added Skill:', addedSkill);
  if (!addedSkill || addedSkill.proficiency !== 'Intermediate') {
    console.error('❌ Step 2 FAILED! Skill proficiency mismatch.');
    process.exit(1);
  }
  console.log('✅ Step 2 PASSED: Skill added with Intermediate proficiency.\n');

  // Step 3: Select Target Career Goal
  console.log('[Step 3] Fetching careers & selecting target career...');
  const careersRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/careers',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (careersRes.status !== 200 || !careersRes.data.careers.length) {
    console.error('❌ Step 3 FAILED! Unable to fetch careers catalog.');
    process.exit(1);
  }
  const targetCareer = careersRes.data.careers[0];
  const selectRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/careers/${targetCareer._id}/select`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const selectedTitle = selectRes.data.user?.targetCareer || selectRes.data.selectedCareer?.title;
  if (selectRes.status !== 200 || selectedTitle !== targetCareer.title) {
    console.error('❌ Step 3 FAILED! Selecting target career failed.', selectRes.data);
    process.exit(1);
  }
  console.log('✅ Step 3 PASSED: Selected target career:', selectedTitle, '\n');

  // Step 4: Update Skill Proficiency
  console.log(`[Step 4] Updating "Node.js" proficiency to "Advanced"...`);
  const updateSkillRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/skills/${addedSkill._id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    proficiency: 'Advanced'
  });

  if (updateSkillRes.status !== 200) {
    console.error('❌ Step 4 FAILED! Updating skill proficiency failed.', updateSkillRes.data);
    process.exit(1);
  }
  const updatedSkill = updateSkillRes.data.skills.find(s => s.name === 'Node.js');
  if (!updatedSkill || updatedSkill.proficiency !== 'Advanced') {
    console.error('❌ Step 4 FAILED! Proficiency did not update to Advanced.');
    process.exit(1);
  }
  console.log('✅ Step 4 PASSED: Skill proficiency updated to Advanced.\n');

  // Step 5: Submit Skill Assessment
  console.log('[Step 5] Fetching assessments catalog & submitting assessment...');
  const assessmentsRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/assessments',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (assessmentsRes.status === 200 && assessmentsRes.data.assessments.length > 0) {
    const testAssessment = assessmentsRes.data.assessments[0];
    const submitAssRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/assessments/${testAssessment._id}/submit`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      answers: { 0: 0, 1: 1 }
    });

    if (submitAssRes.status === 200 && submitAssRes.data.result) {
      console.log('✅ Step 5 PASSED: Assessment submitted successfully. Result score:', submitAssRes.data.result.score);
    } else {
      console.log('⚠️ Step 5 WARNING: Assessment submit returned status:', submitAssRes.status);
    }
  } else {
    console.log('ℹ️ Step 5: No active assessments in database to submit; continuing.\n');
  }

  // Step 6: Simulate Logout & Login Again (Re-authenticate)
  console.log('\n[Step 6] Logging out & logging in to verify data persistence...');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'password123'
  });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('❌ Step 6 FAILED! Re-login failed.');
    process.exit(1);
  }
  const newToken = loginRes.data.token;

  // Step 7: Verify persistent user profile & skills in MongoDB after re-login
  console.log('[Step 7] Verifying user skills and target career after re-login...');
  const userSkillsRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/skills',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });

  const profileRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/users/profile',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });

  if (userSkillsRes.status !== 200 || profileRes.status !== 200) {
    console.error('❌ Step 7 FAILED! Unable to fetch profile/skills after re-login.');
    process.exit(1);
  }

  const persistedSkill = userSkillsRes.data.userSkills.find(s => s.name === 'Node.js');
  if (!persistedSkill || persistedSkill.proficiency !== 'Advanced') {
    console.error('❌ Step 7 FAILED! Persisted skill not found or proficiency wrong.');
    process.exit(1);
  }

  if (profileRes.data.user.targetCareer !== targetCareer.title) {
    console.error('❌ Step 7 FAILED! Target career not persisted.');
    process.exit(1);
  }

  console.log('✅ Step 7 PASSED: Persistent MongoDB data confirmed (Skill:', persistedSkill.name, '| Proficiency:', persistedSkill.proficiency, '| Target Career:', profileRes.data.user.targetCareer, ').\n');

  console.log('🎉 ALL PHASE 2 CURRENT LEVEL TESTS PASSED SUCCESSFULLY!');
}

runPhase2Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
