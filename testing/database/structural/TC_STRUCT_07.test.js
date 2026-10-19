// TC_STRUCT_07 — Tổng quát: Chèn đơn bỏ status; đọc lại đúng đơn vừa tạo để kiểm tra DEFAULT pending.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { run, get } = require('../helpers/db.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_STRUCT_07');
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_STRUCT_07] đơn hàng mới tự nhận status pending khi bỏ cột status', async () => {
  // ORDER BY id LIMIT 1 chọn một user có sẵn theo thứ tự ID tăng dần.
  const user = await get(context.db, 'SELECT id FROM users ORDER BY id LIMIT 1');
  // !user là không có user; throw new Error dừng test do thiếu fixture.
  if (!user) throw new Error('Fixture thiếu user để tạo đơn hàng');
  // INSERT bỏ status để DB áp dụng DEFAULT; run trả lastID (ID mới) và changes (số dòng tác động).
  const inserted = await run(context.db, 'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', [user.id, 100000]);
  // Dùng inserted.lastID đọc đúng đơn vừa tạo, tránh kiểm tra nhầm đơn có sẵn.
  const order = await get(context.db, 'SELECT status FROM orders WHERE id = ?', [inserted.lastID]);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { expected: { status: 'pending' }, actual: order, insertedOrderId: inserted.lastID });
  expect(inserted.changes).toBe(1);
  expect(order).toEqual({ status: 'pending' });
});
