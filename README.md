# Script kiểm thử seminar — Tùng

Nhánh Tùng có 13 script kiểm thử: TC_STRUCT_01–07 và TC_FUNC_01–06. Có script trong nhánh không đồng nghĩa mọi case đã được người học xem xét. Mỗi case được thêm bằng một commit riêng.

## Cài và chạy trên Windows

```powershell
npm --prefix testing ci
powershell -ExecutionPolicy Bypass -File flyway/install.ps1
npm test -- --case TC_STRUCT_01
```

Chạy một case khác, thay ID trong lệnh trên, ví dụ:

```powershell
npm test -- --case TC_FUNC_06
node testing/scripts/show-tables.cjs TC_STRUCT_01
```

Node >=24.11.1. Test tự tạo DB riêng, chạy Flyway và seed Faker. Binary Flyway, node_modules và DB tạm không đưa vào Git. Script Jest ở testing/database/structural. Ghi chú ở docs/tung/knowledge.md.

backend/database.js và backend/server.js là bản source tối thiểu từ ttbhanh/eshop-sut, commit 85af3ba875c88283615e22cb108f13e2fccaf0e9. Các file này phục vụ đối chiếu schema và adapter test, không phải toàn bộ ứng dụng để triển khai. Backend gốc không bị sửa. V1 giữ nguyên cấu trúc backend; bảng lịch sử được Flyway quản lý.

Bằng chứng trong evidence/tung là các lần chạy trên máy Tùng trước khi xuất bản; đường dẫn tuyệt đối trong log thuộc môi trường đó. Máy khác dùng lệnh trên để tạo bằng chứng của mình.

## Các script có trong nhánh

- Structural: TC_STRUCT_01–07.
- Functional: TC_FUNC_01–06.

Runner in kết quả mong đợi, kết quả thực tế, trạng thái PASS/FAIL, số suite/test, snapshot và thời gian chạy. Mỗi lần chạy tạo bằng chứng riêng trong `evidence/tung/`.

