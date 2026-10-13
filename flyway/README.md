# Flyway cho SQLite seminar

Phiên bản CLI cố định: 13.10.0 Windows x64. Bộ cài từ Redgate được giải nén trong testing/.tmp/tools (Git bỏ qua), không đưa binary hoặc DB tạm vào repo.

Từ eshop-sut, trên máy Windows khác:

```powershell
powershell -ExecutionPolicy Bypass -File flyway/install.ps1
npm --prefix testing test -- --case TC_STRUCT_01
node testing/scripts/show-tables.cjs TC_STRUCT_01
```

Helper tạo một DB mới, chạy migrate → validate → info qua CLI thật, mở kết nối sqlite3, rồi gọi fixture Faker chung. V1 tạo 6 bảng; Flyway tạo flyway_schema_history. sqlite_sequence là bảng nội bộ, không nằm trong 7 bảng mà TC01 đối chiếu. Không sửa backend/database.sqlite hay backend/database.js.

V1 giữ nguyên DDL từ backend/database.js. Helper so sánh DDL trước khi chạy; schema khác thì cần xem lại migration. Kết nối SQLite mới có cấu hình mặc định như backend hiện tại; nếu backend thêm PRAGMA foreign_keys, helper dừng để yêu cầu cập nhật cách kiểm tra cấu hình. Vì vậy đây là môi trường kiểm thử schema tương đương được dựng bằng Flyway, chưa phải thay đổi cách backend production khởi động.

Mỗi DB test có flyway.log bên cạnh database.sqlite. Mở database bằng DB Browser và chạy:

```sql
SELECT version, description, script, checksum, success
FROM flyway_schema_history;
```

Cần thấy V1, script V1__create_eshop_schema.sql và success = 1. Không chỉnh tay bảng lịch sử. V1 đã áp dụng phải giữ nguyên; thay đổi schema tiếp theo viết V2. Migration đổi/rollback theo seminar là công việc tiếp theo, chưa được thực hiện ở bước cài này.

Nguồn: [Flyway CLI](https://documentation.red-gate.com/flyway/reference/usage/command-line), [SQLite](https://documentation.red-gate.com/flyway/reference/database-driver-reference/sqlite).
