// TC_STRUCT_05 — Tổng quát: Chèn coupon bỏ type/min_order_amount; kiểm tra SQLite gán DEFAULT percent/0.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { run, get } = require('../helpers/db.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_STRUCT_05');
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_STRUCT_05] SQLite tự gán DEFAULT khi bỏ type và min_order_amount', async () => {
  // Bỏ hẳn type/min_order_amount khỏi INSERT để SQLite dùng DEFAULT; truyền NULL là tình huống khác.
  await run(context.db, 'INSERT INTO coupons (code, discount_value, expired_at, max_uses_per_user) VALUES (?, ?, ?, ?)', ['TEST_DEFAULT', 10, '2099-12-31 23:59:59', 1]);
  const coupon = await get(context.db, 'SELECT type, min_order_amount FROM coupons WHERE code = ?', ['TEST_DEFAULT']);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { expected: { type: 'percent', min_order_amount: 0 }, actual: coupon });
  expect(coupon).toEqual({ type: 'percent', min_order_amount: 0 });
});
