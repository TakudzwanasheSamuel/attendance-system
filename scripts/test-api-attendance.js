const fetch = require('node-fetch');

async function testAttendanceAPI() {
  try {
    console.log('🧪 Testing Attendance API with Email/Password Authentication\n');
    
    // Test data - using the session we just created
    const testData = {
      sessionId: 'Z68MW3', // From the previous test
      email: 'tapiwa.dube.78@msu.com', // Student who should be enrolled
      password: 'password123' // Default password from seeding
    };
    
    console.log(`Testing with:`);
    console.log(`- Session ID: ${testData.sessionId}`);
    console.log(`- Student Email: ${testData.email}`);
    console.log(`- Password: ${testData.password}\n`);
    
    // Make the API call
    const response = await fetch('http://localhost:9002/api/attendance/mark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body:`, JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ API Test PASSED - Attendance marked successfully!');
    } else {
      console.log('\n❌ API Test FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAttendanceAPI();
