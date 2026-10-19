// TC_STRUCT_04 — Tổng quát: Chèn hai coupon trùng code; yêu cầu INSERT thứ hai lỗi UNIQUE và chỉ lưu một dòng.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { run, get } = require('../helpers/db.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_STRUCT_04');
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_STRUCT_04] SQLite từ chối hai coupon có cùng code', async () => {
  // Dấu ? là chỗ gắn tham số SQL; driver truyền values vào, không tự nối dữ liệu vào câu lệnh.
  const sql = 'INSERT INTO coupons (code, type, discount_value, min_order_amount, expired_at, max_uses_per_user) VALUES (?, ?, ?, ?, ?, ?)';
  const values = ['TEST_UNIQUE', 'percent', 10, 0, '2099-12-31 23:59:59', 1];
  await run(context.db, sql, values);

  const secondInsert = run(context.db, sql, values);
  // then(hàmThànhCông, hàmThấtBại) tạo Promise mới: thành công trả null, thất bại trả object lỗi.
  const error = await secondInsert.then(() => null, failure => failure);
  // COUNT(*) AS count đếm dòng mang code thử nghiệm, đọc kết quả qua row.count.
  const row = await get(context.db, 'SELECT COUNT(*) AS count FROM coupons WHERE code = ?', ['TEST_UNIQUE']);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { duplicateCode: values[0], error: error ? { code: error.code, message: error.message } : null, storedRows: row.count });
  // rejects yêu cầu Promise bị từ chối; toThrow(chuỗi) kiểm tra message chứa chuỗi lỗi UNIQUE.
  await expect(secondInsert).rejects.toThrow('UNIQUE constraint failed: coupons.code');
  expect(row.count).toBe(1);
});
