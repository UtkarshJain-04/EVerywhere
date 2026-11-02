const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf-8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING CHARGENAV BACKEND SUITE');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  const port = process.env.PORT || 5000;
  const baseOptions = {
    hostname: '127.0.0.1',
    port,
    headers: { 'Content-Type': 'application/json' },
  };

  // Wait 1.5s for server and Mongo to establish
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // 1. Health Check
    const health = await makeRequest({
      ...baseOptions,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check returns 200 OK and healthy status');

    // 2. Stations listing
    const stations = await makeRequest({
      ...baseOptions,
      path: '/api/stations',
      method: 'GET',
    });
    assert(stations.status === 200 && stations.data.count === 15, `Stations endpoint returns all 15 stations (got ${stations.data?.count})`);

    // 3. Station filtering by speed
    const fastStations = await makeRequest({
      ...baseOptions,
      path: '/api/stations?minSpeed=25',
      method: 'GET',
    });
    assert(
      fastStations.status === 200 && fastStations.data.data.every((s) => Number(s.capacity) >= 25),
      'Stations filter by minSpeed=25 returns only high-speed chargers'
    );

    // 4. Station filtering by availability
    const availStations = await makeRequest({
      ...baseOptions,
      path: '/api/stations?availableOnly=true',
      method: 'GET',
    });
    assert(
      availStations.status === 200 && availStations.data.data.every((s) => Number(s.available) > 0),
      'Stations filter by availableOnly=true excludes zero-available chargers'
    );

    // 5. Get station by ID
    const singleStation = await makeRequest({
      ...baseOptions,
      path: '/api/stations/EESL428',
      method: 'GET',
    });
    assert(
      singleStation.status === 200 && singleStation.data.data.uid === 'EESL428',
      'Get station by ID (EESL428) retrieves correct station metadata'
    );

    // 6. Python Recommendation Engine (Coordinates)
    const recResponse = await makeRequest(
      {
        ...baseOptions,
        path: '/api/recommendations',
        method: 'POST',
      },
      {
        latitude: 28.543,
        longitude: 77.257,
        battery: 35,
        min_charging_speed: 15,
      }
    );
    assert(
      recResponse.status === 200 && recResponse.data.success === true && recResponse.data.total > 0,
      `Python Recommendation Engine returns ranked candidates (got ${recResponse.data.total} stations)`
    );

    // Verify 50/50 scoring order
    if (recResponse.data?.results?.length > 1) {
      const isSorted = recResponse.data.results.every((item, i, arr) => i === 0 || arr[i - 1].score >= item.score);
      assert(isSorted, 'Recommendations are correctly ranked in descending score order');
    }

    // 7. Recommendation Engine with impossible filter (empty result handling)
    const emptyRec = await makeRequest(
      {
        ...baseOptions,
        path: '/api/recommendations',
        method: 'POST',
      },
      {
        latitude: 28.543,
        longitude: 77.257,
        min_charging_speed: 150, // Impossible in this dataset
      }
    );
    assert(
      emptyRec.status === 200 && emptyRec.data.total === 0,
      'Python Recommendation Engine handles zero-result criteria safely without error'
    );

    // 8. Route Planner
    const routePlan = await makeRequest(
      {
        ...baseOptions,
        path: '/api/recommendations/route',
        method: 'POST',
      },
      {
        from: 'Connaught Place',
        to: 'Hauz Khas',
        battery: 60,
        minSpeed: 10,
      }
    );
    assert(
      routePlan.status === 200 &&
        routePlan.data.success === true &&
        routePlan.data.route.roadDistanceKm > 0 &&
        routePlan.data.recommendations.length > 0,
      `Route Planner calculates route and corridor recommendations (${routePlan.data?.route?.roadDistanceKm} km)`
    );

    // 9. User Signup
    const testEmail = `testuser_${Date.now()}@example.com`;
    const signupRes = await makeRequest(
      {
        ...baseOptions,
        path: '/api/auth/signup',
        method: 'POST',
      },
      {
        name: 'Test Driver',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }
    );
    assert(
      signupRes.status === 201 && signupRes.data.success === true && Boolean(signupRes.data.token),
      'User signup creates account in MongoDB and returns JWT token'
    );

    const token = signupRes.data.token;

    // 10. Duplicate Signup Rejection
    const dupSignup = await makeRequest(
      {
        ...baseOptions,
        path: '/api/auth/signup',
        method: 'POST',
      },
      {
        name: 'Test Driver',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }
    );
    assert(dupSignup.status === 409, 'Duplicate signup with existing email is rejected with 409 Conflict');

    // 11. User Login
    const loginRes = await makeRequest(
      {
        ...baseOptions,
        path: '/api/auth/login',
        method: 'POST',
      },
      {
        email: testEmail,
        password: 'Password123!',
      }
    );
    assert(
      loginRes.status === 200 && loginRes.data.success === true && Boolean(loginRes.data.token),
      'User login succeeds with valid credentials and returns JWT token'
    );

    // 12. Invalid Password Rejection
    const badLogin = await makeRequest(
      {
        ...baseOptions,
        path: '/api/auth/login',
        method: 'POST',
      },
      {
        email: testEmail,
        password: 'WrongPassword!',
      }
    );
    assert(badLogin.status === 401, 'Login with incorrect password is rejected with 401 Unauthorized');

    // 13. Protected endpoint with token
    const meRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    assert(
      meRes.status === 200 && meRes.data.success === true && meRes.data.user.email === testEmail,
      'Protected endpoint /api/auth/me verifies valid JWT and returns user'
    );

    // 14. Protected endpoint without token
    const unauthRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/me',
      method: 'GET',
    });
    assert(unauthRes.status === 401, 'Protected endpoint /api/auth/me rejects unauthenticated requests with 401');

    // 15. Vehicle Profile: Save vehicle details
    const vehicleRes = await makeRequest(
      {
        ...baseOptions,
        path: '/api/auth/vehicle',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        brand: 'Tata Motors',
        model: 'Tata Nexon EV Empowered+',
        batteryCapacity: 40.5,
        rangeKm: 453,
        vehicleType: 'Electric Car',
        maxChargingSpeed: 50,
        connectorType: 'CCS2',
      }
    );
    assert(
      vehicleRes.status === 200 &&
        vehicleRes.data.success === true &&
        vehicleRes.data.vehicle.model === 'Tata Nexon EV Empowered+' &&
        vehicleRes.data.vehicle.batteryCapacity === 40.5,
      'Vehicle endpoint PUT /api/auth/vehicle successfully saves EV specifications'
    );

    // 16. Vehicle Profile: Verify persistence in /api/auth/me
    const meWithVehicleRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    assert(
      meWithVehicleRes.status === 200 &&
        meWithVehicleRes.data.user.vehicle?.model === 'Tata Nexon EV Empowered+' &&
        meWithVehicleRes.data.user.vehicle?.connectorType === 'CCS2',
      'Vehicle specifications persist and return correctly in /api/auth/me'
    );

    // 17. Personalized Route Planning using saved vehicle specifications
    const routeWithVehicleRes = await makeRequest(
      {
        ...baseOptions,
        path: '/api/recommendations/route',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        from: 'Connaught Place',
        to: 'Hauz Khas',
        battery: 60,
        corridorKm: 3,
      }
    );
    assert(
      routeWithVehicleRes.status === 200 &&
        routeWithVehicleRes.data.success === true &&
        routeWithVehicleRes.data.evMetrics?.vehicleBatteryCapacityKwh === 40.5 &&
        routeWithVehicleRes.data.evMetrics?.vehicleProfile?.isPersonalized === true &&
        routeWithVehicleRes.data.recommendations.some((s) => s.isConnectorCompatible === true),
      'Route recommendations incorporate personalized vehicle battery, range, and connector compatibility'
    );

    // 18. Vehicle Profile: Delete / Reset vehicle
    const deleteVehicleRes = await makeRequest({
      ...baseOptions,
      path: '/api/auth/vehicle',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    assert(
      deleteVehicleRes.status === 200 &&
        deleteVehicleRes.data.success === true &&
        deleteVehicleRes.data.vehicle.model === '',
      'Vehicle endpoint DELETE /api/auth/vehicle resets vehicle profile'
    );

    // 19. Logout
    const logoutRes = await makeRequest(
      {
        ...baseOptions,
        path: '/api/auth/logout',
        method: 'POST',
      },
      {}
    );
    assert(logoutRes.status === 200 && logoutRes.data.success === true, 'Logout endpoint returns success');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    console.log('\n========================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
