const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'db',   // <-- Here
  database: 'test_db',
  password: 'password',
  port: 5432,
});

client.connect()
  .then(() => console.log('✅ Direct connection successful'))
  .catch(err => console.error('❌ Direct connection error:', err.stack))
  .finally(() => client.end());
