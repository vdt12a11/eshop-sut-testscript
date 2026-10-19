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
];
