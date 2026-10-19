# Database testing seminar

Node >=24.11.1. Cài và chạy từ thư mục eshop-sut:

```powershell
npm --prefix testing ci
npm --prefix testing run check:fixtures
npm test
npm test -- --case TC_STRUCT_02
npm run test:structural
npm run test:functional
```

## Đặt file đúng thư mục

- database/structural/TC_STRUCT_01.test.js đến TC_STRUCT_07.test.js: script Jest structural của Tùng.
- database/functional/TC_FUNC_01.test.js đến TC_FUNC_06.test.js: script Jest functional của Tùng.
- database/fixtures/seed-faker.js: file Faker chung, nguyên nội dung.
- database/helpers/: wrapper SQL, fixture và adapter backend.
- scripts/: runner và kiểm tra seed; không đặt các test case ở đây.
- jest.config.cjs: cấu hình Jest dùng chung.
- ../docs/tung/: ghi chép Jest, catalog, báo cáo kết quả và lỗi.
- ../evidence/tung/: log và JSON mỗi lần chạy. .tmp/: database cô lập, không đưa vào Git.

Runner chỉ chọn 13 case của Tùng. Các thành viên khác có thể thêm case vào structural/functional và mở rộng runner riêng. Helpers tạo SQLite bằng Flyway V1 tương đương DDL backend; functional dùng routes thật qua Supertest. Không cần bật backend, không ghi vào database gốc. Mỗi case có database riêng.

Helper reset Faker seed 42, ngày tham chiếu 2026-03-31 và tuần tự hoá SQL quanh file seed chung. check:fixtures kiểm tra dữ liệu lặp lại thực sự. PRAGMA foreign_keys được trả về cấu hình SUT sau seed để test không pass giả.

Lần chạy đủ 13 case gần nhất: 10 passed, 3 failed (TC_FUNC_03, TC_FUNC_04, TC_FUNC_06). Các lỗi này là assertion actual khác expected; exit code 1 phản ánh test phát hiện hành vi cần xem xét. Xem ../docs/tung/Test_Summary.md và Test_Results.json để biết chi tiết.

Để chẩn đoán file seed gốc khi chạy trực tiếp: npm --prefix testing run seed:smoke. Xem Seed_Smoke_README.md; lệnh này yêu cầu DB gốc đã có schema và có thể báo lỗi do seed gốc không ổn định khi thiếu wrapper. Nó là kiểm tra riêng, không thay thế bộ Jest.

## Cập nhật Flyway 2026-10-13

Đã cài CLI 13.10.0; helper hiện chạy migration V1 thay bước tạo schema bằng initializer. Máy khác chạy powershell -ExecutionPolicy Bypass -File flyway/install.ps1 trước khi test. Xem flyway/README.md. STRUCT 01 đã PASS sau thiết lập. Các mô tả thiếu Flyway ở trên là kết quả trước tích hợp.


