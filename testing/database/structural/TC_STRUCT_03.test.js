// TC_STRUCT_03 — Tổng quát: Kiểm tra kiểu khai báo products.price là INTEGER; chưa thử chèn dữ liệu sai kiểu.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { all } = require('../helpers/db.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_STRUCT_03');
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_STRUCT_03] products.price khai báo kiểu INTEGER', async () => {
  // Đọc metadata các cột của products bằng PRAGMA của SQLite.
  const columns = await all(context.db, "PRAGMA table_info('products')");
  // find trả phần tử đầu tiên thỏa callback hoặc undefined; === so sánh bằng nghiêm ngặt.
  const price = columns.find(column => column.name === 'price');
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { expectedType: 'INTEGER', priceColumn: price || null });
  // toBeDefined yêu cầu tìm thấy cột trước khi đọc price.type ở dòng sau.
  expect(price).toBeDefined();
  // trim bỏ khoảng trắng hai đầu; toUpperCase đổi sang chữ hoa; toBe so sánh chuỗi INTEGER.
  expect(price.type.trim().toUpperCase()).toBe('INTEGER');
});
