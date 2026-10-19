// Kiểm tra user thường không thể tạo coupon qua API admin.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { get } = require('../helpers/db.cjs');
const { request, login } = require('../helpers/api.cjs');

let context;
// Jest gọi beforeEach trước test; api:true tạo app Express để Supertest gọi API.
beforeEach(async () => {
  context = await createContext('TC_FUNC_06', { api: true });
});
afterEach(async () => {
  // Chờ đóng kết nối SQLite sau test.
  await disposeContext(context);
});

test('[TC_FUNC_06] User không tạo được coupon qua API admin', async () => {
  const token = await login(context, 'user');
  const before = await get(context.db, 'SELECT COUNT(*) AS count FROM coupons');
  const payload = { code: 'TC_FUNC_06_UNAUTHORIZED', type: 'percent', discount_value: 10, min_order_amount: 0, expired_at: '2099-12-31 23:59:59', max_uses_per_user: 1 };
  // Gửi POST JSON với token Bearer của user thường.
  const response = await request(context.app).post('/api/admin/coupons').auth(token, { type: 'bearer' }).send(payload);
  const after = await get(context.db, 'SELECT COUNT(*) AS count FROM coupons');
  const inserted = await get(context.db, 'SELECT COUNT(*) AS count FROM coupons WHERE code=?', [payload.code]);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán biến.
  observe(context, { method: 'POST', route: '/api/admin/coupons', role: 'user', payload, httpStatus: response.status, body: response.body, beforeCount: before.count, afterCount: after.count, insertedRows: inserted.count });
  // includes kiểm tra mã 401/403; toEqual đối chiếu kết quả với các điều kiện mong đợi.
  expect({ rejected: [401, 403].includes(response.status), insertedRows: inserted.count, totalRows: after.count }).toEqual({ rejected: true, insertedRows: 0, totalRows: before.count });
});
