# Script kiểm thử seminar — Tùng

Nhánh Tùng lưu các case đã học và duyệt. Mỗi case có commit riêng.

## Cài và chạy trên Windows

```powershell
npm --prefix testing ci
powershell -ExecutionPolicy Bypass -File flyway/install.ps1
npm --prefix testing test -- --case TC_STRUCT_01
node testing/scripts/show-tables.cjs TC_STRUCT_01
```

Node >=24.11.1. Test tự tạo DB riêng, chạy Flyway và seed Faker. Binary Flyway, node_modules và DB tạm không đưa vào Git. Script Jest ở testing/database/structural. Ghi chú ở docs/tung/knowledge.md.

backend/database.js và backend/server.js là bản source tối thiểu từ ttbhanh/eshop-sut, commit 85af3ba875c88283615e22cb108f13e2fccaf0e9. Các file này phục vụ đối chiếu schema và adapter test, không phải toàn bộ ứng dụng để triển khai. Backend gốc không bị sửa. V1 giữ nguyên cấu trúc backend; bảng lịch sử được Flyway quản lý.

Bằng chứng trong evidence/tung là các lần chạy trên máy Tùng trước khi xuất bản; đường dẫn tuyệt đối trong log thuộc môi trường đó. Máy khác dùng lệnh trên để tạo bằng chứng của mình.

## Case đã hoàn thành

- TC_STRUCT_01: đúng danh sách 7 bảng sau migration — PASS.
- TC_STRUCT_02: có các cột thiết yếu của users — PASS. Chạy: npm --prefix testing test -- --case TC_STRUCT_02.

Chạy npm --prefix testing test để kiểm tra cả hai case đã duyệt. Các case khác chưa được xuất bản trên nhánh này.

