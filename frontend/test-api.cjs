const axios = require('axios');

async function testApi() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'admin',
      password: 'password'
    });
    
    // AuthController returns LoginResponse
    const token = loginRes.data.token;
    console.log("Got token.");

    const sessionRes = await axios.get('http://localhost:8080/api/sessions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Sessions returned:", sessionRes.data.length);
    console.log("Sessions data:", JSON.stringify(sessionRes.data, null, 2));
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}
testApi();
