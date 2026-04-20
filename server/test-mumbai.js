const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.ggykrorwlkibhkbrojsu:HYCYVHRqq2qifIcZ@3.108.251.216:5432/postgres?sslmode=require",
});

async function test() {
  try {
    console.log('Connecting to Mumbai...');
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Response:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

test();
