require('dotenv').config();
const { MongoClient } = require('mongodb');

async function test() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    console.error('MONGO_URL not set');
    process.exit(1);
  }
  console.log('Using MONGO_URL:', JSON.stringify(uri));
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    await client.db().admin().ping();
    console.log('Ping OK');
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.close();
  }
}
test();