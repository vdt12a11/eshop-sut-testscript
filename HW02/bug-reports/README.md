# Báo cáo bug

| Bug | Chức năng | Nội dung | GitHub Issue |
| --- | --- | --- | --- |
| [BUG-FR02-001](BUG-FR02-001.md) | FR-02 | Bộ đếm đăng nhập sai tăng 2 thay vì 1, làm tài khoản khóa sớm | [Issue #1](https://github.com/vdt12a11/eshop-sut-testscript/issues/1) |
| [BUG-FR02-002](BUG-FR02-002.md) | FR-02 | Khóa đăng nhập khoảng 180 giây thay vì 30 giây | [Issue #2](https://github.com/vdt12a11/eshop-sut-testscript/issues/2) |
| [BUG-FR02-003](BUG-FR02-003.md) | FR-02 | Trường email dùng type=text nên HTML5 không chặn email sai định dạng | [Issue #3](https://github.com/vdt12a11/eshop-sut-testscript/issues/3) |
| [BUG-FR09-001](BUG-FR09-001.md) | FR-09 | Mã phần trăm tính sai số tiền giảm và tổng thanh toán | [Issue #4](https://github.com/vdt12a11/eshop-sut-testscript/issues/4) |
| [BUG-FR09-002](BUG-FR09-002.md) | FR-09 | Cho phép áp dụng mã giảm giá khi chưa đăng nhập và không có JWT | [Issue #5](https://github.com/vdt12a11/eshop-sut-testscript/issues/5) |
| [BUG-FR09-003](BUG-FR09-003.md) | FR-09 | Từ chối mã khi tổng đơn đúng bằng ngưỡng tối thiểu | [Issue #6](https://github.com/vdt12a11/eshop-sut-testscript/issues/6) |
| [BUG-FR15-001](BUG-FR15-001.md) | FR-15 | Danh sách sản phẩm cập nhật sai ngay sau khi sửa: đổi tên cả sản phẩm khác và giữ giá cũ | [Issue #7](https://github.com/vdt12a11/eshop-sut-testscript/issues/7) |
| [BUG-FR15-002](BUG-FR15-002.md) | FR-15 | Chấp nhận và lưu tên sản phẩm dài 256 ký tự | [Issue #8](https://github.com/vdt12a11/eshop-sut-testscript/issues/8) |
| [BUG-FR15-003](BUG-FR15-003.md) | FR-15 | Chấp nhận và lưu sản phẩm có giá bằng 0 | [Issue #9](https://github.com/vdt12a11/eshop-sut-testscript/issues/9) |
| [BUG-FR20-001](BUG-FR20-001.md) | FR-20 | Giỏ hàng Mobile trống thiếu hình minh họa | [Issue #10](https://github.com/vdt12a11/eshop-sut-testscript/issues/10) |
| [BUG-FR20-002](BUG-FR20-002.md) | FR-20 | Giỏ hàng Mobile thiếu nút tăng giảm số lượng +/- | [Issue #11](https://github.com/vdt12a11/eshop-sut-testscript/issues/11) |
| [BUG-FR20-003](BUG-FR20-003.md) | FR-20 | Giỏ hàng Mobile dùng nhãn Tổng tạm tính thay vì Tổng cộng | [Issue #12](https://github.com/vdt12a11/eshop-sut-testscript/issues/12) |
| [BUG-FR20-004](BUG-FR20-004.md) | FR-20 | Xóa sản phẩm khỏi giỏ Mobile ngay lập tức, không có xác nhận | [Issue #13](https://github.com/vdt12a11/eshop-sut-testscript/issues/13) |
| [BUG-FR20-005](BUG-FR20-005.md) | FR-20 | Nhập tay số lượng 3 trong giỏ Mobile cho kết quả sai | [Issue #14](https://github.com/vdt12a11/eshop-sut-testscript/issues/14) |

Một bug có thể làm nhiều TC Fail. TC10–TC12 FR-20 chưa chốt quy tắc chuẩn hóa số lượng thành 1; không tạo issue cho hành vi đó khi chưa có căn cứ.
