# Kết quả phần Tùng

Run: 2026-10-19T15-02-06-622Z-30876

Node: v24.11.1. Database gốc không đổi: true.

Jest: 10 passed, 3 failed, 13 total. BLOCKED là phân loại báo cáo; assertion Jest vẫn thất bại.

| Case | Kết quả | Nội dung |
|---|---|---|
| TC_STRUCT_01 | PASS | Danh sách bảng, gồm flyway_schema_history |
| TC_STRUCT_02 | PASS | Các cột thiết yếu trong users |
| TC_STRUCT_03 | PASS | Kiểu khai báo products.price |
| TC_STRUCT_04 | PASS | UNIQUE của coupons.code |
| TC_STRUCT_05 | PASS | DEFAULT của coupon |
| TC_STRUCT_06 | PASS | Khả năng ghi của kết nối |
| TC_STRUCT_07 | PASS | DEFAULT trạng thái đơn hàng |
| TC_FUNC_01 | PASS | Không đổi trạng thái delivered |
| TC_FUNC_02 | PASS | Không đổi canceled về pending/confirmed |
| TC_FUNC_03 | FAIL | User không huỷ đơn shipping |
| TC_FUNC_04 | FAIL | Admin huỷ đơn shipping |
| TC_FUNC_05 | PASS | Không nhảy pending thẳng sang delivered |
| TC_FUNC_06 | FAIL | User không tạo coupon admin |

Nếu STRUCT 01 bị BLOCKED do thiếu bảng lịch sử Flyway, kiểm tra bước migration trước khi seed. Xem quan sát HTTP/SQL trong Test_Results.json và log tại D:\vscode\Software testing\eshop-sut-testscript\evidence\tung\2026-10-19T15-02-06-622Z-30876.
