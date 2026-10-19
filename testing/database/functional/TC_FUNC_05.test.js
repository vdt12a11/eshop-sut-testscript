// TC_FUNC_05 — Tổng quát: Admin thử chuyển pending thẳng sang delivered; yêu cầu HTTP 4xx và DB giữ pending.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { get } = require('../helpers/db.cjs');
const { request, login, selectOrder } = require('../helpers/api.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_FUNC_05', { api: true });
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_FUNC_05] Admin không chuyển pending thẳng sang delivered', async () => {
  const token = await login(context, 'admin');
  const order = await selectOrder(context, 'pending');
  // request(context.app) dùng Supertest gọi Express nạp từ backend thật với DB riêng.
  // .put/.post chọn phương thức; .auth(token, { type: 'bearer' }) đặt header Authorization: Bearer <token>.
  const response = await request(context.app).put(`/api/admin/orders/${order.id}/status`).auth(token, { type: 'bearer' }).send({ status: 'delivered' });
  const stored = await get(context.db, 'SELECT status FROM orders WHERE id=?', [order.id]);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { before: 'pending', requested: 'delivered', httpStatus: response.status, body: response.body, after: stored.status });
  // Yêu cầu HTTP >= 400; cùng dòng sau kiểm tra khoảng mã 400–499.
  expect(response.status).toBeGreaterThanOrEqual(400);
  // Yêu cầu HTTP < 500 để loại trường hợp API gặp lỗi server 5xx.
  expect(response.status).toBeLessThan(500);
  expect(stored.status).toBe('pending');
});
