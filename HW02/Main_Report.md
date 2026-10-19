# Báo cáo HW02 Domain Testing trên EShop


## 1 Phạm vi kiểm thử

| Pool | Mã FR | Tên chức năng |
| --- | --- | --- |
| A | FR-02 | Đăng nhập và khóa tài khoản |
| B | FR-09 | Mã giảm giá |
| C | FR-15 | Quản lý sản phẩm |
| D | FR-20 | Giỏ hàng Mobile |

## 2 Pool A FR02 Đăng nhập và khóa tài khoản

### 2.1 Yêu cầu làm cơ sở kiểm thử

- Nhập email và mật khẩu; thông tin đúng được đăng nhập khi tài khoản không khóa.
- Mỗi lần đăng nhập sai tăng bộ đếm đúng 1; sai từ 3 lần liên tiếp khóa 30 giây.
- Lỗi phải có thông báo phù hợp, không lộ chi tiết nguyên nhân.
- Thành công trả JWT; client lưu và đính kèm Authorization Bearer trên mọi request cần xác thực.
- Input email có type=email và validation HTML5.

### 2.2 Domain Testing Bước 1 Xác định Input và Output

Từ yêu cầu đăng nhập, xác định email và mật khẩu là dữ liệu người dùng nhập; đầu ra cần quan sát gồm kết quả xác thực, JWT, thông báo và thay đổi trạng thái tài khoản, cùng việc lưu và gửi token ở client.

| Chức năng | Đầu vào | Đầu ra |
| --- | --- | --- |
| FR-02 Đăng nhập và khóa tài khoản | Email; mật khẩu. | Kết quả đăng nhập; thông báo lỗi; JWT; bộ đếm và trạng thái khóa sau request; token được client lưu; header Authorization trên request cần xác thực. |

Ngữ cảnh trước request: số lần sai liên tiếp n, trạng thái khóa và thời gian từ lúc bắt đầu khóa. Đây là trạng thái trước khi gửi yêu cầu đăng nhập đang xét, được dùng để phân lớp ở bước 2.

### 2.3 Domain Testing Bước 2 Xác định điều kiện và EC

Phân lớp theo điều kiện đầu vào, trạng thái tài khoản và kết quả mong đợi. Email hợp định dạng được tách thành tài khoản tồn tại/không tồn tại vì việc xác thực và quan sát bộ đếm chỉ có ý nghĩa với tài khoản tồn tại. n là số lần đăng nhập sai liên tiếp trước khi gửi yêu cầu đang xét: n=0 chưa có lần sai; n=1 và n=2 được tách vì lần sai tiếp theo lần lượt vẫn chưa khóa hoặc kích hoạt khóa. Trạng thái chưa khóa, đang khóa và hết khóa được tách theo khả năng đăng nhập. Các EC đầu ra dùng để kiểm tra kết quả, thông báo, JWT và thay đổi trạng thái; thông báo lỗi trong test âm vẫn là đầu ra đúng.

| ID | Đầu vào/đầu ra | Lớp tương đương |
| --- | --- | --- |
| EC1 | Email | Email hợp định dạng, tài khoản tồn tại |
| EC2 | Email | Email hợp định dạng, tài khoản không tồn tại |
| EC3 | Email | Email không rỗng, sai định dạng HTML5 |
| EC4 | Mật khẩu | Mật khẩu đúng của tài khoản tồn tại |
| EC5 | Mật khẩu | Mật khẩu sai của tài khoản tồn tại |
| EC6 | Mật khẩu | Mật khẩu chuỗi bất kỳ khi email không tồn tại |
| EC7 | Số lần sai trước request | n=0 trước request |
| EC8 | Số lần sai trước request | n=1 trước request sai |
| EC9 | Số lần sai trước request | n=2 trước request sai |
| EC10 | Trạng thái khóa trước request | Tài khoản chưa khóa |
| EC11 | Trạng thái và thời gian khóa trước request | Tài khoản đang trong thời hạn khóa |
| EC12 | Trạng thái và thời gian khóa trước request | Tài khoản đã hết thời hạn khóa |
| EC13 | Kết quả đăng nhập | Đăng nhập thành công khi thông tin đúng, chưa khóa |
| EC14 | Kết quả đăng nhập | Từ chối khi sai thông tin xác thực |
| EC15 | Kết quả đăng nhập | UI chặn submit email sai định dạng |
| EC16 | Kết quả đăng nhập | Từ chối khi tài khoản đang khóa |
| EC17 | Thông báo lỗi | Thông báo lỗi xác thực phù hợp, không lộ chi tiết |
| EC18 | Thông báo lỗi | Thông báo khóa phù hợp, không lộ chi tiết |
| EC19 | JWT trả về | Có JWT xác thực được khi đăng nhập thành công |
| EC20 | JWT trả về | Không cấp phiên/JWT xác thực được khi bị từ chối |
| EC21 | Bộ đếm sau request | n_after = n_before + 1 khi đăng nhập sai, tài khoản tồn tại chưa khóa |
| EC22 | Trạng thái khóa sau request | Chưa khóa sau lần sai thứ 1 hoặc 2 |
| EC23 | Trạng thái khóa sau request | Kích hoạt khóa 30 giây ở lần sai thứ 3 |
| EC24 | Trạng thái khóa sau request | Hết khóa sau thời hạn; đăng nhập đúng thành công |
| EC25 | Token được client lưu | Client lưu đúng token sau đăng nhập thành công |
| EC26 | Header request cần xác thực | Request cần xác thực gửi Authorization: Bearer <token> đúng token |

### 2.4 Domain Testing Bước 3 Chọn đại diện và xây dựng test case

Chọn một bộ dữ liệu và đầu ra mong đợi cho từng EC, sau đó gộp các dòng có cùng dữ liệu, ngữ cảnh và kết quả. Kết hợp các EC hợp lệ khi phù hợp; mỗi tình huống âm chỉ vi phạm một điều kiện đầu vào.

#### 2.4.1 Các ca kiểm thử bao phủ từng phân vùng

| Phân vùng | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| EC1 | Email hợp định dạng, tài khoản tồn tại | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| EC2 | Email hợp định dạng, tài khoản không tồn tại | Email: "hw02-absent@example.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Xác nhận email không tồn tại; client chưa có phiên; gửi đăng nhập. | Từ chối; không cấp phiên hợp lệ; lỗi xác thực phù hợp, không lộ chi tiết. Không kết luận bộ đếm của tài khoản không tồn tại. |
| EC3 | Email không rỗng, sai định dạng HTML5 | Email: "abc"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Mở form; mật khẩu không rỗng; submit qua UI. | HTML5 chặn email sai định dạng; không gửi request đăng nhập. |
| EC4 | Mật khẩu đúng của tài khoản tồn tại | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| EC5 | Mật khẩu sai của tài khoản tồn tại | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=0; gửi một lần đăng nhập sai. | Từ chối; không cấp phiên hợp lệ; n=1; chưa khóa; lỗi xác thực phù hợp, không lộ chi tiết. |
| EC6 | Mật khẩu chuỗi bất kỳ khi email không tồn tại | Email: "hw02-absent@example.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Xác nhận email không tồn tại; client chưa có phiên; gửi đăng nhập. | Từ chối; không cấp phiên hợp lệ; lỗi xác thực phù hợp, không lộ chi tiết. Không kết luận bộ đếm của tài khoản không tồn tại. |
| EC7 | n=0 trước request | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| EC8 | n=1 trước request sai | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=1; gửi một lần đăng nhập sai. | Từ chối; không cấp phiên hợp lệ; n=2; chưa khóa. |
| EC9 | n=2 trước request sai | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=2; gửi một lần đăng nhập sai. | Từ chối; n=3; kích hoạt khóa 30 giây; không cấp phiên hợp lệ. |
| EC10 | Tài khoản chưa khóa | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| EC11 | Tài khoản đang trong thời hạn khóa | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; thử đăng nhập đúng sau khoảng 10 giây. | Vẫn từ chối; không cấp phiên hợp lệ; thông báo khóa phù hợp, không lộ chi tiết. |
| EC12 | Tài khoản đã hết thời hạn khóa | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; không có request xen giữa; thử đăng nhập sau khoảng 35 giây. | Hết khóa; đăng nhập thành công và trả JWT. Không kết luận bộ đếm được reset; chưa kiểm đúng biên 30 giây. |
| EC13 | Đăng nhập thành công khi thông tin đúng, chưa khóa | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| EC14 | Từ chối khi sai thông tin xác thực | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=0; gửi một lần đăng nhập sai. | Từ chối; không cấp phiên hợp lệ; n=1; chưa khóa; lỗi xác thực phù hợp, không lộ chi tiết. |
| EC15 | UI chặn submit email sai định dạng | Email: "abc"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Mở form; mật khẩu không rỗng; submit qua UI. | HTML5 chặn email sai định dạng; không gửi request đăng nhập. |
| EC16 | Từ chối khi tài khoản đang khóa | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; thử đăng nhập đúng sau khoảng 10 giây. | Vẫn từ chối; không cấp phiên hợp lệ; thông báo khóa phù hợp, không lộ chi tiết. |
| EC17 | Thông báo lỗi xác thực phù hợp, không lộ chi tiết | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=0; gửi một lần đăng nhập sai. | Từ chối; không cấp phiên hợp lệ; n=1; chưa khóa; lỗi xác thực phù hợp, không lộ chi tiết. |
| EC18 | Thông báo khóa phù hợp, không lộ chi tiết | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; thử đăng nhập đúng sau khoảng 10 giây. | Vẫn từ chối; không cấp phiên hợp lệ; thông báo khóa phù hợp, không lộ chi tiết. |
| EC19 | Có JWT xác thực được khi đăng nhập thành công | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| EC20 | Không cấp phiên/JWT xác thực được khi bị từ chối | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=0; gửi một lần đăng nhập sai. | Từ chối; không cấp phiên hợp lệ; n=1; chưa khóa; lỗi xác thực phù hợp, không lộ chi tiết. |
| EC21 | n_after = n_before + 1 khi đăng nhập sai, tài khoản tồn tại chưa khóa | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=0; gửi một lần đăng nhập sai. | Từ chối; không cấp phiên hợp lệ; n=1; chưa khóa; lỗi xác thực phù hợp, không lộ chi tiết. |
| EC22 | Chưa khóa sau lần sai thứ 1 hoặc 2 | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=0; gửi một lần đăng nhập sai. | Từ chối; không cấp phiên hợp lệ; n=1; chưa khóa; lỗi xác thực phù hợp, không lộ chi tiết. |
| EC23 | Kích hoạt khóa 30 giây ở lần sai thứ 3 | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Chưa khóa; n=2; gửi một lần đăng nhập sai. | Từ chối; n=3; kích hoạt khóa 30 giây; không cấp phiên hợp lệ. |
| EC24 | Hết khóa sau thời hạn; đăng nhập đúng thành công | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; không có request xen giữa; thử đăng nhập sau khoảng 35 giây. | Hết khóa; đăng nhập thành công và trả JWT. Không kết luận bộ đếm được reset; chưa kiểm đúng biên 30 giây. |
| EC25 | Client lưu đúng token sau đăng nhập thành công | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| EC26 | Request cần xác thực gửi Authorization: Bearer <token> đúng token | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Chưa khóa; n=0; client chưa có phiên. Đăng nhập, kiểm JWT, nơi lưu token và request cần xác thực. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |

#### 2.4.2 Tập ca kiểm thử rút gọn

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC01 | EC1: Email hợp định dạng, tài khoản tồn tại; EC4: Mật khẩu đúng của tài khoản tồn tại; EC7: n=0 trước request; EC10: Tài khoản chưa khóa; EC13: Đăng nhập thành công khi thông tin đúng, chưa khóa; EC19: Có JWT xác thực được khi đăng nhập thành công; EC25: Client lưu đúng token sau đăng nhập thành công; EC26: Request cần xác thực gửi Authorization: Bearer <token> đúng token | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tài khoản chưa khóa; chưa có lần sai; client chưa có phiên. | Đăng nhập thành công; JWT xác thực được; client lưu đúng token và gửi Authorization: Bearer <token> đúng token trên request cần xác thực. |
| TC02 | EC1: Email hợp định dạng, tài khoản tồn tại; EC5: Mật khẩu sai của tài khoản tồn tại; EC7: n=0 trước request; EC10: Tài khoản chưa khóa; EC14: Từ chối khi sai thông tin xác thực; EC17: Thông báo lỗi xác thực phù hợp, không lộ chi tiết; EC20: Không cấp phiên/JWT xác thực được khi bị từ chối; EC21: n_after = n_before + 1 khi đăng nhập sai, tài khoản tồn tại chưa khóa; EC22: Chưa khóa sau lần sai thứ 1 hoặc 2 | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Tài khoản chưa khóa; chưa có lần sai. | Từ chối; không cấp phiên hợp lệ; n=1; chưa khóa; lỗi xác thực phù hợp, không lộ chi tiết. |
| TC03 | EC1: Email hợp định dạng, tài khoản tồn tại; EC5: Mật khẩu sai của tài khoản tồn tại; EC8: n=1 trước request sai; EC10: Tài khoản chưa khóa; EC14: Từ chối khi sai thông tin xác thực; EC20: Không cấp phiên/JWT xác thực được khi bị từ chối; EC21: n_after = n_before + 1 khi đăng nhập sai, tài khoản tồn tại chưa khóa; EC22: Chưa khóa sau lần sai thứ 1 hoặc 2 | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Tài khoản chưa khóa; đã sai 1 lần liên tiếp. | Từ chối; không cấp phiên hợp lệ; n=2; chưa khóa. |
| TC04 | EC1: Email hợp định dạng, tài khoản tồn tại; EC5: Mật khẩu sai của tài khoản tồn tại; EC9: n=2 trước request sai; EC10: Tài khoản chưa khóa; EC14: Từ chối khi sai thông tin xác thực; EC20: Không cấp phiên/JWT xác thực được khi bị từ chối; EC21: n_after = n_before + 1 khi đăng nhập sai, tài khoản tồn tại chưa khóa; EC23: Kích hoạt khóa 30 giây ở lần sai thứ 3 | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Tài khoản chưa khóa; đã sai 2 lần liên tiếp. | Từ chối; n=3; kích hoạt khóa 30 giây; không cấp phiên hợp lệ. |
| TC05 | EC1: Email hợp định dạng, tài khoản tồn tại; EC4: Mật khẩu đúng của tài khoản tồn tại; EC11: Tài khoản đang trong thời hạn khóa; EC16: Từ chối khi tài khoản đang khóa; EC18: Thông báo khóa phù hợp, không lộ chi tiết; EC20: Không cấp phiên/JWT xác thực được khi bị từ chối | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tài khoản đang khóa; thử đăng nhập sau khoảng 10 giây từ lúc khóa. | Vẫn từ chối; không cấp phiên hợp lệ; thông báo khóa phù hợp, không lộ chi tiết. |
| TC06 | EC2: Email hợp định dạng, tài khoản không tồn tại; EC6: Mật khẩu chuỗi bất kỳ khi email không tồn tại; EC14: Từ chối khi sai thông tin xác thực; EC17: Thông báo lỗi xác thực phù hợp, không lộ chi tiết; EC20: Không cấp phiên/JWT xác thực được khi bị từ chối | Email: "hw02-absent@example.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Email đã được xác nhận không tồn tại; client chưa có phiên. | Từ chối; không cấp phiên hợp lệ; lỗi xác thực phù hợp, không lộ chi tiết. Không kết luận bộ đếm của tài khoản không tồn tại. |
| TC07 | EC3: Email không rỗng, sai định dạng HTML5; EC15: UI chặn submit email sai định dạng | Email: "abc"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Mở form đăng nhập; submit qua UI. | HTML5 chặn email sai định dạng; không gửi request đăng nhập. |
| TC08 | EC1: Email hợp định dạng, tài khoản tồn tại; EC4: Mật khẩu đúng của tài khoản tồn tại; EC12: Tài khoản đã hết thời hạn khóa; EC13: Đăng nhập thành công khi thông tin đúng, chưa khóa; EC19: Có JWT xác thực được khi đăng nhập thành công; EC24: Hết khóa sau thời hạn; đăng nhập đúng thành công | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; không gửi yêu cầu xen giữa; thử đăng nhập sau khoảng 35 giây từ lúc khóa. | Hết khóa; đăng nhập thành công và trả JWT. Không kết luận bộ đếm được reset; chưa kiểm đúng biên 30 giây. |

26 dòng đại diện được gộp thành 8 TC, bao phủ EC1–EC26. Ví dụ, các dòng EC1, EC4, EC7, EC10, EC13, EC19, EC25 và EC26 cùng dùng tài khoản đúng, chưa khóa, n=0; gộp thành TC01 và giữ đủ kiểm tra đăng nhập, JWT, lưu token và gửi token trong request cần xác thực. Các tình huống sai mật khẩu tại n=0/1/2, đang khóa, tài khoản không tồn tại, sai định dạng và hết khóa được giữ riêng thành TC02–TC08 vì khác dữ liệu hoặc trạng thái ban đầu. Đây là bộ thiết kế rút gọn, chưa khẳng định tối thiểu tuyệt đối hoặc đã thực thi; dữ liệu tài khoản và tiêu chí chi tiết của thông báo lỗi cần xác nhận trước khi chạy.

### 2.5 Boundary Value Analysis

Theo S04 trang 26–27, chọn điểm tại biên và hai phía của biên, giữ các đầu vào còn lại phù hợp. FR-02 có ngưỡng khóa ở lần đăng nhập sai thứ 3 và thời hạn khóa 30 giây (README, mục FR-02).

- Số lần sai: chọn lần sai thứ 2 (dưới ngưỡng), lần sai thứ 3 (tại ngưỡng) và lần gửi sai thứ 4 khi tài khoản còn khóa (sau ngưỡng). TC03–TC04 dùng chung với bảng Domain Testing ở mục 2.4.2; không cộng lại thành test mới.

- Thời gian khóa: gọi t là thời gian tính từ lúc khóa được kích hoạt; chọn t = 0, 1, 29, 30, 31 giây. Bước 1 giây là khoảng cách chọn điểm trong bản thiết kế, không phải khẳng định độ chính xác của hệ thống. Mỗi test thời gian bắt đầu bằng một lần khóa mới; dùng đồng hồ kiểm soát được để thử đúng mốc.

- Không tự đặt biên độ dài email/mật khẩu khi đặc tả không có. Bộ đếm và thời gian không nhập trực tiếp qua UI; giá trị âm và cực trị UI không áp dụng cho các biến trạng thái này.

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC03 | Lần sai thứ 2: ngay dưới ngưỡng 3 lần. | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Tài khoản chưa khóa; đã sai 1 lần liên tiếp. Gửi thêm một lần đăng nhập. | Từ chối; bộ đếm từ 1 tăng thành 2; chưa khóa; không cấp phiên hợp lệ. |
| TC04 | Lần sai thứ 3: tại ngưỡng kích hoạt khóa. | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Tài khoản chưa khóa; đã sai 2 lần liên tiếp. Gửi thêm một lần đăng nhập. | Từ chối; bộ đếm từ 2 tăng thành 3; kích hoạt khóa 30 giây; không cấp phiên hợp lệ. |
| TC09 | Lần gửi sai thứ 4: ngay sau lần kích hoạt khóa, trong thời hạn khóa. | Email: "test@eshop.com"<br>Mật khẩu: "WrongPass9!"<br>Trạng thái ban đầu: Tạo 3 lần sai liên tiếp để khóa tài khoản; gửi lần thứ 4 trước khi hết 30 giây. | Tiếp tục bị từ chối; không cấp phiên hợp lệ. Không kết luận bộ đếm tăng thành 4 hoặc khóa được gia hạn vì đặc tả chưa quy định. |
| TC10 | t = 0 giây: tại mốc bắt đầu khóa. | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; giữ đồng hồ tại thời điểm khóa vừa kích hoạt; thử đăng nhập đúng. | Tài khoản đang khóa; từ chối đăng nhập; không cấp phiên hợp lệ. |
| TC11 | t = 1 giây: ngay sau mốc bắt đầu khóa theo bước chọn 1 giây. | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; thử đăng nhập đúng tại t = 1 giây. | Tài khoản còn khóa; từ chối đăng nhập; không cấp phiên hợp lệ. |
| TC12 | t = 29 giây: ngay trước thời hạn 30 giây theo bước chọn 1 giây. | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; thử đăng nhập đúng tại t = 29 giây. | Tài khoản còn khóa; từ chối đăng nhập; không cấp phiên hợp lệ. |
| TC13 | t = 30 giây: tại đúng thời hạn khóa. | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; dùng đồng hồ kiểm soát được để thử đăng nhập đúng tại t = 30 giây. | Cần xác nhận quy ước xử lý đúng mốc hết hạn (t ≥ 30 hay t > 30) và độ chính xác thời gian trước khi chốt expected; chưa kết luận Pass/Fail. |
| TC14 | t = 31 giây: ngay sau thời hạn 30 giây theo bước chọn 1 giây. | Email: "test@eshop.com"<br>Mật khẩu: "Test1234!"<br>Trạng thái ban đầu: Tạo khóa mới; không có yêu cầu xen giữa; thử đăng nhập đúng tại t = 31 giây. | Khóa đã hết hiệu lực; đăng nhập thành công và trả JWT. Không kết luận bộ đếm được reset. |

Các dòng trên là thiết kế, chưa phải kết quả chạy. Đo t tại thời điểm hệ thống xử lý yêu cầu; đợi bằng đồng hồ bấm tay không chứng minh đã kiểm đúng t = 30 giây. Mốc đúng hạn ở TC13 còn chờ xác nhận quy ước hết hạn và độ chính xác thời gian trước khi chốt expected.


### 2.6 AI gap analysis

- Thiếu sót của AI: đưa TC02 (lần đăng nhập sai thứ 1) vào bảng BVA kiểm tra ngưỡng khóa 3 lần, dù đây không phải điểm sát ngưỡng đang xét.

- Nguyên nhân: AI gộp kiểm tra trạng thái ban đầu và quy tắc tăng bộ đếm vào phần kiểm thử biên mà chưa phân biệt rõ mục tiêu của từng test.

- Sinh viên phát hiện khi đối chiếu S04: với ngưỡng 3 lần, các điểm cần xét là lần sai thứ 2, lần sai thứ 3 và lần gửi sai thứ 4 khi tài khoản còn khóa.

- Hiệu chỉnh: bỏ TC02 khỏi mục 2.5, giữ trong Domain Testing; phần ngưỡng số lần ở BVA giữ TC03, TC04 và TC09. Lần gửi thứ 4 không đồng nghĩa bộ đếm tăng thành 4. Đây là test thừa so với phạm vi biên đang xét, không phải bug của hệ thống.

## 3 Pool B FR09 Mã giảm giá

### 3.1 Yêu cầu làm cơ sở kiểm thử

- Mã phải tồn tại và đang hoạt động (is_active = 1).

- Thời điểm hiện tại phải trước expired_at; tại đúng hạn hoặc sau hạn không áp dụng mã.

- Tổng đơn trước giảm phải ≥ min_order_amount; người dùng có JWT hợp lệ; số lượt đã dùng của người dùng < max_uses_per_user.

- Loại percent: discount_amount = total × discount_value / 100; loại fixed: discount_amount = discount_value. Tổng sau giảm: final_amount = total − discount_amount.

- Dữ liệu mẫu: SAVE10 giảm 10%, ngưỡng 300.000 đ, giới hạn 1 lượt; BIGBUY giảm 50.000 đ, ngưỡng 500.000 đ, giới hạn 1 lượt; VIP100 giảm 100.000 đ, ngưỡng 300.000 đ, giới hạn 2 lượt. Nguồn: eshop-sut/README.md, mục FR-09.

### 3.2 Domain Testing Bước 1 Xác định Input và Output

Từ quy tắc áp dụng mã, xác định mã giảm giá là dữ liệu nhập; kết quả áp dụng/từ chối, số tiền giảm và tổng tiền sau giảm là đầu ra cần quan sát. Các điều kiện phụ thuộc giỏ hàng, tài khoản và bản ghi mã được chuẩn bị làm ngữ cảnh kiểm thử.

| Chức năng | Đầu vào | Đầu ra |
| --- | --- | --- |
| FR-09 Mã giảm giá | Mã giảm giá do người dùng nhập tại Checkout. | Kết quả áp dụng mã; thông báo lỗi nếu không đủ điều kiện; số tiền giảm và tổng tiền sau giảm. |

Ngữ cảnh: tổng đơn do hệ thống tính từ giỏ hàng, trạng thái và loại mã, giá trị giảm, ngưỡng tiền, expired_at, JWT và lịch sử lượt dùng. Chuẩn bị giỏ hàng/sản phẩm để có tổng cần kiểm tra; không xem tổng do client tự gửi là giá trị chuẩn.

### 3.3 Domain Testing Bước 2 Xác định điều kiện và EC

Phân lớp theo 5 điều kiện áp dụng và hai cách tính giảm giá. Trạng thái/thời gian là ngữ cảnh, không phải trường nhập thêm. Các lớp Output thể hiện kết quả đúng được mong đợi, kể cả từ chối áp dụng mã.

| ID | Đầu vào/đầu ra | Lớp tương đương |
| --- | --- | --- |
| EC1 | Mã giảm giá | Mã tồn tại và đang hoạt động |
| EC2 | Mã giảm giá | Mã không tồn tại |
| EC3 | Mã giảm giá | Mã tồn tại nhưng không hoạt động |
| EC4 | Thời điểm kiểm tra | Thời điểm hiện tại trước expired_at |
| EC5 | Thời điểm kiểm tra | Thời điểm hiện tại bằng expired_at |
| EC6 | Thời điểm kiểm tra | Thời điểm hiện tại sau expired_at |
| EC7 | Tổng đơn trước giảm giá | Tổng đơn ≥ min_order_amount |
| EC8 | Tổng đơn trước giảm giá | Tổng đơn < min_order_amount |
| EC9 | Xác thực | Có JWT hợp lệ |
| EC10 | Xác thực | Không có JWT |
| EC11 | Xác thực | JWT không hợp lệ, chẳng hạn đã hết hạn |
| EC12 | Số lượt đã dùng của người dùng | Số lượt đã dùng < max_uses_per_user |
| EC13 | Số lượt đã dùng của người dùng | Số lượt đã dùng = max_uses_per_user |
| EC14 | Số lượt đã dùng của người dùng | Số lượt đã dùng > max_uses_per_user |
| EC15 | Loại mã | Mã loại percent |
| EC16 | Loại mã | Mã loại fixed |
| EC17 | Số tiền giảm | Với percent: discount_amount = total × discount_value / 100 |
| EC18 | Số tiền giảm | Với fixed: discount_amount = discount_value |
| EC19 | Tổng tiền sau giảm | final_amount = total − discount_amount |
| EC20 | Thông báo kết quả | Không áp dụng mã không tồn tại |
| EC21 | Thông báo kết quả | Không áp dụng mã không hoạt động |
| EC22 | Thông báo kết quả | Không áp dụng mã đã đến hoặc qua hạn sử dụng |
| EC23 | Thông báo kết quả | Không áp dụng mã khi tổng đơn dưới ngưỡng |
| EC24 | Thông báo kết quả | Không áp dụng mã khi thiếu JWT hoặc JWT không hợp lệ |
| EC25 | Thông báo kết quả | Không áp dụng mã khi đã dùng hết hoặc vượt giới hạn lượt |

### 3.4 Domain Testing Bước 3 Chọn đại diện và xây dựng test case

Chọn dữ liệu đại diện cho từng EC; giữ các điều kiện khác phù hợp khi kiểm tra một điều kiện không đạt. Các trạng thái ở bảng là điều kiện cần chuẩn bị độc lập cho từng test, chưa phải dữ liệu đã thiết lập hoặc kết quả đã chạy.

#### 3.4.1 Các ca kiểm thử bao phủ phân vùng

| Phân vùng | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| EC1 | Mã tồn tại và đang hoạt động | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC2 | Mã không tồn tại | Mã giảm giá: "NO_SUCH_COUPON"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Xác nhận mã không tồn tại; JWT hợp lệ; chưa có mã khác được áp dụng. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC3 | Mã tồn tại nhưng không hoạt động | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Bản ghi SAVE10 được chuẩn bị is_active = 0; JWT hợp lệ; đã dùng 0 lượt; còn hạn; các điều kiện khác thỏa. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC4 | Thời điểm hiện tại trước expired_at | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC5 | Thời điểm hiện tại bằng expired_at | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra đúng expired_at. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC6 | Thời điểm hiện tại sau expired_at | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra sau expired_at 1 giây. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC7 | Tổng đơn ≥ min_order_amount | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC8 | Tổng đơn < min_order_amount | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 200.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC9 | Có JWT hợp lệ | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC10 | Không có JWT | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động. còn hạn; gửi yêu cầu không có JWT. Không coi lịch sử lượt của một người dùng chưa xác thực là dữ liệu đầu vào độc lập. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC11 | JWT không hợp lệ, chẳng hạn đã hết hạn | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động. còn hạn; gửi yêu cầu với JWT đã hết hạn. Các dữ liệu giỏ hàng và mã còn lại hợp lệ. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC12 | Số lượt đã dùng < max_uses_per_user | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC13 | Số lượt đã dùng = max_uses_per_user | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; người dùng đã dùng 1 lượt. giới hạn 1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC14 | Số lượt đã dùng > max_uses_per_user | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; chuẩn bị lịch sử đã dùng 2 lượt. giới hạn hiện tại 1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC15 | Mã loại percent | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC16 | Mã loại fixed | Mã giảm giá: "BIGBUY"<br>Tổng đơn trước giảm: 600.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 50.000 đ; tổng sau giảm 550.000 đ. |
| EC17 | Với percent: discount_amount = total × discount_value / 100 | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC18 | Với fixed: discount_amount = discount_value | Mã giảm giá: "BIGBUY"<br>Tổng đơn trước giảm: 600.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 50.000 đ; tổng sau giảm 550.000 đ. |
| EC19 | final_amount = total − discount_amount | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| EC20 | Không áp dụng mã không tồn tại | Mã giảm giá: "NO_SUCH_COUPON"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Xác nhận mã không tồn tại; JWT hợp lệ; chưa có mã khác được áp dụng. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC21 | Không áp dụng mã không hoạt động | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Bản ghi SAVE10 được chuẩn bị is_active = 0; JWT hợp lệ; đã dùng 0 lượt; còn hạn; các điều kiện khác thỏa. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC22 | Không áp dụng mã đã đến hoặc qua hạn sử dụng | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra đúng expired_at. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC23 | Không áp dụng mã khi tổng đơn dưới ngưỡng | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 200.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC24 | Không áp dụng mã khi thiếu JWT hoặc JWT không hợp lệ | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động. còn hạn; gửi yêu cầu không có JWT. Không coi lịch sử lượt của một người dùng chưa xác thực là dữ liệu đầu vào độc lập. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| EC25 | Không áp dụng mã khi đã dùng hết hoặc vượt giới hạn lượt | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; người dùng đã dùng 1 lượt. giới hạn 1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |

#### 3.4.2 Tập ca kiểm thử rút gọn

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC01 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC12: Số lượt đã dùng < max_uses_per_user; EC15: Mã loại percent; EC17: Với percent: discount_amount = total × discount_value / 100; EC19: final_amount = total − discount_amount | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| TC02 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC12: Số lượt đã dùng < max_uses_per_user; EC16: Mã loại fixed; EC18: Với fixed: discount_amount = discount_value; EC19: final_amount = total − discount_amount | Mã giảm giá: "BIGBUY"<br>Tổng đơn trước giảm: 600.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 50.000 đ; tổng sau giảm 550.000 đ. |
| TC03 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC12: Số lượt đã dùng < max_uses_per_user; EC16: Mã loại fixed; EC18: Với fixed: discount_amount = discount_value; EC19: final_amount = total − discount_amount | Mã giảm giá: "VIP100"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 1/2 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 100.000 đ; tổng sau giảm 300.000 đ. |
| TC04 | EC2: Mã không tồn tại; EC9: Có JWT hợp lệ; EC20: Không áp dụng mã không tồn tại | Mã giảm giá: "NO_SUCH_COUPON"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Xác nhận mã không tồn tại; JWT hợp lệ; chưa có mã khác được áp dụng. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC05 | EC3: Mã tồn tại nhưng không hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC12: Số lượt đã dùng < max_uses_per_user; EC21: Không áp dụng mã không hoạt động | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Bản ghi SAVE10 được chuẩn bị is_active = 0; JWT hợp lệ; đã dùng 0 lượt; còn hạn; các điều kiện khác thỏa. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC06 | EC1: Mã tồn tại và đang hoạt động; EC5: Thời điểm hiện tại bằng expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC12: Số lượt đã dùng < max_uses_per_user; EC22: Không áp dụng mã đã đến hoặc qua hạn sử dụng | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra đúng expired_at. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC07 | EC1: Mã tồn tại và đang hoạt động; EC6: Thời điểm hiện tại sau expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC12: Số lượt đã dùng < max_uses_per_user; EC22: Không áp dụng mã đã đến hoặc qua hạn sử dụng | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra sau expired_at 1 giây. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC08 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC8: Tổng đơn < min_order_amount; EC9: Có JWT hợp lệ; EC12: Số lượt đã dùng < max_uses_per_user; EC23: Không áp dụng mã khi tổng đơn dưới ngưỡng | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 200.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC09 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC10: Không có JWT; EC24: Không áp dụng mã khi thiếu JWT hoặc JWT không hợp lệ | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động. còn hạn; gửi yêu cầu không có JWT. Không coi lịch sử lượt của một người dùng chưa xác thực là dữ liệu đầu vào độc lập. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC10 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC11: JWT không hợp lệ, chẳng hạn đã hết hạn; EC24: Không áp dụng mã khi thiếu JWT hoặc JWT không hợp lệ | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động. còn hạn; gửi yêu cầu với JWT đã hết hạn. Các dữ liệu giỏ hàng và mã còn lại hợp lệ. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC11 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC13: Số lượt đã dùng = max_uses_per_user; EC25: Không áp dụng mã khi đã dùng hết hoặc vượt giới hạn lượt | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; người dùng đã dùng 1 lượt. giới hạn 1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC12 | EC1: Mã tồn tại và đang hoạt động; EC4: Thời điểm hiện tại trước expired_at; EC7: Tổng đơn ≥ min_order_amount; EC9: Có JWT hợp lệ; EC14: Số lượt đã dùng > max_uses_per_user; EC25: Không áp dụng mã khi đã dùng hết hoặc vượt giới hạn lượt | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; chuẩn bị lịch sử đã dùng 2 lượt. giới hạn hiện tại 1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |

25 dòng đại diện có 11 bộ dữ liệu, ngữ cảnh và kết quả khác nhau; gộp các dòng trùng thành 11 tình huống. Ví dụ, các dòng EC1, EC4, EC7, EC9, EC12, EC15, EC17 và EC19 dùng SAVE10, tổng 400.000 đ, JWT hợp lệ, chưa dùng lượt và còn hạn được gộp thành TC01, kiểm tra giảm 40.000 đ và còn 360.000 đ. Bổ sung TC03 dùng VIP100, đã dùng 1/2 lượt, để kiểm tra vẫn áp dụng được mã khi đã dùng một lượt nhưng chưa đạt giới hạn; tình huống này chưa có trong bảng đại diện. Vì vậy bộ cuối có 12 TC bao phủ EC1–EC25, gồm các tình huống đã gộp và một tình huống bổ sung. Đặc tả chưa nêu quy tắc làm tròn tiền, chuẩn hóa mã hoặc thời điểm tăng lượt dùng; không tự đặt expected cho các điểm này.

### 3.5 Boundary Value Analysis

Theo S04 trang 26–27, chọn điểm ngay dưới, tại và ngay trên các ngưỡng: tổng đơn tối thiểu 300.000/500.000 đ; giới hạn 1/2 lượt; thời điểm expired_at. Bước chọn là 1 đ, 1 lượt và 1 giây. Với ngưỡng 300.000 đ, dùng VIP100 loại fixed để kết quả không phụ thuộc quy tắc làm tròn percent chưa được đặc tả.

expired_at là mốc đầy đủ thực tế của bản ghi thử, không tự suy ra giờ/múi giờ từ ngày hiển thị. Test tại hạn cần đồng hồ kiểm soát được; bước 1 giây không khẳng định độ chính xác hệ thống. Số lượt là lịch sử của đúng người dùng; trường hợp vượt giới hạn cần chuẩn bị dữ liệu lịch sử phù hợp, không giả là người dùng nhập số lượt. Không có biên độ dài mã hoặc cực trị UI được đặc tả để tự bổ sung.

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC13 | VIP100: tổng đơn 299.999 đ, ngay dưới ngưỡng 300.000 đ. | Mã giảm giá: "VIP100"<br>Tổng đơn trước giảm: 299.999 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; đã dùng 1/2 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC14 | VIP100: tổng đơn 300.000 đ, tại ngưỡng được chấp nhận. | Mã giảm giá: "VIP100"<br>Tổng đơn trước giảm: 300.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; đã dùng 1/2 lượt. | Áp dụng mã; giảm 100.000 đ; tổng sau giảm 200.000 đ. |
| TC15 | VIP100: tổng đơn 300.001 đ, ngay trên ngưỡng. | Mã giảm giá: "VIP100"<br>Tổng đơn trước giảm: 300.001 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; đã dùng 1/2 lượt. | Áp dụng mã; giảm 100.000 đ; tổng sau giảm 200.001 đ. |
| TC16 | BIGBUY: tổng đơn 499.999 đ, ngay dưới ngưỡng 500.000 đ. | Mã giảm giá: "BIGBUY"<br>Tổng đơn trước giảm: 499.999 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; đã dùng 0/1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC17 | BIGBUY: tổng đơn 500.000 đ, tại ngưỡng được chấp nhận. | Mã giảm giá: "BIGBUY"<br>Tổng đơn trước giảm: 500.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; đã dùng 0/1 lượt. | Áp dụng mã; giảm 50.000 đ; tổng sau giảm 450.000 đ. |
| TC18 | BIGBUY: tổng đơn 500.001 đ, ngay trên ngưỡng. | Mã giảm giá: "BIGBUY"<br>Tổng đơn trước giảm: 500.001 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; đã dùng 0/1 lượt. | Áp dụng mã; giảm 50.000 đ; tổng sau giảm 450.001 đ. |
| TC01 | SAVE10: đã dùng 0 lượt, ngay dưới giới hạn 1 lượt. | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| TC11 | SAVE10: đã dùng 1 lượt, tại giới hạn nên bị từ chối. | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; người dùng đã dùng 1 lượt. giới hạn 1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC12 | SAVE10: đã dùng 2 lượt, vượt giới hạn 1 lượt. | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; chuẩn bị lịch sử đã dùng 2 lượt. giới hạn hiện tại 1 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC03 | VIP100: đã dùng 1 lượt, ngay dưới giới hạn 2 lượt. | Mã giảm giá: "VIP100"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 1/2 lượt; thời điểm kiểm tra trước expired_at 1 ngày. | Áp dụng mã; giảm 100.000 đ; tổng sau giảm 300.000 đ. |
| TC19 | VIP100: đã dùng 2 lượt, tại giới hạn nên bị từ chối. | Mã giảm giá: "VIP100"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; đã dùng 2 lượt. giới hạn 2 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC20 | VIP100: đã dùng 3 lượt, vượt giới hạn 2 lượt. | Mã giảm giá: "VIP100"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; còn hạn; chuẩn bị lịch sử đã dùng 3 lượt. giới hạn hiện tại 2 lượt. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC21 | Thời điểm hiện tại bằng expired_at − 1 giây, ngay trước hạn. | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; kiểm tra tại expired_at − 1 giây. | Áp dụng mã; giảm 40.000 đ; tổng sau giảm 360.000 đ. |
| TC06 | Thời điểm hiện tại bằng expired_at, tại hạn: không còn thỏa điều kiện trước hạn. | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra đúng expired_at. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |
| TC07 | Thời điểm hiện tại bằng expired_at + 1 giây, ngay sau hạn. | Mã giảm giá: "SAVE10"<br>Tổng đơn trước giảm: 400.000 đ<br>Trạng thái ban đầu: Mã hoạt động; JWT hợp lệ; đã dùng 0 lượt; thời điểm kiểm tra sau expired_at 1 giây. | Không áp dụng giảm giá; phản hồi lỗi phù hợp với điều kiện không đạt. |

BVA gồm 15 dòng, trong đó 6 TC dùng chung với Domain Testing và 9 TC mới; FR-09 có 21 TC thiết kế duy nhất. Chưa thực thi nên chưa có kết luận Pass/Fail.

### 3.6 AI gap analysis

Chưa có thiếu sót AI của FR-09 được sinh viên xác nhận. Các điểm đặc tả chưa rõ được ghi ở mục 3.4, không tự coi là sai sót AI hoặc bug.

## 4 Pool C FR15 Quản lý sản phẩm

### 4.1 Yêu cầu làm cơ sở kiểm thử

- Admin có thể Thêm, Xem, Sửa và Xóa sản phẩm.

- Tên sản phẩm bắt buộc, không rỗng và tối đa 255 ký tự; giá bắt buộc, là số dương (> 0).

- Danh mục bắt buộc, phải chọn từ danh sách có sẵn.

- Khi Sửa, chỉ sản phẩm đích thay đổi; các sản phẩm khác giữ nguyên. Nguồn: eshop-sut/README.md, mục FR-15.

### 4.2 Domain Testing Bước 1 Xác định Input và Output

Từ các thao tác CRUD, xác định thao tác, sản phẩm đích và dữ liệu tên, giá, danh mục là đầu vào tương ứng. Đầu ra gồm dữ liệu hiển thị, kết quả lưu/xóa, phản hồi khi dữ liệu không hợp lệ và việc các sản phẩm khác giữ nguyên khi sửa.

| Chức năng | Đầu vào | Đầu ra |
| --- | --- | --- |
| FR-15 Quản lý sản phẩm | Thao tác Thêm/Xem/Sửa/Xóa; sản phẩm đích khi Xem/Sửa/Xóa; tên, giá và danh mục khi Thêm/Sửa. | Dữ liệu sản phẩm hiển thị; kết quả tạo/sửa/xóa; kết quả không lưu dữ liệu không hợp lệ; dữ liệu các sản phẩm khác sau khi sửa. |

Ngữ cảnh: Admin đã đăng nhập; các sản phẩm và danh mục thử được chuẩn bị trước mỗi test. SP_MUC_TIEU là sản phẩm đích; dùng sản phẩm khác, chẳng hạn SP_DOI_CHUNG, để đối chiếu. DM_A và DM_B là hai danh mục có sẵn cần xác nhận ID, không phải dữ liệu đã được tạo trong lần thiết kế này.

### 4.3 Domain Testing Bước 2 Xác định điều kiện và EC

Phân lớp theo thao tác CRUD và ràng buộc tên, giá, danh mục. Các lớp dữ liệu lỗi được tách theo Thêm/Sửa vì tiền điều kiện và kết quả lưu khác nhau; bỏ hẳn trường trong payload chỉ có expected chắc chắn cho yêu cầu Thêm.

| ID | Đầu vào/đầu ra | Lớp tương đương |
| --- | --- | --- |
| EC1 | Thao tác | Thêm sản phẩm |
| EC2 | Thao tác | Xem sản phẩm |
| EC3 | Thao tác | Sửa sản phẩm |
| EC4 | Thao tác | Xóa sản phẩm |
| EC5 | Tên sản phẩm | Tên không rỗng, dài từ 1 đến 255 ký tự |
| EC6 | Tên sản phẩm khi Thêm | Tên là chuỗi rỗng trong thao tác Thêm |
| EC7 | Tên sản phẩm khi Sửa | Tên là chuỗi rỗng trong thao tác Sửa |
| EC8 | Tên sản phẩm khi Thêm | Tên dài hơn 255 ký tự trong thao tác Thêm |
| EC9 | Tên sản phẩm khi Sửa | Tên dài hơn 255 ký tự trong thao tác Sửa |
| EC10 | Tên sản phẩm | Yêu cầu thêm không có trường tên |
| EC11 | Giá | Giá là số dương (> 0) |
| EC12 | Giá khi Thêm | Giá bằng 0 trong thao tác Thêm |
| EC13 | Giá khi Sửa | Giá bằng 0 trong thao tác Sửa |
| EC14 | Giá khi Thêm | Giá là số âm trong thao tác Thêm |
| EC15 | Giá khi Sửa | Giá là số âm trong thao tác Sửa |
| EC16 | Giá khi Thêm | Giá để trống (chuỗi rỗng) trong thao tác Thêm |
| EC17 | Giá khi Sửa | Giá để trống (chuỗi rỗng) trong thao tác Sửa |
| EC18 | Giá | Yêu cầu thêm không có trường giá |
| EC19 | Giá khi Thêm | Giá không phải số trong thao tác Thêm |
| EC20 | Giá khi Sửa | Giá không phải số trong thao tác Sửa |
| EC21 | Danh mục | Chọn danh mục đang có trong danh sách |
| EC22 | Danh mục khi Thêm | Chưa chọn danh mục trong thao tác Thêm |
| EC23 | Danh mục khi Sửa | Chưa chọn danh mục trong thao tác Sửa |
| EC24 | Danh mục | Yêu cầu thêm không có trường danh mục |
| EC25 | Danh mục khi Thêm | ID danh mục không tồn tại trong danh sách trong thao tác Thêm |
| EC26 | Danh mục khi Sửa | ID danh mục không tồn tại trong danh sách trong thao tác Sửa |
| EC27 | Kết quả thêm | Sản phẩm mới được lưu đúng dữ liệu hợp lệ |
| EC28 | Kết quả xem | Dữ liệu hiển thị khớp sản phẩm đã lưu |
| EC29 | Kết quả sửa | Chỉ sản phẩm đích được cập nhật theo dữ liệu hợp lệ |
| EC30 | Sản phẩm đối chứng | Các sản phẩm khác giữ nguyên sau thao tác sửa |
| EC31 | Kết quả xóa | Sản phẩm đích được xóa khỏi danh sách quản lý |
| EC32 | Kết quả kiểm tra tên | Không lưu dữ liệu tên vi phạm ràng buộc |
| EC33 | Kết quả kiểm tra giá | Không lưu dữ liệu giá vi phạm ràng buộc |
| EC34 | Kết quả kiểm tra danh mục | Không lưu dữ liệu danh mục vi phạm ràng buộc |
| EC35 | Kết quả thêm không hợp lệ | Không tạo sản phẩm mới từ dữ liệu không hợp lệ |
| EC36 | Kết quả sửa không hợp lệ | Không ghi dữ liệu không hợp lệ vào sản phẩm đích |

### 4.4 Domain Testing Bước 3 Chọn đại diện và xây dựng test case

Chọn đại diện cho từng EC, sau đó gộp các dòng dùng cùng dữ liệu, thao tác và kết quả. Mỗi test âm chỉ thay một điều kiện không hợp lệ. Với phép Sửa, đối chiếu sản phẩm đích và các sản phẩm khác ngay sau khi lưu thành công và sau khi tải lại để kiểm tra cả giao diện lẫn dữ liệu được lưu.

#### 4.4.1 Các ca kiểm thử bao phủ phân vùng

| Phân vùng | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| EC1 | Thêm sản phẩm | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Tạo một sản phẩm mới; tải lại danh sách để xác nhận tên SP_THU_FR15, giá 100.000 đ và danh mục DM_A được lưu đúng. |
| EC2 | Xem sản phẩm | Thao tác: Xem<br>Sản phẩm: ID của SP_MUC_TIEU<br>Trạng thái ban đầu: Admin đã đăng nhập; SP_MUC_TIEU đã lưu tên SP_MUC_TIEU, giá 100.000 đ, danh mục DM_A. | Hiển thị đúng sản phẩm đã chọn: tên SP_MUC_TIEU, giá 100.000 đ, danh mục DM_A; đối chiếu với dữ liệu đã lưu. |
| EC3 | Sửa sản phẩm | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15_DA_SUA"<br>Giá: 150.000 đ (số)<br>Danh mục: DM_B (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa.<br>Kiểm tra: sau khi hệ thống xác nhận lưu thành công, quan sát giao diện trước khi tải lại; sau đó tải lại và đối chiếu lần nữa. | Ngay sau khi lưu thành công và sau khi tải lại, chỉ SP_MUC_TIEU đổi đúng tên SP_THU_FR15_DA_SUA, giá 150.000 đ và danh mục DM_B; dữ liệu của mọi sản phẩm khác giữ nguyên so với bản chụp trước khi sửa. |
| EC4 | Xóa sản phẩm | Thao tác: Xóa<br>Sản phẩm: ID của SP_MUC_TIEU<br>Trạng thái ban đầu: Admin đã đăng nhập; sản phẩm đích tồn tại, không liên quan đơn hàng/giỏ hàng thử đang sử dụng; xác nhận xóa. | Sản phẩm đích được xóa; tải lại danh sách quản lý và xác nhận không còn sản phẩm đó. Không mặc định phải xóa cứng trong CSDL. |
| EC5 | Tên không rỗng, dài từ 1 đến 255 ký tự | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Tạo một sản phẩm mới; tải lại danh sách để xác nhận tên SP_THU_FR15, giá 100.000 đ và danh mục DM_A được lưu đúng. |
| EC6 | Tên là chuỗi rỗng trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC7 | Tên là chuỗi rỗng trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu tên không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC8 | Tên dài hơn 255 ký tự trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: "A" lặp đúng 256 lần (256 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC9 | Tên dài hơn 255 ký tự trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "A" lặp đúng 256 lần (256 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu tên không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC10 | Yêu cầu thêm không có trường tên | Thao tác: Thêm<br>Tên sản phẩm: bỏ trường name khỏi payload<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC11 | Giá là số dương (> 0) | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Tạo một sản phẩm mới; tải lại danh sách để xác nhận tên SP_THU_FR15, giá 100.000 đ và danh mục DM_A được lưu đúng. |
| EC12 | Giá bằng 0 trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 0 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC13 | Giá bằng 0 trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 0 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC14 | Giá là số âm trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: -1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC15 | Giá là số âm trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: -1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC16 | Giá để trống (chuỗi rỗng) trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC17 | Giá để trống (chuỗi rỗng) trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC18 | Yêu cầu thêm không có trường giá | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: bỏ trường price khỏi payload<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC19 | Giá không phải số trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "abc" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC20 | Giá không phải số trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "abc" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC21 | Chọn danh mục đang có trong danh sách | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Tạo một sản phẩm mới; tải lại danh sách để xác nhận tên SP_THU_FR15, giá 100.000 đ và danh mục DM_A được lưu đúng. |
| EC22 | Chưa chọn danh mục trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: Chưa chọn (giá trị rỗng)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu danh mục không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC23 | Chưa chọn danh mục trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: Chưa chọn (giá trị rỗng)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu danh mục không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC24 | Yêu cầu thêm không có trường danh mục | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: bỏ trường chọn danh mục khỏi payload theo schema API<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu danh mục không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC25 | ID danh mục không tồn tại trong danh sách trong thao tác Thêm | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: ID 999999 (xác nhận không tồn tại trước khi chạy)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu danh mục không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC26 | ID danh mục không tồn tại trong danh sách trong thao tác Sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: ID 999999 (xác nhận không tồn tại trước khi chạy)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu danh mục không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| EC27 | Sản phẩm mới được lưu đúng dữ liệu hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Tạo một sản phẩm mới; tải lại danh sách để xác nhận tên SP_THU_FR15, giá 100.000 đ và danh mục DM_A được lưu đúng. |
| EC28 | Dữ liệu hiển thị khớp sản phẩm đã lưu | Thao tác: Xem<br>Sản phẩm: ID của SP_MUC_TIEU<br>Trạng thái ban đầu: Admin đã đăng nhập; SP_MUC_TIEU đã lưu tên SP_MUC_TIEU, giá 100.000 đ, danh mục DM_A. | Hiển thị đúng sản phẩm đã chọn: tên SP_MUC_TIEU, giá 100.000 đ, danh mục DM_A; đối chiếu với dữ liệu đã lưu. |
| EC29 | Chỉ sản phẩm đích được cập nhật theo dữ liệu hợp lệ | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15_DA_SUA"<br>Giá: 150.000 đ (số)<br>Danh mục: DM_B (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa.<br>Kiểm tra: sau khi hệ thống xác nhận lưu thành công, quan sát giao diện trước khi tải lại; sau đó tải lại và đối chiếu lần nữa. | Ngay sau khi lưu thành công và sau khi tải lại, chỉ SP_MUC_TIEU đổi đúng tên SP_THU_FR15_DA_SUA, giá 150.000 đ và danh mục DM_B; dữ liệu của mọi sản phẩm khác giữ nguyên so với bản chụp trước khi sửa. |
| EC30 | Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15_DA_SUA"<br>Giá: 150.000 đ (số)<br>Danh mục: DM_B (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa.<br>Kiểm tra: sau khi hệ thống xác nhận lưu thành công, quan sát giao diện trước khi tải lại; sau đó tải lại và đối chiếu lần nữa. | Ngay sau khi lưu thành công và sau khi tải lại, chỉ SP_MUC_TIEU đổi đúng tên SP_THU_FR15_DA_SUA, giá 150.000 đ và danh mục DM_B; dữ liệu của mọi sản phẩm khác giữ nguyên so với bản chụp trước khi sửa. |
| EC31 | Sản phẩm đích được xóa khỏi danh sách quản lý | Thao tác: Xóa<br>Sản phẩm: ID của SP_MUC_TIEU<br>Trạng thái ban đầu: Admin đã đăng nhập; sản phẩm đích tồn tại, không liên quan đơn hàng/giỏ hàng thử đang sử dụng; xác nhận xóa. | Sản phẩm đích được xóa; tải lại danh sách quản lý và xác nhận không còn sản phẩm đó. Không mặc định phải xóa cứng trong CSDL. |
| EC32 | Không lưu dữ liệu tên vi phạm ràng buộc | Thao tác: Thêm<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC33 | Không lưu dữ liệu giá vi phạm ràng buộc | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 0 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC34 | Không lưu dữ liệu danh mục vi phạm ràng buộc | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: Chưa chọn (giá trị rỗng)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu danh mục không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC35 | Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| EC36 | Không ghi dữ liệu không hợp lệ vào sản phẩm đích | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu tên không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |

#### 4.4.2 Tập ca kiểm thử rút gọn

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC01 | EC1: Thêm sản phẩm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC11: Giá là số dương (> 0); EC21: Chọn danh mục đang có trong danh sách; EC27: Sản phẩm mới được lưu đúng dữ liệu hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Tạo một sản phẩm mới; tải lại danh sách để xác nhận tên SP_THU_FR15, giá 100.000 đ và danh mục DM_A được lưu đúng. |
| TC02 | EC2: Xem sản phẩm; EC28: Dữ liệu hiển thị khớp sản phẩm đã lưu | Thao tác: Xem<br>Sản phẩm: ID của SP_MUC_TIEU<br>Trạng thái ban đầu: Admin đã đăng nhập; SP_MUC_TIEU đã lưu tên SP_MUC_TIEU, giá 100.000 đ, danh mục DM_A. | Hiển thị đúng sản phẩm đã chọn: tên SP_MUC_TIEU, giá 100.000 đ, danh mục DM_A; đối chiếu với dữ liệu đã lưu. |
| TC03 | EC3: Sửa sản phẩm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC11: Giá là số dương (> 0); EC21: Chọn danh mục đang có trong danh sách; EC29: Chỉ sản phẩm đích được cập nhật theo dữ liệu hợp lệ; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15_DA_SUA"<br>Giá: 150.000 đ (số)<br>Danh mục: DM_B (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa.<br>Kiểm tra: sau khi hệ thống xác nhận lưu thành công, quan sát giao diện trước khi tải lại; sau đó tải lại và đối chiếu lần nữa. | Ngay sau khi lưu thành công và sau khi tải lại, chỉ SP_MUC_TIEU đổi đúng tên SP_THU_FR15_DA_SUA, giá 150.000 đ và danh mục DM_B; dữ liệu của mọi sản phẩm khác giữ nguyên so với bản chụp trước khi sửa. |
| TC04 | EC4: Xóa sản phẩm; EC31: Sản phẩm đích được xóa khỏi danh sách quản lý | Thao tác: Xóa<br>Sản phẩm: ID của SP_MUC_TIEU<br>Trạng thái ban đầu: Admin đã đăng nhập; sản phẩm đích tồn tại, không liên quan đơn hàng/giỏ hàng thử đang sử dụng; xác nhận xóa. | Sản phẩm đích được xóa; tải lại danh sách quản lý và xác nhận không còn sản phẩm đó. Không mặc định phải xóa cứng trong CSDL. |
| TC05 | EC1: Thêm sản phẩm; EC6: Tên là chuỗi rỗng trong thao tác Thêm; EC11: Giá là số dương (> 0); EC21: Chọn danh mục đang có trong danh sách; EC32: Không lưu dữ liệu tên vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC06 | EC3: Sửa sản phẩm; EC7: Tên là chuỗi rỗng trong thao tác Sửa; EC11: Giá là số dương (> 0); EC21: Chọn danh mục đang có trong danh sách; EC32: Không lưu dữ liệu tên vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu tên không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC07 | EC1: Thêm sản phẩm; EC8: Tên dài hơn 255 ký tự trong thao tác Thêm; EC11: Giá là số dương (> 0); EC21: Chọn danh mục đang có trong danh sách; EC32: Không lưu dữ liệu tên vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "A" lặp đúng 256 lần (256 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC08 | EC3: Sửa sản phẩm; EC9: Tên dài hơn 255 ký tự trong thao tác Sửa; EC11: Giá là số dương (> 0); EC21: Chọn danh mục đang có trong danh sách; EC32: Không lưu dữ liệu tên vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "A" lặp đúng 256 lần (256 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu tên không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC09 | EC1: Thêm sản phẩm; EC10: Yêu cầu thêm không có trường tên; EC11: Giá là số dương (> 0); EC21: Chọn danh mục đang có trong danh sách; EC32: Không lưu dữ liệu tên vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: bỏ trường name khỏi payload<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC10 | EC1: Thêm sản phẩm; EC12: Giá bằng 0 trong thao tác Thêm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 0 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC11 | EC3: Sửa sản phẩm; EC13: Giá bằng 0 trong thao tác Sửa; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 0 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC12 | EC1: Thêm sản phẩm; EC14: Giá là số âm trong thao tác Thêm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: -1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC13 | EC3: Sửa sản phẩm; EC15: Giá là số âm trong thao tác Sửa; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: -1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC14 | EC1: Thêm sản phẩm; EC16: Giá để trống (chuỗi rỗng) trong thao tác Thêm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC15 | EC3: Sửa sản phẩm; EC17: Giá để trống (chuỗi rỗng) trong thao tác Sửa; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC16 | EC1: Thêm sản phẩm; EC18: Yêu cầu thêm không có trường giá; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: bỏ trường price khỏi payload<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC17 | EC1: Thêm sản phẩm; EC19: Giá không phải số trong thao tác Thêm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "abc" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC18 | EC3: Sửa sản phẩm; EC20: Giá không phải số trong thao tác Sửa; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC21: Chọn danh mục đang có trong danh sách; EC33: Không lưu dữ liệu giá vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: "abc" (chuỗi)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC19 | EC1: Thêm sản phẩm; EC22: Chưa chọn danh mục trong thao tác Thêm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC11: Giá là số dương (> 0); EC34: Không lưu dữ liệu danh mục vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: Chưa chọn (giá trị rỗng)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu danh mục không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC20 | EC3: Sửa sản phẩm; EC23: Chưa chọn danh mục trong thao tác Sửa; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC11: Giá là số dương (> 0); EC34: Không lưu dữ liệu danh mục vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: Chưa chọn (giá trị rỗng)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu danh mục không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC21 | EC1: Thêm sản phẩm; EC24: Yêu cầu thêm không có trường danh mục; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC11: Giá là số dương (> 0); EC34: Không lưu dữ liệu danh mục vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: bỏ trường chọn danh mục khỏi payload theo schema API<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu danh mục không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC22 | EC1: Thêm sản phẩm; EC25: ID danh mục không tồn tại trong danh sách trong thao tác Thêm; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC11: Giá là số dương (> 0); EC34: Không lưu dữ liệu danh mục vi phạm ràng buộc; EC35: Không tạo sản phẩm mới từ dữ liệu không hợp lệ | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: ID 999999 (xác nhận không tồn tại trước khi chạy)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu danh mục không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC23 | EC3: Sửa sản phẩm; EC26: ID danh mục không tồn tại trong danh sách trong thao tác Sửa; EC5: Tên không rỗng, dài từ 1 đến 255 ký tự; EC11: Giá là số dương (> 0); EC34: Không lưu dữ liệu danh mục vi phạm ràng buộc; EC36: Không ghi dữ liệu không hợp lệ vào sản phẩm đích; EC30: Các sản phẩm khác giữ nguyên sau thao tác sửa | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 100.000 đ (số)<br>Danh mục: ID 999999 (xác nhận không tồn tại trước khi chạy)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu danh mục không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |

36 dòng đại diện được gộp thành 23 TC, bao phủ EC1–EC36. Ví dụ, EC1, EC5, EC11, EC21 và EC27 cùng dùng thao tác Thêm với tên, giá, danh mục hợp lệ được gộp thành TC01, giữ kiểm tra sản phẩm mới được lưu đúng sau khi tải lại. Các tình huống Thêm/Sửa hoặc lỗi tên, giá, danh mục được giữ riêng khi khác thao tác hay điều kiện cần kiểm tra. Payload bỏ trường, giá sai kiểu và ID danh mục ngoài danh sách cần gửi qua API hoặc đường nhập cho phép kiểm tra; với tên 256 ký tự, bảo đảm dữ liệu không bị UI cắt trước khi gửi. Các test có tiền điều kiện độc lập, chưa phải kết quả đã chạy.

Chưa đặt expected cho chuỗi toàn khoảng trắng, cách đếm Unicode, cập nhật từng phần khi bỏ trường, hoặc xóa sản phẩm đang được đơn hàng tham chiếu vì FR-15 chưa quy định rõ. Chuỗi dài dùng ký tự ASCII để tránh khác biệt cách đếm; không áp quy tắc không trùng tên của danh mục cho sản phẩm.

### 4.5 Boundary Value Analysis

Theo S04 trang 26–27, giữ các trường còn lại hợp lệ và thay đổi một biến tại mỗi lần kiểm tra: độ dài tên có miền 1–255 ký tự, chọn 0/1/2 và 254/255/256; giá phải > 0, chọn −1/0/1 đ. Áp dụng riêng cho cả Thêm và Sửa.

Tên dùng ký tự ASCII với bước 1 ký tự. Giá dùng bước 1 đ để chọn điểm quanh 0; không suy ra giá chỉ được là số nguyên hoặc 1 đ là giá dương nhỏ nhất. Không tự đặt giá tối đa. Danh mục là điều kiện lựa chọn, không có biên số lượng/ID trong đặc tả để tạo BVA; không lấy giới hạn UI chưa xác nhận làm giới hạn nghiệp vụ.

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC05 | Thêm: độ dài tên = 0, dưới biên dưới 1. | Thao tác: Thêm<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC24 | Thêm: độ dài tên = 1, tại biên dưới 1. | Thao tác: Thêm<br>Tên sản phẩm: "A" lặp đúng 1 lần (1 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Lưu sản phẩm mới với tên đúng 1 ký tự; các trường còn lại khớp đầu vào. |
| TC25 | Thêm: độ dài tên = 2, ngay trên biên dưới. | Thao tác: Thêm<br>Tên sản phẩm: "A" lặp đúng 2 lần (2 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Lưu sản phẩm mới với tên đúng 2 ký tự; các trường còn lại khớp đầu vào. |
| TC26 | Thêm: độ dài tên = 254, ngay dưới biên trên. | Thao tác: Thêm<br>Tên sản phẩm: "A" lặp đúng 254 lần (254 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Lưu sản phẩm mới với tên đúng 254 ký tự; các trường còn lại khớp đầu vào. |
| TC27 | Thêm: độ dài tên = 255, tại biên trên 255. | Thao tác: Thêm<br>Tên sản phẩm: "A" lặp đúng 255 lần (255 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Lưu sản phẩm mới với tên đúng 255 ký tự; các trường còn lại khớp đầu vào. |
| TC07 | Thêm: độ dài tên = 256, vượt biên trên. | Thao tác: Thêm<br>Tên sản phẩm: "A" lặp đúng 256 lần (256 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu tên không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC06 | Sửa: độ dài tên = 0, dưới biên dưới 1. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: ""<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu tên không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC28 | Sửa: độ dài tên = 1, tại biên dưới 1. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "A" lặp đúng 1 lần (1 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Lưu sản phẩm đích với tên đúng 1 ký tự; các sản phẩm khác giữ nguyên sau khi tải lại và đối chiếu. |
| TC29 | Sửa: độ dài tên = 2, ngay trên biên dưới. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "A" lặp đúng 2 lần (2 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Lưu sản phẩm đích với tên đúng 2 ký tự; các sản phẩm khác giữ nguyên sau khi tải lại và đối chiếu. |
| TC30 | Sửa: độ dài tên = 254, ngay dưới biên trên. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "A" lặp đúng 254 lần (254 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Lưu sản phẩm đích với tên đúng 254 ký tự; các sản phẩm khác giữ nguyên sau khi tải lại và đối chiếu. |
| TC31 | Sửa: độ dài tên = 255, tại biên trên 255. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "A" lặp đúng 255 lần (255 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Lưu sản phẩm đích với tên đúng 255 ký tự; các sản phẩm khác giữ nguyên sau khi tải lại và đối chiếu. |
| TC08 | Sửa: độ dài tên = 256, vượt biên trên. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "A" lặp đúng 256 lần (256 ký tự ASCII)<br>Giá: 100.000 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu tên không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC12 | Thêm: giá = -1 đ, dưới ngưỡng 0. | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: -1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC10 | Thêm: giá = 0 đ, tại ngưỡng bị loại. | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 0 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Không lưu dữ liệu giá không hợp lệ; không tạo bản ghi sản phẩm mới; số sản phẩm không tăng. |
| TC32 | Thêm: giá = 1 đ, trên ngưỡng 0. | Thao tác: Thêm<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. Ghi nhận số sản phẩm trước khi gửi yêu cầu. | Lưu sản phẩm mới với giá 1 đ; các trường còn lại khớp đầu vào. |
| TC13 | Sửa: giá = -1 đ, dưới ngưỡng 0. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: -1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC11 | Sửa: giá = 0 đ, tại ngưỡng bị loại. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 0 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Không lưu dữ liệu giá không hợp lệ; tải lại để xác nhận sản phẩm đích giữ dữ liệu hợp lệ ban đầu và các sản phẩm khác không đổi. |
| TC33 | Sửa: giá = 1 đ, trên ngưỡng 0. | Thao tác: Sửa<br>Sản phẩm đích: ID của SP_MUC_TIEU đã chuẩn bị<br>Tên sản phẩm: "SP_THU_FR15"<br>Giá: 1 đ (số)<br>Danh mục: DM_A (danh mục có sẵn, ID đã xác nhận)<br>Trạng thái ban đầu: Admin đã đăng nhập; danh mục thử có sẵn. SP_MUC_TIEU đang tồn tại với dữ liệu hợp lệ; chụp dữ liệu của mọi sản phẩm khác làm đối chứng trước khi sửa. | Lưu sản phẩm đích với giá 1 đ; các sản phẩm khác giữ nguyên sau khi tải lại và đối chiếu. |

BVA có 18 dòng: 8 TC dùng chung với Domain Testing và 10 TC mới; FR-15 có 33 TC thiết kế duy nhất. Chưa thực thi nên chưa có kết luận Pass/Fail.

### 4.6 AI gap analysis

- Thiếu sót của AI: expected ban đầu của TC03 chỉ kiểm tra sản phẩm đích và các sản phẩm khác sau khi tải lại, thiếu quan sát giao diện ngay sau khi lưu thành công.

- Nguyên nhân: AI tập trung vào dữ liệu được lưu mà chưa tách điểm quan sát trên giao diện trước khi tải lại; vì vậy test có thể bỏ sót lỗi giao diện làm đổi tên nhiều sản phẩm tạm thời, dù tải lại thì hiển thị đúng.

- Sinh viên phát hiện khi rà soát TC03 và đối chiếu yêu cầu FR-15: khi sửa, chỉ sản phẩm đích thay đổi, các sản phẩm khác giữ nguyên.

- Hiệu chỉnh: bổ sung quan sát và expected tại cả hai thời điểm — ngay sau khi lưu thành công và sau khi tải lại — vào TC03, đồng bộ các dòng đại diện EC3, EC29 và EC30. Không thêm TC/EC mới. Đây là thiếu sót trong thiết kế test, chưa phải bug thực tế đã được xác nhận trên EShop.

## 5 Pool D FR20 Giỏ hàng Mobile

### 5.1 Yêu cầu làm cơ sở kiểm thử

Phạm vi: phần Giỏ hàng trong FR-20 của ứng dụng React Native/Expo; không gồm thanh toán, mã giảm giá hoặc lịch sử đơn hàng. FR-20 chỉ liệt kê chức năng Mobile, nên dùng nghiệp vụ FR-07 và điều kiện số lượng khi thêm ở FR-06 làm cơ sở tham chiếu cho bản thiết kế này; cần sinh viên rà soát phạm vi tham chiếu trước khi thực thi.

- Hiển thị sản phẩm, đơn giá, số lượng có nút +/-, thành tiền và thao tác; thành tiền bằng đơn giá nhân số lượng, tổng tiền bằng tổng thành tiền và có nhãn "Tổng cộng".

- Thêm cùng sản phẩm phải cộng đúng số lượng vào một dòng; số lượng khi thêm là số nguyên dương, tối thiểu 1; có phản hồi trực quan sau khi thêm.

- Xóa sản phẩm phải có hộp thoại xác nhận; đồng ý thì xóa đúng sản phẩm, hủy thì giữ giỏ. Có nút Tiếp tục mua sắm để về trang chủ.

- Giỏ trống có hình minh họa và thông báo rõ ràng. Nguồn: eshop-sut/README.md, FR-20; tham chiếu FR-06, FR-07 và FR-24 về xác nhận xóa/trạng thái trống.

Chưa có quy định về số lượng tối đa, tồn kho, lưu giỏ sau khi đóng ứng dụng, mặc định khi để trống số lượng hoặc cách xử lý nút giảm tại số lượng 1. Không tự đặt expected cho các điểm này; không áp yêu cầu DOM/HTML của Web cho React Native.

Bổ sung theo rà soát của sinh viên: kiểm tra đường nhập tay số lượng đang có trên UI Mobile và việc giữ nguyên giỏ khi điều hướng đi mua sắm rồi quay lại trong cùng phiên, không thay đổi hàng. Đây là kiểm tra bổ sung về tính đúng đắn giao diện và trạng thái, không suy rộng thành yêu cầu lưu giỏ sau khi đóng ứng dụng.

### 5.2 Domain Testing Bước 1 Xác định Input và Output

Từ các hành vi giỏ hàng, xác định thao tác, sản phẩm đích, số lượng thêm hoặc nhập tay trong giỏ và lựa chọn xác nhận là đầu vào. Đầu ra cần quan sát gồm các dòng giỏ, số lượng, tiền, hộp thoại, trạng thái trống và trạng thái giỏ sau điều hướng quay lại.

| Chức năng | Đầu vào | Đầu ra |
| --- | --- | --- |
| FR-20 Giỏ hàng Mobile | Thao tác xem/thêm/điều chỉnh/xóa/tiếp tục mua sắm; sản phẩm đích; số lượng khi thêm hoặc nhập tay trong giỏ; lựa chọn đồng ý/hủy xóa. | Danh sách giỏ và số lượng; thành tiền, tổng tiền; phản hồi thêm/chặn giá trị không hợp lệ; hộp thoại xóa; trạng thái giỏ trống; trang chủ và giỏ sau khi quay lại. |

Ngữ cảnh: nội dung giỏ trước thao tác và sản phẩm đã/chưa có trong giỏ là trạng thái thiết lập, không phải ô nhập. Dữ liệu chuẩn bị: SP_A giá 100.000 đ; SP_B giá 50.000 đ; hai sản phẩm tồn tại, khác ID, giá không đổi trong lần thử. Mỗi TC bắt đầu với giỏ đã chuẩn bị riêng; quan sát trên ứng dụng Mobile, không thay bằng giao diện Web thu nhỏ.

### 5.3 Domain Testing Bước 2 Xác định điều kiện và EC

Tách lớp theo thao tác và trạng thái làm thay đổi kết quả: thêm sản phẩm mới/đã có, giỏ trống/có hàng, đồng ý/hủy xóa. Số lượng thêm được chia thành số nguyên dương, số nguyên không dương, số không nguyên và chuỗi không phải số. EC đầu ra mô tả kết quả cần kiểm tra, gồm cả việc không chấp nhận giá trị ngoài miền; không coi kết quả âm đúng đặc tả là bug.

| ID | Đầu vào/đầu ra | Lớp tương đương |
| --- | --- | --- |
| EC1 | Thao tác | Xem giỏ hàng |
| EC2 | Thao tác | Thêm sản phẩm vào giỏ |
| EC3 | Thao tác | Điều chỉnh số lượng trong giỏ |
| EC4 | Thao tác | Xóa sản phẩm khỏi giỏ |
| EC5 | Thao tác | Tiếp tục mua sắm |
| EC6 | Sản phẩm khi thêm | Sản phẩm chưa có trong giỏ trước khi thêm |
| EC7 | Sản phẩm khi thêm | Sản phẩm đã có trong giỏ trước khi thêm |
| EC8 | Số lượng khi thêm | Số nguyên dương q >= 1 |
| EC9 | Số lượng khi thêm | Số nguyên q <= 0 |
| EC10 | Số lượng khi thêm | Giá trị số không nguyên |
| EC11 | Số lượng khi thêm | Chuỗi không biểu diễn số |
| EC12 | Giỏ hàng trước khi xem | Giỏ trống, không có dòng sản phẩm |
| EC13 | Giỏ hàng trước khi xem | Giỏ có ít nhất một dòng sản phẩm |
| EC14 | Lựa chọn xác nhận xóa | Đồng ý xóa trong hộp thoại |
| EC15 | Lựa chọn xác nhận xóa | Hủy thao tác trong hộp thoại |
| EC16 | Điều chỉnh số lượng | Tăng/giảm một đơn vị, số lượng kết quả vẫn >= 1 |
| EC17 | Hiển thị giỏ có hàng | Hiển thị sản phẩm, đơn giá, số lượng, thành tiền và thao tác; có nút +/- |
| EC18 | Kết quả thêm sản phẩm đã có | Giữ một dòng cho cùng sản phẩm, cộng đúng số lượng thêm và có phản hồi trực quan |
| EC19 | Kết quả điều chỉnh số lượng | Chỉ dòng đích đổi đúng số lượng; các dòng khác giữ nguyên |
| EC20 | Thành tiền và tổng tiền | Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" |
| EC21 | Kết quả nhập số lượng không hợp lệ | Không chấp nhận giá trị số lượng ngoài miền số nguyên dương |
| EC22 | Hộp thoại xóa | Hiện xác nhận trước khi thay đổi giỏ |
| EC23 | Kết quả đồng ý xóa | Bỏ đúng sản phẩm đích, giữ các sản phẩm khác |
| EC24 | Kết quả hủy xóa | Giữ nguyên sản phẩm, số lượng và tổng tiền |
| EC25 | Kết quả tiếp tục mua sắm | Quay về trang chủ; giỏ giữ nguyên khi quay lại trong cùng phiên, không thêm/xóa hàng |
| EC26 | Hiển thị giỏ trống | Có hình minh họa và thông báo giỏ hàng trống rõ ràng |
| EC27 | Kết quả thêm sản phẩm chưa có | Tạo một dòng mới với đúng sản phẩm và số lượng, có phản hồi trực quan |
| EC28 | Giỏ hàng trước khi xóa | Chỉ còn sản phẩm đích; xóa được xác nhận sẽ làm giỏ trống |
| EC29 | Điều chỉnh số lượng bằng nhập tay | Nhập trực tiếp một số nguyên dương vào ô số lượng của sản phẩm trong giỏ |

### 5.4 Domain Testing Bước 3 Chọn đại diện và xây dựng test case

Chọn một tình huống cụ thể cho từng EC, sau đó gộp các dòng dùng cùng dữ liệu, trạng thái, hành động và expected. Các test số lượng không hợp lệ chỉ thay giá trị số lượng; sản phẩm đích và giỏ ban đầu vẫn hợp lệ. Dữ liệu chuẩn bị: SP_A giá 100.000 đ; SP_B giá 50.000 đ; hai sản phẩm tồn tại, khác ID, giá không đổi trong lần thử.

#### 5.4.1 Các ca kiểm thử bao phủ phân vùng

| Phân vùng | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| EC1 | Xem giỏ hàng | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: Giỏ trống. | Hiển thị hình minh họa và thông báo giỏ hàng trống rõ ràng; không hiển thị dòng sản phẩm giả. |
| EC2 | Thêm sản phẩm vào giỏ | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 2. | Có thêm đúng một dòng SP_A số lượng 1, thành tiền 100.000 đ; SP_B vẫn số lượng 2, thành tiền 100.000 đ; Tổng cộng = 200.000 đ. Có phản hồi trực quan khi thêm. |
| EC3 | Điều chỉnh số lượng trong giỏ | Thao tác: Bấm + một lần ở SP_A, quan sát; sau đó bấm - một lần ở SP_A, quan sát<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Sau +: A số lượng 3, thành tiền 300.000 đ, Tổng cộng = 350.000 đ. Sau -: A số lượng 2, thành tiền 200.000 đ, Tổng cộng = 250.000 đ. B luôn giữ số lượng 1 và thành tiền 50.000 đ. |
| EC4 | Xóa sản phẩm khỏi giỏ | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Hủy<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có hộp thoại xác nhận; trước khi chọn và sau khi Hủy, A vẫn số lượng 2, B vẫn số lượng 1; Tổng cộng = 250.000 đ. |
| EC5 | Tiếp tục mua sắm | Thao tác: Ghi nhận giỏ; bấm Tiếp tục mua sắm; không thêm/xóa hoặc sửa hàng; mở lại Giỏ hàng trong cùng phiên<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1; Tổng cộng = 250.000 đ. | Chuyển về trang chủ, hiển thị danh sách sản phẩm. Khi quay lại giỏ, vẫn đúng hai sản phẩm: A số lượng 2, thành tiền 200.000 đ; B số lượng 1, thành tiền 50.000 đ; Tổng cộng = 250.000 đ. |
| EC6 | Sản phẩm chưa có trong giỏ trước khi thêm | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 2. | Có thêm đúng một dòng SP_A số lượng 1, thành tiền 100.000 đ; SP_B vẫn số lượng 2, thành tiền 100.000 đ; Tổng cộng = 200.000 đ. Có phản hồi trực quan khi thêm. |
| EC7 | Sản phẩm đã có trong giỏ trước khi thêm | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 3<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | SP_A chỉ có một dòng, số lượng 5, thành tiền 500.000 đ; SP_B giữ số lượng 1, thành tiền 50.000 đ; Tổng cộng = 550.000 đ. Có phản hồi trực quan khi thêm. |
| EC8 | Số nguyên dương q >= 1 | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 2. | Có thêm đúng một dòng SP_A số lượng 1, thành tiền 100.000 đ; SP_B vẫn số lượng 2, thành tiền 100.000 đ; Tổng cộng = 200.000 đ. Có phản hồi trực quan khi thêm. |
| EC9 | Số nguyên q <= 0 | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 0<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ 0 vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| EC10 | Giá trị số không nguyên | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1.5<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ 1.5 vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| EC11 | Chuỗi không biểu diễn số | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: "abc"<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ "abc" vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| EC12 | Giỏ trống, không có dòng sản phẩm | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: Giỏ trống. | Hiển thị hình minh họa và thông báo giỏ hàng trống rõ ràng; không hiển thị dòng sản phẩm giả. |
| EC13 | Giỏ có ít nhất một dòng sản phẩm | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Hiển thị đúng hai sản phẩm, đơn giá, số lượng, thành tiền, thao tác và nút +/-; thành tiền A = 200.000 đ, B = 50.000 đ; Tổng cộng = 250.000 đ. |
| EC14 | Đồng ý xóa trong hộp thoại | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Đồng ý<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có xác nhận và giỏ chưa đổi trước khi đồng ý. Sau khi đồng ý, chỉ A bị xóa; B vẫn số lượng 1, thành tiền 50.000 đ; Tổng cộng = 50.000 đ. |
| EC15 | Hủy thao tác trong hộp thoại | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Hủy<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có hộp thoại xác nhận; trước khi chọn và sau khi Hủy, A vẫn số lượng 2, B vẫn số lượng 1; Tổng cộng = 250.000 đ. |
| EC16 | Tăng/giảm một đơn vị, số lượng kết quả vẫn >= 1 | Thao tác: Bấm + một lần ở SP_A, quan sát; sau đó bấm - một lần ở SP_A, quan sát<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Sau +: A số lượng 3, thành tiền 300.000 đ, Tổng cộng = 350.000 đ. Sau -: A số lượng 2, thành tiền 200.000 đ, Tổng cộng = 250.000 đ. B luôn giữ số lượng 1 và thành tiền 50.000 đ. |
| EC17 | Hiển thị sản phẩm, đơn giá, số lượng, thành tiền và thao tác; có nút +/- | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Hiển thị đúng hai sản phẩm, đơn giá, số lượng, thành tiền, thao tác và nút +/-; thành tiền A = 200.000 đ, B = 50.000 đ; Tổng cộng = 250.000 đ. |
| EC18 | Giữ một dòng cho cùng sản phẩm, cộng đúng số lượng thêm và có phản hồi trực quan | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 3<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | SP_A chỉ có một dòng, số lượng 5, thành tiền 500.000 đ; SP_B giữ số lượng 1, thành tiền 50.000 đ; Tổng cộng = 550.000 đ. Có phản hồi trực quan khi thêm. |
| EC19 | Chỉ dòng đích đổi đúng số lượng; các dòng khác giữ nguyên | Thao tác: Bấm + một lần ở SP_A, quan sát; sau đó bấm - một lần ở SP_A, quan sát<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Sau +: A số lượng 3, thành tiền 300.000 đ, Tổng cộng = 350.000 đ. Sau -: A số lượng 2, thành tiền 200.000 đ, Tổng cộng = 250.000 đ. B luôn giữ số lượng 1 và thành tiền 50.000 đ. |
| EC20 | Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Hiển thị đúng hai sản phẩm, đơn giá, số lượng, thành tiền, thao tác và nút +/-; thành tiền A = 200.000 đ, B = 50.000 đ; Tổng cộng = 250.000 đ. |
| EC21 | Không chấp nhận giá trị số lượng ngoài miền số nguyên dương | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 0<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ 0 vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| EC22 | Hiện xác nhận trước khi thay đổi giỏ | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Hủy<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có hộp thoại xác nhận; trước khi chọn và sau khi Hủy, A vẫn số lượng 2, B vẫn số lượng 1; Tổng cộng = 250.000 đ. |
| EC23 | Bỏ đúng sản phẩm đích, giữ các sản phẩm khác | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Đồng ý<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có xác nhận và giỏ chưa đổi trước khi đồng ý. Sau khi đồng ý, chỉ A bị xóa; B vẫn số lượng 1, thành tiền 50.000 đ; Tổng cộng = 50.000 đ. |
| EC24 | Giữ nguyên sản phẩm, số lượng và tổng tiền | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Hủy<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có hộp thoại xác nhận; trước khi chọn và sau khi Hủy, A vẫn số lượng 2, B vẫn số lượng 1; Tổng cộng = 250.000 đ. |
| EC25 | Quay về trang chủ; giỏ giữ nguyên khi quay lại trong cùng phiên, không thêm/xóa hàng | Thao tác: Ghi nhận giỏ; bấm Tiếp tục mua sắm; không thêm/xóa hoặc sửa hàng; mở lại Giỏ hàng trong cùng phiên<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1; Tổng cộng = 250.000 đ. | Chuyển về trang chủ, hiển thị danh sách sản phẩm. Khi quay lại giỏ, vẫn đúng hai sản phẩm: A số lượng 2, thành tiền 200.000 đ; B số lượng 1, thành tiền 50.000 đ; Tổng cộng = 250.000 đ. |
| EC26 | Có hình minh họa và thông báo giỏ hàng trống rõ ràng | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: Giỏ trống. | Hiển thị hình minh họa và thông báo giỏ hàng trống rõ ràng; không hiển thị dòng sản phẩm giả. |
| EC27 | Tạo một dòng mới với đúng sản phẩm và số lượng, có phản hồi trực quan | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 2. | Có thêm đúng một dòng SP_A số lượng 1, thành tiền 100.000 đ; SP_B vẫn số lượng 2, thành tiền 100.000 đ; Tổng cộng = 200.000 đ. Có phản hồi trực quan khi thêm. |
| EC28 | Chỉ còn sản phẩm đích; xóa được xác nhận sẽ làm giỏ trống | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Đồng ý<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: Chỉ có SP_A số lượng 1. | Có xác nhận trước khi xóa; sau khi đồng ý, không còn dòng SP_A; hiển thị hình minh họa và thông báo giỏ trống rõ ràng. |
| EC29 | Nhập trực tiếp một số nguyên dương vào ô số lượng của sản phẩm trong giỏ | Thao tác: Chọn ô số lượng của SP_A trong giỏ, thay toàn bộ nội dung bằng "3"; kết thúc chỉnh sửa theo UI và quan sát giỏ<br>Sản phẩm đích: "SP_A"<br>Số lượng nhập: "3"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1; Tổng cộng = 250.000 đ. | SP_A có đúng số lượng 3, thành tiền 300.000 đ; SP_B vẫn số lượng 1, thành tiền 50.000 đ; Tổng cộng = 350.000 đ. Không tạo thêm dòng SP_A. |

#### 5.4.2 Tập ca kiểm thử rút gọn

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC01 | EC1: Xem giỏ hàng; EC12: Giỏ trống, không có dòng sản phẩm; EC26: Có hình minh họa và thông báo giỏ hàng trống rõ ràng | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: Giỏ trống. | Hiển thị hình minh họa và thông báo giỏ hàng trống rõ ràng; không hiển thị dòng sản phẩm giả. |
| TC02 | EC1: Xem giỏ hàng; EC13: Giỏ có ít nhất một dòng sản phẩm; EC17: Hiển thị sản phẩm, đơn giá, số lượng, thành tiền và thao tác; có nút +/-; EC20: Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" | Thao tác: Mở màn hình Giỏ hàng trên Mobile<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Hiển thị đúng hai sản phẩm, đơn giá, số lượng, thành tiền, thao tác và nút +/-; thành tiền A = 200.000 đ, B = 50.000 đ; Tổng cộng = 250.000 đ. |
| TC03 | EC2: Thêm sản phẩm vào giỏ; EC6: Sản phẩm chưa có trong giỏ trước khi thêm; EC8: Số nguyên dương q >= 1; EC27: Tạo một dòng mới với đúng sản phẩm và số lượng, có phản hồi trực quan; EC20: Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 2. | Có thêm đúng một dòng SP_A số lượng 1, thành tiền 100.000 đ; SP_B vẫn số lượng 2, thành tiền 100.000 đ; Tổng cộng = 200.000 đ. Có phản hồi trực quan khi thêm. |
| TC04 | EC2: Thêm sản phẩm vào giỏ; EC7: Sản phẩm đã có trong giỏ trước khi thêm; EC8: Số nguyên dương q >= 1; EC18: Giữ một dòng cho cùng sản phẩm, cộng đúng số lượng thêm và có phản hồi trực quan; EC20: Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 3<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | SP_A chỉ có một dòng, số lượng 5, thành tiền 500.000 đ; SP_B giữ số lượng 1, thành tiền 50.000 đ; Tổng cộng = 550.000 đ. Có phản hồi trực quan khi thêm. |
| TC05 | EC3: Điều chỉnh số lượng trong giỏ; EC16: Tăng/giảm một đơn vị, số lượng kết quả vẫn >= 1; EC19: Chỉ dòng đích đổi đúng số lượng; các dòng khác giữ nguyên; EC20: Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" | Thao tác: Bấm + một lần ở SP_A, quan sát; sau đó bấm - một lần ở SP_A, quan sát<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Sau +: A số lượng 3, thành tiền 300.000 đ, Tổng cộng = 350.000 đ. Sau -: A số lượng 2, thành tiền 200.000 đ, Tổng cộng = 250.000 đ. B luôn giữ số lượng 1 và thành tiền 50.000 đ. |
| TC06 | EC4: Xóa sản phẩm khỏi giỏ; EC15: Hủy thao tác trong hộp thoại; EC22: Hiện xác nhận trước khi thay đổi giỏ; EC24: Giữ nguyên sản phẩm, số lượng và tổng tiền | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Hủy<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có hộp thoại xác nhận; trước khi chọn và sau khi Hủy, A vẫn số lượng 2, B vẫn số lượng 1; Tổng cộng = 250.000 đ. |
| TC07 | EC4: Xóa sản phẩm khỏi giỏ; EC14: Đồng ý xóa trong hộp thoại; EC22: Hiện xác nhận trước khi thay đổi giỏ; EC23: Bỏ đúng sản phẩm đích, giữ các sản phẩm khác; EC20: Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Đồng ý<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1. | Có xác nhận và giỏ chưa đổi trước khi đồng ý. Sau khi đồng ý, chỉ A bị xóa; B vẫn số lượng 1, thành tiền 50.000 đ; Tổng cộng = 50.000 đ. |
| TC08 | EC4: Xóa sản phẩm khỏi giỏ; EC14: Đồng ý xóa trong hộp thoại; EC22: Hiện xác nhận trước khi thay đổi giỏ; EC23: Bỏ đúng sản phẩm đích, giữ các sản phẩm khác; EC26: Có hình minh họa và thông báo giỏ hàng trống rõ ràng; EC28: Chỉ còn sản phẩm đích; xóa được xác nhận sẽ làm giỏ trống | Thao tác: Bấm Xóa SP_A; quan sát trước khi chọn; chọn Đồng ý<br>Sản phẩm đích: "SP_A"<br>Trạng thái ban đầu: Chỉ có SP_A số lượng 1. | Có xác nhận trước khi xóa; sau khi đồng ý, không còn dòng SP_A; hiển thị hình minh họa và thông báo giỏ trống rõ ràng. |
| TC09 | EC5: Tiếp tục mua sắm; EC25: Quay về trang chủ; giỏ giữ nguyên khi quay lại trong cùng phiên, không thêm/xóa hàng | Thao tác: Ghi nhận giỏ; bấm Tiếp tục mua sắm; không thêm/xóa hoặc sửa hàng; mở lại Giỏ hàng trong cùng phiên<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1; Tổng cộng = 250.000 đ. | Chuyển về trang chủ, hiển thị danh sách sản phẩm. Khi quay lại giỏ, vẫn đúng hai sản phẩm: A số lượng 2, thành tiền 200.000 đ; B số lượng 1, thành tiền 50.000 đ; Tổng cộng = 250.000 đ. |
| TC10 | EC2: Thêm sản phẩm vào giỏ; EC6: Sản phẩm chưa có trong giỏ trước khi thêm; EC9: Số nguyên q <= 0; EC21: Không chấp nhận giá trị số lượng ngoài miền số nguyên dương | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 0<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ 0 vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| TC11 | EC2: Thêm sản phẩm vào giỏ; EC6: Sản phẩm chưa có trong giỏ trước khi thêm; EC10: Giá trị số không nguyên; EC21: Không chấp nhận giá trị số lượng ngoài miền số nguyên dương | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1.5<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ 1.5 vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| TC12 | EC2: Thêm sản phẩm vào giỏ; EC6: Sản phẩm chưa có trong giỏ trước khi thêm; EC11: Chuỗi không biểu diễn số; EC21: Không chấp nhận giá trị số lượng ngoài miền số nguyên dương | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: "abc"<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ "abc" vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| TC14 | EC3: Điều chỉnh số lượng trong giỏ; EC29: Nhập trực tiếp một số nguyên dương vào ô số lượng của sản phẩm trong giỏ; EC19: Chỉ dòng đích đổi đúng số lượng; các dòng khác giữ nguyên; EC20: Thành tiền = đơn giá x số lượng; tổng = tổng thành tiền; nhãn "Tổng cộng" | Thao tác: Chọn ô số lượng của SP_A trong giỏ, thay toàn bộ nội dung bằng "3"; kết thúc chỉnh sửa theo UI và quan sát giỏ<br>Sản phẩm đích: "SP_A"<br>Số lượng nhập: "3"<br>Trạng thái ban đầu: SP_A số lượng 2; SP_B số lượng 1; Tổng cộng = 250.000 đ. | SP_A có đúng số lượng 3, thành tiền 300.000 đ; SP_B vẫn số lượng 1, thành tiền 50.000 đ; Tổng cộng = 350.000 đ. Không tạo thêm dòng SP_A. |

29 dòng đại diện được gộp thành 13 TC Domain Testing, bao phủ EC1–EC29. Ví dụ, EC2, EC6, EC8, EC20 và EC27 cùng dùng thêm SP_A số lượng 1 vào giỏ chỉ có SP_B, được gộp thành TC03 và giữ kiểm tra dòng mới, dòng đối chứng và tổng tiền. Thêm lại sản phẩm, điều chỉnh, hủy xóa và đồng ý xóa giữ riêng vì khác hành động hoặc trạng thái. EC28/TC08 kiểm chuyển từ một dòng sang giỏ trống; EC29/TC14 kiểm nhập tay số lượng, tách khỏi +/- ở TC05. Giữ nguyên mã TC13 dành cho BVA; không đổi mã TC cũ. Đây là tập rút gọn, chưa chứng minh tối thiểu tuyệt đối.

Khi thử 1.5 hoặc "abc", kiểm tra giá trị ô nhập trước khi gửi. Nếu bàn phím/ô nhập Mobile chặn giá trị ngay tại UI, ghi nhận cơ chế chặn thực tế; không sửa mã ứng dụng để ép dữ liệu và không tự coi phần chưa tới được là đã chạy. Trường hợp nhập rỗng chưa có oracle vì đặc tả chưa nêu mặc định. Các expected chưa quy định câu chữ lỗi cụ thể.

Ghi chú TC10–TC12: đặc tả chưa quy định việc tự chuyển số lượng không hợp lệ thành 1 rồi thêm sản phẩm. Nếu hệ thống có hành vi này, ghi nhận kết quả thực tế và chờ xác nhận quy tắc trước khi kết luận Pass/Fail cho toàn bộ TC. Lưu chính giá trị 0, 1.5 hoặc "abc" làm số lượng trong giỏ là vi phạm miền số nguyên dương; không tự xem việc chuẩn hóa thành 1 là Pass hoặc Fail. Ghi chú này cũng áp dụng TC10 dùng chung ở BVA.

### 5.5 Boundary Value Analysis

Theo S04 trang 26–27, số lượng khi thêm có miền số nguyên q >= 1, biên dưới đóng tại 1 và bước δ = 1. Chọn 0 (ngay dưới), 1 (tại biên), 2 (ngay trên); giữ sản phẩm chưa có trong giỏ và các điều kiện còn lại hợp lệ. Giá trị trong miền đã có ở TC04 với q = 3. Không có biên trên trong đặc tả nên không tự tạo giá trị tối đa.

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |
| TC10 | Số lượng thêm = 0, ngay dưới biên dưới 1; EC2, EC6, EC9, EC21. | Thao tác: Mở chi tiết SP_A, nhập giá trị thử và bấm Thêm vào giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 0<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 1. | Không đưa số lượng không hợp lệ 0 vào giỏ. SP_B giữ nguyên số lượng 1 và thành tiền 50.000 đ. Việc tự chuyển thành 1 rồi thêm SP_A cần xác nhận quy tắc trước khi kết luận toàn bộ TC (xem ghi chú TC10–TC12). |
| TC03 | Số lượng thêm = 1, tại biên dưới; EC2, EC6, EC8, EC20, EC27. | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 1<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 2. | Có thêm đúng một dòng SP_A số lượng 1, thành tiền 100.000 đ; SP_B vẫn số lượng 2, thành tiền 100.000 đ; Tổng cộng = 200.000 đ. Có phản hồi trực quan khi thêm. |
| TC13 | Số lượng thêm = 2, ngay trên biên dưới; EC2, EC6, EC8, EC20, EC27. | Thao tác: Mở chi tiết SP_A, nhập số lượng rồi bấm Thêm vào giỏ; mở giỏ<br>Sản phẩm: "SP_A"<br>Số lượng thêm: 2<br>Trạng thái ban đầu: Chỉ có SP_B số lượng 2. | Có đúng một dòng SP_A số lượng 2, thành tiền 200.000 đ; SP_B vẫn số lượng 2, thành tiền 100.000 đ; Tổng cộng = 300.000 đ. Có phản hồi trực quan khi thêm. |

BVA có 3 TC: TC10 và TC03 dùng chung với Domain Testing, TC13 bổ sung; FR-20 có 14 TC thiết kế duy nhất sau khi thêm TC14 nhập tay. Dòng biên ghi cả EC đầu vào/ngữ cảnh và EC đầu ra dự kiến để kiểm tra kết quả, không chỉ kiểm tra giá trị ô nhập.

Thành tiền và tổng tiền là đầu ra phụ thuộc đơn giá/số lượng, không có khoảng giới hạn riêng để chọn BVA; kiểm bằng phép tính cụ thể trong các TC. Trạng thái giỏ trống và chuyển một dòng thành trống đã có TC01/TC08; lựa chọn xác nhận là phân lớp rời rạc. Chưa có giới hạn UI Mobile được đo để bổ sung điểm cực trị. Sinh viên đã rà soát và phát hiện ba điểm ở mục 5.6. Kết quả thực thi Android native, ảnh và video được cập nhật trong README.md; TC10–TC12 còn chờ xác nhận oracle/giới hạn nhập liệu.

### 5.6 AI gap analysis

Sinh viên phát hiện ba điểm sau khi rà soát thiết kế FR-20; AI đã đối chiếu và sửa. Đây là thiếu sót của bộ thiết kế/expected. Bug thực tế của Mobile được báo cáo riêng trong bug-reports và GitHub Issues, không đồng nhất số thiếu sót thiết kế với số bug.

- Thiếu đường nhập tay số lượng: TC05 ban đầu chỉ kiểm tra +/-. AI tập trung vào thao tác được FR-07 nêu mà chưa kiểm đủ đường nhập trực tiếp trên UI Mobile. Hiệu chỉnh: thêm EC29, dòng đại diện và TC14 nhập "3" vào giỏ; kiểm đúng số lượng, thành tiền, tổng tiền và sản phẩm đối chứng giữ nguyên. Không thay TC05.

- Thiếu kiểm tra giữ giỏ khi điều hướng: TC09 ban đầu chỉ kiểm tra về trang chủ. AI dừng quan sát tại đích điều hướng, chưa đối chiếu trạng thái giỏ khi quay lại. Hiệu chỉnh: mở rộng TC09 và EC25 bằng chuỗi đi mua sắm rồi quay lại trong cùng phiên, không đổi hàng; kiểm giỏ, số lượng và tổng tiền giữ nguyên, không thêm TC mới.

- Expected dữ liệu không hợp lệ chưa đủ rõ: TC10–TC12 chưa tách ràng buộc số nguyên dương khỏi quy tắc chuẩn hóa chưa được đặc tả. AI đã nêu điểm chưa rõ nhưng chưa hướng dẫn đánh giá khi ứng dụng tự chuyển thành 1 rồi thêm hàng. Hiệu chỉnh: viết rõ không đưa giá trị 0, 1.5, "abc" làm số lượng trong giỏ, giữ SP_B; bổ sung ghi chú chờ xác nhận quy tắc chuẩn hóa trước khi chốt toàn bộ TC, đồng bộ TC10 ở BVA. Không tự kết luận phải từ chối toàn bộ thao tác.

Kết quả sau khi bổ sung kiểm thử: TC14 nhập tay do sinh viên đề xuất đã tái hiện việc nhập 3 nhưng ứng dụng hiển thị 4, làm sai thành tiền và tổng tiền; SP_B đối chứng giữ nguyên. Đã lập BUG-FR20-005 kèm ảnh Android và hồ sơ chạy. Với TC10–TC12, không tự coi việc chuẩn hóa thành 1 là bug khi chưa có quy tắc xác nhận.

## 6 Tổng kết và hồ sơ hỗ trợ

Kết quả thực thi, số TC đã thiết kế/đã chạy/Pass/Fail/chưa chạy, bug và video của bốn FR được theo dõi trong README.md. FR-20 Giỏ hàng Mobile có 14 TC thiết kế; hồ sơ Android native và video lưu trong jest-tests/runs và videos. TC10–TC12 chưa thể chốt toàn bộ kết quả do oracle/giới hạn nhập liệu. Không đếm trùng TC dùng chung Domain Testing/BVA; không suy ra đã hoàn thành toàn bộ kiểm thử từ số TC thiết kế.

## 7 Nhận xét phản biện về AI (AI Critique)

Trong bài tập này, AI giúp tôi phân lớp tương đương, chọn giá trị biên và xây dựng báo cáo, nhưng kết quả cần được rà soát. Ban đầu, AI thêm nhiều cột, ký hiệu và phần giải thích ngoài nhu cầu, thể hiện xu hướng ưu tiên mẫu báo cáo phức tạp hơn cấu trúc trong slide. Với FR-02, AI đưa lần đăng nhập sai thứ nhất vào nhóm kiểm tra quanh ngưỡng khóa ba lần, dù các điểm sát ngưỡng là lần thứ hai, ba và bốn. Với FR-15, expected ban đầu chỉ kiểm tra sau khi tải lại, có thể bỏ sót lỗi giao diện đổi tên các sản phẩm khác ngay sau khi lưu. Với FR-20, AI thiếu kiểm tra nhập tay số lượng, chưa kiểm tra giỏ khi đi mua sắm rồi quay lại, và viết expected chưa đủ rõ để đánh giá trường hợp đầu vào sai được tự chuyển thành 1. Những thiếu sót này cho thấy AI thiên về hành vi được mô tả trực tiếp và kết quả cuối, chưa xem xét đầy đủ đường thao tác, trạng thái trung gian và sự thiếu rõ ràng của đặc tả. Tôi rút ra rằng cần hướng dẫn AI theo từng bước của kỹ thuật, yêu cầu truy nguồn expected và kiểm tra ánh xạ EC–TC. Người học phải rà soát dữ liệu biên, quan sát trước và sau thao tác, phân biệt yêu cầu với giả định, đồng thời ghi nhận sửa đổi. AI hỗ trợ thiết kế và thực thi; trách nhiệm xác minh, kết luận lỗi và đánh giá kết quả vẫn thuộc về tôi.

## 8 Tài liệu tham khảo

- Đề HW02 mục 6, 9 và 14; slide S04 Domain Testing.
- README eshop-sut, FR-02/09/15/20.
- Test cases_Template_En.xlsx trong tài liệu môn học.
- FR-02/Requirements_Analysis.md, Domain_Testing.md, Test_Cases.md, Test_Execution.md và evidence/: tài liệu chi tiết.
- audit/AI_Audit_Report.md: bản audit hiện tại; chưa tích hợp toàn văn thành phụ lục trong bản chính này. Bản nộp cần hoàn thiện phụ lục theo yêu cầu đã thống nhất.
