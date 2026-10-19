// TC_FUNC_03 — Tổng quát: User thử hủy đơn shipping; yêu cầu HTTP 403 và DB giữ shipping.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { get } = require('../helpers/db.cjs');
const { request, login, selectOrder } = require('../helpers/api.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_FUNC_03', { api: true });
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_FUNC_03] User bị từ chối huỷ đơn shipping và DB giữ nguyên', async () => {
  const token = await login(context, 'user');
  const order = await selectOrder(context, 'shipping');
  // request(context.app) dùng Supertest gọi Express nạp từ backend thật với DB riêng.
  // .put/.post chọn phương thức; .auth(token, { type: 'bearer' }) đặt header Authorization: Bearer <token>.
  const response = await request(context.app).put(`/api/orders/${order.id}/cancel`).auth(token, { type: 'bearer' });
  const stored = await get(context.db, 'SELECT status FROM orders WHERE id=?', [order.id]);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { method: 'PUT', route: `/api/orders/${order.id}/cancel`, before: 'shipping', httpStatus: response.status, body: response.body, after: stored.status, expected: { httpStatus: 403, after: 'shipping' } });
  // Gom HTTP và trạng thái DB vào một object; toEqual kiểm tra nội dung cả hai trường.
  expect({ httpStatus: response.status, after: stored.status }).toEqual({ httpStatus: 403, after: 'shipping' });
});
