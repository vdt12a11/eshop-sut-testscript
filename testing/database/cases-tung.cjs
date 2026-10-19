module.exports = [
  {
    "id": "TC_STRUCT_01",
    "suite": "structural",
    "title": "Danh sách bảng, gồm flyway_schema_history",
    "expected": "Đúng 7 bảng nghiệp vụ/metadata; bỏ qua bảng nội bộ sqlite_*",
    "note": "Theo catalog sau khi Flyway được thiết lập. Thiếu flyway_schema_history là thiếu tiền điều kiện, không phải lỗi schema nghiệp vụ đã xác nhận."
  },
  {
    "id": "TC_STRUCT_02",
    "suite": "structural",
    "title": "Các cột thiết yếu trong users",
    "expected": "Có id, email, role và locked_until"
  }
  {"id":"TC_STRUCT_03","suite":"structural","title":"Kiểu khai báo products.price","expected":"Kiểu khai báo INTEGER"},
  {"id":"TC_STRUCT_04","suite":"structural","title":"UNIQUE của coupons.code","expected":"INSERT code trùng bị từ chối; còn đúng 1 dòng"},
  {"id":"TC_STRUCT_05","suite":"structural","title":"DEFAULT của coupon","expected":"Bỏ cột type/min_order_amount khi INSERT: percent/0"},
  {"id":"TC_STRUCT_06","suite":"structural","title":"Khả năng ghi của kết nối","expected":"CREATE và DROP được bảng trên DB test"},
  {"id":"TC_STRUCT_07","suite":"structural","title":"DEFAULT trạng thái đơn hàng","expected":"INSERT bỏ cột status: đơn hàng được lưu với status pending","note":"Thay case cấu hình foreign_keys theo yêu cầu Tùng ngày 14/10/2026; không còn kiểm tra bật FK."},
  {"id":"TC_FUNC_01","suite":"functional","title":"Không đổi trạng thái delivered","expected":"Admin chuyển sang canceled hoặc shipping: HTTP 4xx, DB giữ delivered"},
  {"id":"TC_FUNC_02","suite":"functional","title":"Không đổi canceled về pending/confirmed","expected":"HTTP 4xx, DB giữ canceled","note":"Catalog chỉ nêu pending/confirmed; không suy rộng kết quả sang mọi trạng thái khác."},
  {"id":"TC_FUNC_03","suite":"functional","title":"User không huỷ đơn shipping","expected":"HTTP 403, DB giữ shipping"},
  {"id":"TC_FUNC_04","suite":"functional","title":"Admin huỷ đơn shipping","expected":"HTTP 2xx, DB đổi canceled"},
];
