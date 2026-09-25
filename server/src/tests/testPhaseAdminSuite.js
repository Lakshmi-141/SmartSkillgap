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

async function runAdminSuite() {
  console.log('=== RUNNING ADMIN PANEL & ROLE AUTHORIZATION SUITE ===\n');
  const timestamp = Date.now();

  try {
    // 1. Register normal USER
    console.log('[Setup] Registering standard USER account...');
    const userRegRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Standard User',
      email: `stduser_${timestamp}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });

    const userToken = userRegRes.data.token;
    console.log('✅ Standard USER registered. Role:', userRegRes.data.user.role);

    // 2. Register ADMIN user with role: 'ADMIN'
    console.log('[Setup] Registering ADMIN account...');
    const adminRegRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'System Admin',
      email: `admin_${timestamp}@example.com`,
      password: 'AdminPassword123!',
      confirmPassword: 'AdminPassword123!',
      role: 'ADMIN'
    });

    const adminToken = adminRegRes.data.token;
    console.log('✅ Account registered as ADMIN role. Role:', adminRegRes.data.user.role);

    const userHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` };
    const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };

    // 3. Test Access Restriction: Normal USER must receive 403 Forbidden on admin APIs
    console.log('\n[Test 1] GET /api/admin/users - Testing access restriction for normal USER...');
    const userRestrictedRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: userHeaders
    });

    console.log('User Access Status Code:', userRestrictedRes.status);
    if (userRestrictedRes.status !== 403) {
      throw new Error(`Test 1 Failed: Expected status 403 Forbidden for standard user, got ${userRestrictedRes.status}`);
    }
    console.log('✅ Test 1 PASSED: Normal USER correctly received 403 Forbidden.');

    // 4. Test ADMIN Access: GET /api/admin/users & GET /api/admin/statistics
    console.log('\n[Test 2] GET /api/admin/users & /api/admin/statistics - Fetching admin data...');
    const adminUsersRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: adminHeaders
    });

    console.log('Admin Users Status:', adminUsersRes.status, '| Count:', adminUsersRes.data.count);
    if (adminUsersRes.status !== 200 || !adminUsersRes.data.success) {
      throw new Error('Test 2 Failed: Admin failed to retrieve user list');
    }

    const adminStatsRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/statistics',
      method: 'GET',
      headers: adminHeaders
    });

    console.log('Admin Stats Status:', adminStatsRes.status, '| Total Users:', adminStatsRes.data.statistics?.totalUsers);
    if (adminStatsRes.status !== 200 || !adminStatsRes.data.statistics) {
      throw new Error('Test 2 Failed: Admin failed to retrieve platform statistics');
    }
    console.log('✅ Test 2 PASSED: ADMIN successfully accessed administrative statistics and user list.');

    // 5. Test Career CRUD Operations (POST, PUT, DELETE /api/careers)
    console.log('\n[Test 3] Career CRUD - Creating, updating, and deleting career path...');
    const newCareerData = {
      title: `Quantum Architect ${timestamp}`,
      description: 'Design quantum algorithms and hybrid HPC architectures.',
      requiredSkills: [{ name: 'Quantum Computing', importance: 'Core', category: 'Physics' }]
    };

    const createCareerRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/careers',
      method: 'POST',
      headers: adminHeaders
    }, newCareerData);

    console.log('Create Career Status:', createCareerRes.status);
    if (createCareerRes.status !== 201 || !createCareerRes.data.career) {
      throw new Error('Test 3 Failed: Admin failed to create new career');
    }
    const createdCareerId = createCareerRes.data.career._id;

    // Update Career
    const updateCareerRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/careers/${createdCareerId}`,
      method: 'PUT',
      headers: adminHeaders
    }, {
      description: 'Updated Quantum Architect Description with Qiskit proficiency.'
    });

    console.log('Update Career Status:', updateCareerRes.status);
    if (updateCareerRes.status !== 200 || !updateCareerRes.data.career) {
      throw new Error('Test 3 Failed: Admin failed to update career');
    }

    // Delete Career
    const deleteCareerRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/careers/${createdCareerId}`,
      method: 'DELETE',
      headers: adminHeaders
    });

    console.log('Delete Career Status:', deleteCareerRes.status);
    if (deleteCareerRes.status !== 200) {
      throw new Error('Test 3 Failed: Admin failed to delete career');
    }
    console.log('✅ Test 3 PASSED: Career CRUD operations (Create, Read, Update, Delete) completed successfully.');

    // 6. Test Master Skill Catalog CRUD (POST, PUT, DELETE /api/admin/skills)
    console.log('\n[Test 4] Master Skill Catalog CRUD - Creating, updating, and deleting catalog skill...');
    const newSkillData = {
      name: `Qiskit Framework ${timestamp}`,
      category: 'Quantum AI',
      description: 'SDK for working with quantum computers.'
    };

    const createSkillRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/admin/skills',
      method: 'POST',
      headers: adminHeaders
    }, newSkillData);

    console.log('Create Skill Status:', createSkillRes.status);
    if (createSkillRes.status !== 201 || !createSkillRes.data.skill) {
      throw new Error('Test 4 Failed: Admin failed to create master catalog skill');
    }
    const createdSkillId = createSkillRes.data.skill._id;

    // Update Skill
    const updateSkillRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/admin/skills/${createdSkillId}`,
      method: 'PUT',
      headers: adminHeaders
    }, {
      description: 'Updated Qiskit SDK description.'
    });

    console.log('Update Skill Status:', updateSkillRes.status);
    if (updateSkillRes.status !== 200) {
      throw new Error('Test 4 Failed: Admin failed to update master catalog skill');
    }

    // Delete Skill
    const deleteSkillRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/admin/skills/${createdSkillId}`,
      method: 'DELETE',
      headers: adminHeaders
    });

    console.log('Delete Skill Status:', deleteSkillRes.status);
    if (deleteSkillRes.status !== 200) {
      throw new Error('Test 4 Failed: Admin failed to delete master catalog skill');
    }
    console.log('✅ Test 4 PASSED: Skill Catalog CRUD operations completed successfully.');

    console.log('\n🎉 ALL ADMIN PANEL & AUTHORIZATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ ADMIN SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runAdminSuite();
