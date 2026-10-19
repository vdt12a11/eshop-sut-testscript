// TC_FUNC_02 — Tổng quát: Admin thử đổi canceled sang pending/confirmed; yêu cầu HTTP 4xx và DB giữ canceled.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { get } = require('../helpers/db.cjs');
const { request, login, selectOrder } = require('../helpers/api.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_FUNC_02', { api: true });
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_FUNC_02] Admin không đổi canceled sang pending hoặc confirmed', async () => {
  const token = await login(context, 'admin');
  const order = await selectOrder(context, 'canceled');
  const observations = [];
  // for...of duyệt từng trạng thái đích. Hai lần thử dùng cùng đơn trong một test, không reset giữa vòng lặp.
  for (const status of ['pending', 'confirmed']) {
    // Gửi PUT bằng token admin; auth đặt header Bearer, send({ status }) gửi JSON { status: status }.
    // Backtick với ${order.id} chèn ID vào URL; await chờ HTTP response trước khi đọc DB.
    const response = await request(context.app).put(`/api/admin/orders/${order.id}/status`).auth(token, { type: 'bearer' }).send({ status });
    const stored = await get(context.db, 'SELECT status FROM orders WHERE id=?', [order.id]);
    observations.push({ requestedStatus: status, httpStatus: response.status, body: response.body, storedStatus: stored.status });
  }
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { originalOrderId: order.id, before: 'canceled', attempts: observations });
  for (const attempt of observations) {
    // Yêu cầu HTTP >= 400; kết hợp < 500 bên dưới để chỉ nhận nhóm lỗi 4xx.
    expect(attempt.httpStatus).toBeGreaterThanOrEqual(400);
    // Yêu cầu HTTP < 500, không coi lỗi server 5xx là từ chối nghiệp vụ đúng.
    expect(attempt.httpStatus).toBeLessThan(500);
    // toBe so sánh giá trị chuỗi: trạng thái DB phải giữ nguyên như trước request.
    expect(attempt.storedStatus).toBe('canceled');
  }
});
