const { Client } = require('pg');

const client = new Client({
  user: 'parking_user',
  host: 'localhost',
  database: 'parking_db',
  password: 'ParkingDB@2024!',
  port: 5433,
});

async function updateRole() {
  try {
    await client.connect();
    const res = await client.query("UPDATE users SET role = 'MANAGER' WHERE username = 'admin1'");
    console.log(`Updated ${res.rowCount} rows`);
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

updateRole();
