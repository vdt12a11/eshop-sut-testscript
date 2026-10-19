// TC_STRUCT_06 — Tổng quát: Tạo rồi xóa bảng trong DB test để kiểm tra khả năng CREATE/DROP của kết nối hiện tại.
const { createContext, disposeContext, observe } = require('../helpers/context.cjs');
const { run, get } = require('../helpers/db.cjs');

let context;
beforeEach(async () => {
  // Chờ tạo môi trường xong và lưu object kết quả cho thân test sử dụng.
  context = await createContext('TC_STRUCT_06');
});
afterEach(async () => {
  // Chờ đóng kết nối trước khi Jest coi bước dọn dẹp đã hoàn tất.
  await disposeContext(context);
});

test('[TC_STRUCT_06] kết nối Node.js CREATE và DROP được bảng trong DB test', async () => {
  await run(context.db, 'CREATE TABLE temp_table (id INTEGER PRIMARY KEY)');
  const afterCreate = await get(context.db, "SELECT name FROM sqlite_master WHERE type='table' AND name=?", ['temp_table']);
  // Xóa bảng vừa tạo cùng dữ liệu nếu có.
  await run(context.db, 'DROP TABLE temp_table');
  const afterDrop = await get(context.db, "SELECT name FROM sqlite_master WHERE type='table' AND name=?", ['temp_table']);
  // Ghi dữ liệu quan sát vào bằng chứng JSON; không tạo hoặc gán giá trị cho biến.
  observe(context, { afterCreate: afterCreate || null, afterDrop: afterDrop || null });
  expect(afterCreate).toEqual({ name: 'temp_table' });
  // toBeUndefined yêu cầu bảng không còn sau DROP; kết quả chỉ áp dụng cho kết nối đang thử.
  expect(afterDrop).toBeUndefined();
});
