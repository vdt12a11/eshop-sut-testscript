// TC_FUNC_04 — Tổng quát: Admin hủy đơn shipping; yêu cầu HTTP 2xx và DB lưu canceled.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { get } = require('../helpers/db.cjs');
const { request, login, selectOrder } = require('../helpers/api.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_FUNC_04', { api: true });
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_FUNC_04] Admin huỷ được đơn shipping và DB lưu canceled', async () => {
  const token = await login(context, 'admin');
  const order = await selectOrder(context, 'shipping');
  // request(context.app) dùng Supertest gọi Express nạp từ backend thật với DB riêng.
  // .put/.post chọn phương thức; .auth(token, { type: 'bearer' }) đặt header Authorization: Bearer <token>.
  const response = await request(context.app).put(`/api/admin/orders/${order.id}/status`).auth(token, { type: 'bearer' }).send({ status: 'canceled' });
  const stored = await get(context.db, 'SELECT status FROM orders WHERE id=?', [order.id]);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { method: 'PUT', route: `/api/admin/orders/${order.id}/status`, before: 'shipping', httpStatus: response.status, body: response.body, after: stored.status, expected: { successful: true, after: 'canceled' } });
  // >= 200 && < 300 dùng && (VÀ) kiểm tra mã HTTP thuộc nhóm 2xx, trả boolean true/false.
  expect({ successful: response.status >= 200 && response.status < 300, after: stored.status }).toEqual({ successful: true, after: 'canceled' });
});
