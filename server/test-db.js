const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.ggykrorwlkibhkbrojsu:HYCYVHRqq2qifIcZ@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
});

async function test() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Response:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

test();
