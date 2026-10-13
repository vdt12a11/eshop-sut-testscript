const request = require('supertest');
const { get } = require('./db.cjs');

async function login(context, role) {
  const credentials = role === 'admin'
    ? { email: 'admin@eshop.com', password: 'Admin123!' }
    : { email: 'test@eshop.com', password: 'Test1234!' };
  const response = await request(context.app).post('/api/login').send(credentials);
  if (response.status !== 200 || !response.body.token) {
    throw new Error(`API setup: ${role} login failed with HTTP ${response.status}`);
  }
  return response.body.token;
}

async function selectOrder(context, status) {
  // Select by stable semantics rather than trusting a hardcoded row ID.
  const order = await get(context.db, 'SELECT * FROM orders WHERE user_id = (SELECT id FROM users WHERE email = ?) AND status = ? ORDER BY id LIMIT 1', ['test@eshop.com', status]);
  if (!order) throw new Error(`Fixture setup: no test user's ${status} order`);
  return order;
}

module.exports = { request, login, selectOrder };
