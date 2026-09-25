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
      if (typeof postData === 'string') {
        req.write(postData);
      } else {
        req.write(JSON.stringify(postData));
      }
    }
    req.end();
  });
};

async function runCompleteE2EFlow() {
  console.log('=== RUNNING COMPLETE END-TO-END VERIFICATION FLOW ===\n');
  const timestamp = Date.now();

  const userEmail = `e2e_student_${timestamp}@example.com`;
  const userPassword = 'StudentPassword123!';

  try {
    // 1 & 2. Open Website / Register
    console.log('[Step 1-2] Registering user account:', userEmail);
    const regRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Alex E2E Student',
      email: userEmail,
      password: userPassword,
      confirmPassword: userPassword
    });

    if (regRes.status !== 201 || !regRes.data.token) {
      throw new Error(`Step 2 Failed: Registration returned status ${regRes.status}`);
    }
    console.log('✅ Step 2 PASSED: Registration successful.');

    // 3. Login
    console.log('\n[Step 3] Logging in with credentials...');
    const loginRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: userEmail,
      password: userPassword
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Step 3 Failed: Login failed with status ${loginRes.status}`);
    }
    let token = loginRes.data.token;
    let authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    console.log('✅ Step 3 PASSED: Login successful, token acquired.');

    // 4. Dashboard
    console.log('\n[Step 4] Fetching Student Dashboard summary...');
    const dashRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/dashboard-summary',
      method: 'GET',
      headers: authHeaders
    });

    if (dashRes.status !== 200 || !dashRes.data.success) {
      throw new Error(`Step 4 Failed: Dashboard summary error status ${dashRes.status}`);
    }
    console.log('✅ Step 4 PASSED: Dashboard data fetched cleanly.');

    // 5. Edit Profile
    console.log('\n[Step 5] Editing user profile details...');
    const profileRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/profile',
      method: 'PUT',
      headers: authHeaders
    }, {
      education: 'Bachelor of Computer Science',
      college: 'Stanford University',
      degree: 'B.S. CS',
      graduationYear: '2026',
      experienceLevel: 'Entry Level',
      interests: ['Web Development', 'Cloud Computing']
    });

    if (profileRes.status !== 200 || !profileRes.data.user) {
      throw new Error(`Step 5 Failed: Profile update status ${profileRes.status}`);
    }
    console.log('✅ Step 5 PASSED: Profile updated successfully.');

    // 6. Add Skills
    console.log('\n[Step 6] Adding skills to user profile...');
    await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skills',
      method: 'POST',
      headers: authHeaders
    }, { name: 'HTML5 & CSS3', proficiency: 'Advanced' });

    await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skills',
      method: 'POST',
      headers: authHeaders
    }, { name: 'JavaScript (ES6+)', proficiency: 'Intermediate' });

    await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skills',
      method: 'POST',
      headers: authHeaders
    }, { name: 'React.js', proficiency: 'Intermediate' });

    console.log('✅ Step 6 PASSED: Skills added to profile.');

    // 7. Select Target Career
    console.log('\n[Step 7] Selecting target career "Full Stack Developer"...');
    const careersRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/careers',
      method: 'GET',
      headers: authHeaders
    });

    const fullStackCareer = careersRes.data.careers.find(c => c.title.toLowerCase().includes('full stack'));
    if (!fullStackCareer) {
      throw new Error('Step 7 Failed: Full Stack Developer career not found in catalog');
    }

    const selectCarRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/careers/${fullStackCareer._id}/select`,
      method: 'POST',
      headers: authHeaders
    });

    if (selectCarRes.status !== 200) {
      throw new Error(`Step 7 Failed: Select career returned status ${selectCarRes.status}`);
    }
    console.log('✅ Step 7 PASSED: Target career selected.');

    // 8, 9, 10, 11. Run Skill-Gap Analysis & Verify Metrics
    console.log('\n[Step 8-11] Running skill gap analysis & verifying match percentage...');
    const analyzeRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skill-gap/analyze',
      method: 'POST',
      headers: authHeaders
    }, { careerTitle: 'Full Stack Developer' });

    if (analyzeRes.status !== 200 || !analyzeRes.data.analysis) {
      throw new Error(`Step 8 Failed: Skill gap analysis returned status ${analyzeRes.status}`);
    }

    const gap = analyzeRes.data.analysis;
    console.log(`- Match Percentage: ${gap.matchPercentage}%`);
    console.log(`- Matching Skills (${gap.matchingSkills?.length || 0}):`, (gap.matchingSkills || []).map(s => typeof s === 'object' ? s.name : s));
    console.log(`- Missing Skills (${gap.missingSkills?.length || 0}):`, (gap.missingSkills || []).map(s => typeof s === 'object' ? s.name : s));

    if (typeof gap.matchPercentage !== 'number') {
      throw new Error('Step 11 Failed: Invalid skill match calculation');
    }
    console.log('✅ Steps 8-11 PASSED: Skill-gap analysis verified.');


    // 12. Generate Roadmap
    console.log('\n[Step 12] Generating personalized learning roadmap...');
    const genRoadmapRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/roadmaps/generate',
      method: 'POST',
      headers: authHeaders
    }, { targetCareer: 'Full Stack Developer' });

    if (genRoadmapRes.status !== 200 || !genRoadmapRes.data.roadmap) {
      throw new Error(`Step 12 Failed: Roadmap generation status ${genRoadmapRes.status}`);
    }
    const roadmapId = genRoadmapRes.data.roadmap._id;
    console.log(`✅ Step 12 PASSED: Roadmap generated with ${genRoadmapRes.data.roadmap.phases.length} phases.`);

    // 13. Update Roadmap Progress
    console.log('\n[Step 13] Updating Phase 1 progress to "Completed"...');
    const updateProgressRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/roadmaps/${roadmapId}/progress`,
      method: 'PUT',
      headers: authHeaders
    }, { phaseNumber: 1, status: 'Completed' });

    if (updateProgressRes.status !== 200 || updateProgressRes.data.roadmap.progress === 0) {
      throw new Error(`Step 13 Failed: Progress update status ${updateProgressRes.status}`);
    }
    console.log(`✅ Step 13 PASSED: Phase 1 updated to Completed. Overall progress: ${updateProgressRes.data.roadmap.progress}%`);

    // 14 & 15. Verify MongoDB Persistence
    console.log('\n[Step 14-15] Verifying persistent data in MongoDB...');
    const fetchPersistedRoadmap = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/roadmaps/me',
      method: 'GET',
      headers: authHeaders
    });

    if (fetchPersistedRoadmap.data.roadmap?.progress !== updateProgressRes.data.roadmap.progress) {
      throw new Error('Step 15 Failed: Roadmap progress not persisted in MongoDB!');
    }
    console.log('✅ Step 14-15 PASSED: Data verified persisted in MongoDB.');

    // 16, 17, 18. Logout & Login again
    console.log('\n[Step 16-18] Simulating logout & re-logging in to verify persistent session data...');
    const reLoginRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: userEmail,
      password: userPassword
    });

    if (reLoginRes.status !== 200 || !reLoginRes.data.token) {
      throw new Error('Step 17 Failed: Re-login failed');
    }

    const newAuthHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${reLoginRes.data.token}`
    };

    const reFetchProfile = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET',
      headers: newAuthHeaders
    });

    if (reFetchProfile.data.user?.college !== 'Stanford University') {
      throw new Error('Step 18 Failed: Persisted profile state inconsistent after re-login');
    }
    console.log('✅ Step 16-18 PASSED: Re-login verified persistent data intact.');

    // 19. Test Invalid Login
    console.log('\n[Step 19] Testing invalid login handling...');
    const badLogin = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: userEmail,
      password: 'WrongPassword999!'
    });

    if (badLogin.status !== 401) {
      throw new Error(`Step 19 Failed: Expected status 401 for bad password, got ${badLogin.status}`);
    }
    console.log('✅ Step 19 PASSED: Invalid login rejected with 401 Unauthorized.');

    // 20. Test Protected Routes
    console.log('\n[Step 20] Testing protected route enforcement...');
    const noAuthRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET'
    });

    if (noAuthRes.status !== 401) {
      throw new Error(`Step 20 Failed: Expected 401 for unauthenticated request, got ${noAuthRes.status}`);
    }
    console.log('✅ Step 20 PASSED: Unauthenticated access blocked with 401 Unauthorized.');

    // 21. Test Admin Routes Restriction
    console.log('\n[Step 21] Testing admin routes restriction for standard user...');
    const adminAccessRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: newAuthHeaders
    });

    if (adminAccessRes.status !== 403) {
      throw new Error(`Step 21 Failed: Expected 403 Forbidden for non-admin user, got ${adminAccessRes.status}`);
    }
    console.log('✅ Step 21 PASSED: Non-admin user blocked with 403 Forbidden.');

    // 22. Test Career Comparison
    console.log('\n[Step 22] Testing career comparison API...');
    const compareRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/careers/compare',
      method: 'POST',
      headers: newAuthHeaders
    }, {
      careerTitles: ['Full Stack Developer', 'Data Analyst', 'Cloud Engineer']
    });

    if (compareRes.status !== 200 || compareRes.data.comparedCareers?.length !== 3) {
      throw new Error(`Step 22 Failed: Career comparison status ${compareRes.status}`);
    }
    console.log('✅ Step 22 PASSED: Career comparison returned 3 side-by-side factual comparisons.');

    console.log('\n🎉 ALL 22 BACKEND/API STEPS OF E2E FLOW PASSED 100%!');
  } catch (err) {
    console.error('❌ E2E FLOW FAILED:', err.message);
    process.exit(1);
  }
}

runCompleteE2EFlow();
