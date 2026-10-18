# Video thực thi test

Nhịp đã được người dùng duyệt: mục tiêu 4 giây, dừng 1,5 giây sau từng ô nhập, dừng 2 giây trước khi gửi và giữ kết quả 3,5 giây. Video ghi trình duyệt thật; chú thích tiếng Việt, không có âm thanh.

- [FR-02 — Đăng nhập và khóa tài khoản](FR-02-demo-paced.webm): khoảng 2 phút 16 giây; 6 TC, 1 Pass / 5 Fail.
- [FR-09 — Mã giảm giá](FR-09-demo.webm): khoảng 1 phút 24 giây; 6 TC, 2 Pass / 4 Fail.
- [FR-15 — Quản lý sản phẩm CRUD](FR-15-demo.webm): khoảng 1 phút 37 giây; 6 TC, 3 Pass / 3 Fail.

FR-09 minh họa áp dụng mã tại checkout với tổng giỏ lấy từ sản phẩm thử; TC09 mở route checkout trực tiếp khi chưa đăng nhập để kiểm tra điều kiện JWT. FR-15 minh họa CRUD và dữ liệu biên trên giao diện admin; TC03 giữ cảnh ngay sau lưu và sau reload. Fixtures được chuẩn bị riêng, không sửa logic SUT.

Thanh HW02 TEST HARNESS là phần minh họa của runner. Video này là thực thi TC, khác với video dùng skill thiết kế end-to-end. Chưa đăng YouTube. Lịch sử các take ở thư mục run/audit được giữ nguyên.

## FR-20 — Giỏ hàng Mobile

[Xem video Android native](FR-20-demo.webm): khoảng 2 phút 15 giây; 6 TC minh họa, 1 Pass / 5 Fail / 0 chưa kết luận.

Ứng dụng React Native/Expo Go chạy trên Android Emulator 16. Video ghi viewer phản chiếu ảnh màn hình Android trực tiếp qua ADB, bên cạnh chú thích; không thay bằng frontend Web. Các bước chuẩn bị giỏ bằng UI được ghi riêng trước mục tiêu mỗi TC.

Nhịp đã kiểm tra trong timeline: 4 giây đọc mục tiêu, dừng 1,5 giây sau nhập, 2 giây trước thao tác gửi, giữ kết quả ít nhất 3,5 giây. Thời gian thao tác/đọc cây UI Android có thể làm từng bước dài hơn khoảng dừng tối thiểu. Video chọn TC01/03/05/06/09/14 để minh họa cả 5 bug đã xác nhận và một ca điều hướng giữ giỏ đúng. TC10–TC12 được ghi riêng trong README do chưa chốt oracle/giới hạn nhập liệu. Chưa đăng YouTube.
