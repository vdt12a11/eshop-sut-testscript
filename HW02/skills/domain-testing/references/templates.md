# Biểu mẫu báo cáo Domain Testing HW02

Áp dụng mẫu trình bày đã chốt trong `Main_Report` mục 2.1–2.4 cho mỗi FR. N là số chương của chức năng; ví dụ Pool B ở chương 3 thì dùng 3.1–3.4. Không giữ chỗ trống như kết quả hoàn thành. Số EC và TC do đặc tả của từng FR quyết định, không cố định 26 EC hoặc 8 TC.

## N.1 Yêu cầu làm cơ sở kiểm thử

Gạch đầu dòng ngắn nêu các quy tắc nghiệp vụ/điều kiện cần kiểm tra, kèm nguồn đặc tả gọn. Không cần bảng requirement hay mã R/C nếu không có nhu cầu truy vết riêng. Nếu đã dùng mã, phải định nghĩa đầy đủ và giữ liên kết đúng. Không thêm thông tin người làm, giới thiệu hệ thống hoặc môi trường vào phần này.

## N.2 Domain Testing Bước 1 Xác định Input và Output

| Chức năng | Đầu vào | Đầu ra |
| --- | --- | --- |

Điền tên chức năng, các trường đầu vào và các kết quả cần quan sát theo đặc tả. Nếu cần, một câu ngữ cảnh sau bảng mô tả trạng thái/thời gian trước lần thử. Không thêm cột ID, Loại, Kiểu/đơn vị hay Ràng buộc/nguồn.

## N.3 Domain Testing Bước 2 Xác định điều kiện và EC

| ID | Đầu vào/đầu ra | Lớp tương đương |
| --- | --- | --- |

Mỗi dòng dùng EC1, EC2, ... và tên biến đầy đủ. Với trạng thái liên quan, dùng tên như “Trạng thái mã giảm giá trước lần sử dụng”, không ghi S1 hoặc coi đó là trường nhập. Nội dung lớp phải định nghĩa được miền/điều kiện, không chỉ nêu một giá trị đại diện. Có thể ghi hợp lệ/không hợp lệ trong mô tả khi cần; không thêm cột phân loại riêng.

Một đoạn ngắn trước bảng giải thích những lần tách lớp cần lý do. Không nhắc lại dài dòng toàn bộ lý thuyết, không có bảng C-ID, không dùng EC-I/EC-S/EC-O và không đưa liên kết TC vào bước này.

## N.4 Domain Testing Bước 3 Chọn đại diện và xây dựng test case

Giải thích ngắn: chọn dữ liệu đại diện cho từng EC, ghép các EC hợp lệ khi phù hợp và cô lập từng lớp đầu vào không hợp lệ trong test âm.

### N.4.1 Các ca kiểm thử bao phủ phân vùng

| Phân vùng | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |

Một dòng cho từng EC ở N.3. Phân vùng ghi EC-ID; điều kiện ghi nội dung lớp cần kiểm tra bằng văn bản; dữ liệu phải thuộc lớp đó. Bảng này có thể lặp dữ liệu/expected giữa các EC, giống bước chọn đại diện ở S04 trang 22.

### N.4.2 Tập ca kiểm thử rút gọn

| Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- | --- |

Đánh TC01, TC02, ... trong phạm vi FR. Cột Điều kiện kiểm tra ghi từng mã kèm nội dung: `EC1: điều kiện của lớp 1; EC4: điều kiện của lớp 4; ...`. Đây là định dạng hiển thị; khi điền phải thay bằng mô tả thực tế từ N.3, không ghi chuỗi mã đơn thuần hoặc để dấu ba chấm trong kết quả.

Cột Đầu vào ở cả N.4.1 và N.4.2 dùng cùng định dạng:

```text
Tên trường thứ nhất: "giá trị cụ thể"
Tên trường thứ hai: "giá trị cụ thể"
Trạng thái ban đầu: điều kiện thực tế cần thiết lập trước lần thử
```

Thay tên trường và số trường theo FR. Với giá trị thiếu/null hoặc dữ liệu có kiểu quan trọng, ghi rõ kiểu/cách gửi thay vì dùng dấu ngoặc kép làm đổi nghĩa; chuỗi rỗng ghi `""`. Trong Markdown, dùng `<br>` để tách dòng trong ô; Word dùng xuống dòng. Không tách Email/Mật khẩu/ngữ cảnh thành các cột riêng. Dữ liệu tiền/độ dài/thời gian cần ghi đơn vị hoặc mốc khi ảnh hưởng kết quả. Nếu hành động kiểm thử chưa rõ từ điều kiện, ghi ngắn hành động ở điều kiện kiểm tra hoặc đầu vào, không chỉ ghi kết quả mong đợi.

Gộp những dòng có cùng đầu vào, trạng thái, hành động và kết quả; khi ghép nhiều assertion tương thích, giữ đủ hành động quan sát và expected. Ghi EC của cả Input, trạng thái và Output thật sự được kiểm tra. Ví dụ EC của output được dùng chung với EC đầu vào kích hoạt nó; không xem là một lỗi đầu vào thứ hai. Không gộp các tình huống khác nhau chỉ vì cùng thông báo lỗi.

Sau bảng chỉ cần kết luận ngắn số dòng đại diện và số TC rút gọn, phạm vi EC đã bao phủ, hoặc lý do chưa bao phủ. Không nhận là tối thiểu tuyệt đối/đã chạy khi chưa có chứng cứ. Không mặc định số TC phải nhỏ hơn số EC nếu không có trường hợp gộp hợp lệ.

## Kiểm tra trước khi hoàn tất

- Hai bảng bước 3 cùng bốn cột; bảng EC ba cột; bảng Input/Output ba cột.
- Mọi EC ở N.3 có dòng đại diện và được ít nhất một TC bao phủ, hoặc nêu rõ điểm thiếu đặc tả/ngữ cảnh chưa thể thiết lập.
- Mỗi mã trong cột điều kiện TC tồn tại và mô tả khớp N.3; dữ liệu và trạng thái thực sự thuộc các lớp đã ghi.
- Các EC Output có hành động/assertion cụ thể để quan sát; một test âm không cố ý vi phạm nhiều điều kiện đầu vào.
- Không chuyển kết quả Pass của test cũ sang test được ghép/mở rộng. Hồ sơ thực thi 10 cột và bằng chứng nằm ngoài N.1–N.4 nếu được yêu cầu.
- Giữ nguyên nguồn và giới hạn chưa rõ; không sao chép các quy tắc đặc thù FR-02 sang chức năng khác.

## Nguồn của mẫu

S04 trang 4: xác định Input/Output; trang 7: danh sách EC; trang 21: chọn test; trang 22: đại diện từng phân vùng; trang 23: bộ test rút gọn. Tên cột tiếng Việt, gộp đầu vào, cách ghi EC kèm mô tả và cấu trúc N.1–N.4 là lựa chọn trình bày người dùng chốt trong phiên 17/10/2026, không quy thành yêu cầu nguyên văn của slide.
