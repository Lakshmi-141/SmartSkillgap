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

async function runPhase5CheckpointTests() {
  console.log('=== RUNNING PHASE 5 PROJECT RECOMMENDATIONS CHECKPOINT ===\n');
  const timestamp = Date.now();
  const testEmail = `project_student_${timestamp}@example.com`;

  // Step 1: Register Student User
  console.log(`[Step 1] Registering student user (${testEmail})...`);
  const regRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Project Scholar',
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
  console.log('✅ Step 1 PASSED: Registered & JWT acquired.\n');

  // Step 2: Fetch Project Recommendations
  console.log('[Step 2] GET /api/projects/recommendations - Fetching project recommendations...');
  const recRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/projects/recommendations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (recRes.status !== 200 || !recRes.data.recommendations.length) {
    console.error('❌ Step 2 FAILED! Unable to fetch project recommendations.', recRes.data);
    process.exit(1);
  }
  const projectList = recRes.data.recommendations;
  const sampleProj = projectList[0];
  console.log(`Status: 200 | Recommendations Count: ${projectList.length} | Top Recommendation: "${sampleProj.title}"`);
  
  // Verify required schema fields
  if (!sampleProj.title || !sampleProj.description || !sampleProj.difficulty || !Array.isArray(sampleProj.skillsGained)) {
    console.error('❌ Step 2 FAILED! Missing required project schema fields.', sampleProj);
    process.exit(1);
  }
  console.log('✅ Step 2 PASSED: Project recommendations fetched and fields verified.\n');

  // Step 3: Update Project Progress Status to "IN_PROGRESS"
  console.log(`[Step 3] POST /api/projects/${sampleProj._id}/progress - Updating status to IN_PROGRESS...`);
  const updateRes1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/projects/${sampleProj._id}/progress`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    status: 'IN_PROGRESS',
    notes: 'Started building frontend components'
  });

  if (updateRes1.status !== 200 || updateRes1.data.progress.status !== 'IN_PROGRESS') {
    console.error('❌ Step 3 FAILED! Updating project progress to IN_PROGRESS failed.', updateRes1.data);
    process.exit(1);
  }
  console.log('✅ Step 3 PASSED: Project status updated to IN_PROGRESS.\n');

  // Step 4: Update Project Progress Status to "COMPLETED"
  console.log(`[Step 4] POST /api/projects/${sampleProj._id}/progress - Updating status to COMPLETED...`);
  const updateRes2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: `/api/projects/${sampleProj._id}/progress`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    status: 'COMPLETED',
    githubRepoUrl: 'https://github.com/example/my-smart-project'
  });

  if (updateRes2.status !== 200 || updateRes2.data.progress.status !== 'COMPLETED') {
    console.error('❌ Step 4 FAILED! Updating project progress to COMPLETED failed.', updateRes2.data);
    process.exit(1);
  }
  console.log('✅ Step 4 PASSED: Project status updated to COMPLETED.\n');

  // Step 5: Re-authenticate & verify persistent progress in MongoDB
  console.log('[Step 5] Logging out & logging back in to verify MongoDB project progress persistence...');
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
  const newToken = loginRes.data.token;

  const fetchRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/projects/recommendations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${newToken}` }
  });

  if (fetchRes.status !== 200 || !fetchRes.data.recommendations) {
    console.error('❌ Step 5 FAILED! Unable to retrieve recommendations after re-login.');
    process.exit(1);
  }

  const persistedProj = fetchRes.data.recommendations.find(p => p._id === sampleProj._id);
  if (!persistedProj || persistedProj.userStatus !== 'COMPLETED' || persistedProj.githubRepoUrl !== 'https://github.com/example/my-smart-project') {
    console.error('❌ Step 5 FAILED! Persisted project status or github URL mismatch.', persistedProj);
    process.exit(1);
  }

  console.log(`✅ Step 5 PASSED: Persistent MongoDB project progress confirmed (Title: "${persistedProj.title}" | Status: ${persistedProj.userStatus} | Repo: ${persistedProj.githubRepoUrl}).\n`);

  console.log('🎉 ALL PHASE 5 PROJECT RECOMMENDATIONS TESTS PASSED SUCCESSFULLY!');
}

runPhase5CheckpointTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
