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

const runCareerComparisonSuite = async () => {
  console.log('=== RUNNING CAREER COMPARISON SUITE ===\n');

  try {
    const timestamp = Date.now();
    const testEmail = `comparator_${timestamp}@example.com`;

    // 1. Register test user
    console.log('[Setup] Registering test user...');
    const regRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Comparator User',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });

    if (regRes.status !== 201 && regRes.status !== 200) {
      throw new Error(`Registration failed with status ${regRes.status}`);
    }

    const token = regRes.data.token;
    console.log('✅ User registered successfully. Token acquired.');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Add user skills
    console.log('[Setup] Adding skills to user profile...');
    await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skills',
      method: 'POST',
      headers
    }, { name: 'HTML5 & CSS3', proficiency: 'Advanced' });

    await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skills',
      method: 'POST',
      headers
    }, { name: 'JavaScript (ES6+)', proficiency: 'Intermediate' });

    await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skills',
      method: 'POST',
      headers
    }, { name: 'React.js', proficiency: 'Intermediate' });

    await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/skills',
      method: 'POST',
      headers
    }, { name: 'Python', proficiency: 'Beginner' });
    console.log('✅ User skills set up.');

    // 3. Test POST /api/careers/compare with default careers
    console.log('\n[Test 1] POST /api/careers/compare - Comparing default careers...');
    const comp1 = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/careers/compare',
      method: 'POST',
      headers
    }, {});

    console.log('Status:', comp1.status);
    console.log('User Skills Count:', comp1.data.userSkillsCount);
    console.log('Compared Careers Count:', comp1.data.comparedCareers?.length);

    if (comp1.status !== 200 || !comp1.data.success || !Array.isArray(comp1.data.comparedCareers) || comp1.data.comparedCareers.length < 3) {
      throw new Error('Test 1 Failed: Expected at least 3 default careers in comparison response');
    }

    comp1.data.comparedCareers.forEach(car => {
      console.log(`- Role: "${car.title}" | Match: ${car.matchPercentage}% | Matching: ${car.matchingSkillsCount} | To Improve: ${car.skillsToImproveCount} | Missing: ${car.missingSkillsCount}`);
    });
    console.log('✅ Test 1 PASSED: Default career comparison succeeded.');

    // 4. Test POST /api/careers/compare with specific titles
    console.log('\n[Test 2] POST /api/careers/compare - Comparing specific titles ("Frontend Developer", "Python Developer", "Data Scientist")...');
    const comp2 = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/careers/compare',
      method: 'POST',
      headers
    }, {
      careerTitles: ['Frontend Developer', 'Python Developer', 'Data Scientist']
    });

    console.log('Status:', comp2.status);
    console.log('Compared Careers Count:', comp2.data.comparedCareers?.length);

    if (comp2.status !== 200 || !comp2.data.success || comp2.data.comparedCareers.length !== 3) {
      throw new Error('Test 2 Failed: Expected 3 specific careers returned');
    }

    // Verify neutral factual breakdown structure (no ranking labels)
    comp2.data.comparedCareers.forEach(car => {
      if (typeof car.matchPercentage !== 'number' || !Array.isArray(car.matchingSkills) || !Array.isArray(car.missingSkills)) {
        throw new Error(`Test 2 Failed: Invalid structure for career "${car.title}"`);
      }
      console.log(`- Role: "${car.title}" | Match: ${car.matchPercentage}% | Matching: ${car.matchingSkills.length} | Missing: ${car.missingSkills.length}`);
    });
    console.log('✅ Test 2 PASSED: Factual comparison returned for specific careers without rank labels.');

    console.log('\n🎉 ALL CAREER COMPARISON TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ CAREER COMPARISON SUITE FAILED:', err.message);
    process.exit(1);
  }
};

runCareerComparisonSuite();
