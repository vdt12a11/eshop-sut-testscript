---
name: domain-testing
description: Thiết kế Domain Testing theo S04 và tạo báo cáo HW02 gọn theo từng bước, gồm yêu cầu, Input/Output, EC, bảng đại diện từng EC và bảng TC rút gọn. Dùng cho các FR được chọn; không thay thế BVA hoặc kết quả thực thi.
---

# Domain Testing

## Phạm vi và nguồn

Đọc đặc tả chức năng và tài liệu phương pháp gốc trước khi phân tích. Với HW02 eShop, dùng đặc tả/README của đúng FR, S04 cho phương pháp và đề HW02 cho yêu cầu nộp. Viết tiếng Việt, dùng thuật ngữ kỹ thuật khi cần; expected lấy từ đặc tả, không suy ra từ hành vi triển khai hoặc output AI.

Đọc [biểu mẫu báo cáo](references/templates.md) trước khi tạo kết quả. Trong HW02 của người dùng này, cấu trúc tham chiếu là mục 2.1–2.4 của `Main_Report.docx` và `Main_Report.md`, đã chốt ngày 17/10/2026. Đây là quy ước trình bày của người dùng dựa trên S04, không phải mọi tên cột hoặc số mục đều được đề bắt buộc. Áp dụng hình thức này cho FR khác; không sao chép dữ liệu, số EC/TC, hành vi đăng nhập hoặc thời gian khóa của FR-02.

## Quy trình và đầu ra

1. **Yêu cầu làm cơ sở kiểm thử:** liệt kê ngắn các quy tắc trực tiếp dùng để chia EC và xác định expected, ghi nguồn gọn. Không tự thêm giới thiệu SUT, thông tin sinh viên, môi trường hay bảng Requirement/C-ID. Phân biệt yêu cầu rõ, giả định và điểm thiếu đặc tả; chỉ giữ điểm chưa rõ ảnh hưởng thiết kế, không biến thành expected đã xác nhận.
2. **Bước 1 — Input/Output:** dùng đúng ba cột `Chức năng | Đầu vào | Đầu ra`. Ghi tên biến/hành vi cần quan sát; không thêm ID, loại, kiểu/đơn vị, ràng buộc/nguồn thành cột. Nếu chức năng phụ thuộc trạng thái hoặc thời gian, ghi một câu ngữ cảnh ngắn sau bảng; không coi chúng là ô người dùng nhập. Đầu ra gồm kết quả, thông báo và thay đổi trạng thái được đặc tả.
3. **Bước 2 — EC:** dùng đúng ba cột `ID | Đầu vào/đầu ra | Lớp tương đương`. Đánh liên tục `EC1`, `EC2`, ... trong mỗi FR, ghi tên biến bằng văn bản thay vì I1/S1/O1. Không thêm tiền tố EC-I/EC-S/EC-O, cột phân loại, đại diện hoặc TC bao phủ. Với trạng thái ảnh hưởng hành vi, ghi rõ tên trạng thái ở cột biến và giải thích ngữ cảnh một lần. Điều kiện thành viên phải đủ rõ để xác định dữ liệu thuộc lớp nào; trạng thái trước/sau lần thử không được lẫn nhau.
4. **Bước 3a — Đại diện từng EC:** tạo bảng `Phân vùng | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi`, một dòng cho mỗi EC đã xác định. Điền dữ liệu cụ thể, ngữ cảnh có thể thiết lập và kết quả có căn cứ. Các dòng có thể trùng dữ liệu vì cùng tình huống kiểm tra được nhiều EC. Chưa rút gọn ở bảng này.
5. **Bước 3b — Tập TC rút gọn:** sau bảng từng EC, tạo bảng `Test case | Điều kiện kiểm tra | Đầu vào | Đầu ra mong đợi`. Dùng `TC01`, `TC02`, ...; không dùng DT. Cột điều kiện ghi `EC1: mô tả điều kiện; EC4: mô tả điều kiện; ...`, không chỉ liệt kê EC-ID. Gộp các dòng cùng dữ liệu/ngữ cảnh/hành động/kết quả hoặc kết hợp kiểm tra tương thích, giữ mọi assertion cần thiết. Không gộp trạng thái ban đầu xung đột, không làm mất kiểm tra Output, không bỏ EC chỉ để giảm số test. Gọi là tập rút gọn; không nhận tối thiểu tuyệt đối nếu chưa chứng minh.
6. **Rà soát:** đối chiếu tập EC ở bước 2, các dòng đại diện và EC của các TC. Mỗi EC có ít nhất một tình huống bao phủ hoặc ghi rõ lý do chưa thiết kế được. Mỗi dữ liệu phải thuộc lớp ghi nhận; kiểm tra Output phải được kích hoạt và quan sát bằng hành động phù hợp, không chỉ gắn mã. Chỉ sửa/tạo phạm vi người dùng yêu cầu; nếu yêu cầu từng bước thì dừng đúng bước.

## Nguyên tắc phân lớp và chọn test

- Xét EC cho từng Input và Output (S04 trang 3, 7), không chỉ dữ liệu nhập. Lỗi mong đợi trong test âm là kết quả đúng, không tự gán là bug hoặc output không hợp lệ.
- Chia theo điều kiện khoảng, bắt buộc, nhóm giá trị được xử lý khác nhau; tách lớp khi có hành vi khác nhau có căn cứ (S04 trang 8–11). Không tự đặt giới hạn đặc tả không có hoặc tách mọi giá trị thành EC riêng.
- Với miền có thứ tự, giữ kiểu dữ liệu/đơn vị và biên đóng/mở trong phân tích khi cần quyết định lớp; không vì bảng gọn mà bỏ điều kiện quan trọng. Chuyển thiết kế điểm tại/sát biên sang BVA khi được yêu cầu.
- Theo S04 trang 21, kết hợp các EC hợp lệ khi khả thi; mỗi test âm cô lập một lớp đầu vào không hợp lệ, giữ điều kiện khác hợp lệ. EC Output lỗi đi kèm không tính là lỗi đầu vào thứ hai. Không tính mật khẩu của tài khoản không tồn tại là một lỗi độc lập thứ hai.
- Bảng từng EC rồi bảng rút gọn thể hiện trình tự ví dụ S04 trang 22–23. Không bỏ bảng trung gian, không đưa TC bao phủ lên bảng EC ở bước 2. Bảng thiết kế không dùng Remark để chứa ánh xạ EC.
- Trong cột Đầu vào của cả hai bảng bước 3, ghi mỗi trường một dòng: `Tên trường: "giá trị"`; sau đó `Trạng thái ban đầu: ...` khi có ngữ cảnh. Dùng đúng trường của FR, không ép mọi FR có email/mật khẩu. Không dùng A/W/U hoặc viết tắt không định nghĩa.

## Tích hợp báo cáo và giới hạn

Đánh số theo chương chứa FR: N.1 yêu cầu; N.2 Input/Output; N.3 EC; N.4 chọn đại diện; N.4.1 từng EC; N.4.2 rút gọn. EC/TC có thể bắt đầu lại trong mỗi FR; khi dẫn chéo phải kèm mã FR để tránh nhầm. Đổi mã phải đồng bộ mọi tham chiếu liên quan, không ghi đè kết quả của test cũ bằng thiết kế mới mở rộng.

Trong workspace Software testing, cập nhật báo cáo chính duy nhất `HW02/Main_Report.md` và `HW02/Main_Report.docx` khi người dùng yêu cầu sửa báo cáo; không tự tạo bản Compact hay phiên bản báo cáo khác. Nếu người dùng chỉ yêu cầu cập nhật skill, không sinh nội dung FR hoặc sửa báo cáo. Khi chỉnh báo cáo, đọc bản hiện tại để bảo toàn sửa tay; nếu Word khóa file, chuẩn bị thay đổi trong thư mục làm việc và chờ đóng file, không báo đã lưu.

Bảng 10 cột `ID, Test case name, Precondition, Test step, Expected Result, Actual Result, Status, Tester, Tested Date, Remark` dành cho hồ sơ thực thi hiện có/theo yêu cầu, không thay hai bảng thiết kế ở N.4. Không tự thêm bảng thực thi, bằng chứng, nhân sự hoặc kết quả Pass/Fail vào N.1–N.4. Không suy ra đã chạy test từ việc bao phủ đủ EC. Chỉ dẫn sang BVA, AI gap analysis và hồ sơ nộp khi phạm vi yêu cầu có các phần đó.

Audit theo quy định workspace và chỉ dẫn hiện hành của người dùng; không bịa prompt, thời điểm, human review hoặc tự gán verdict. Lưu nội dung cần cho AI gap analysis khi có chứng cứ. Các thao tác commit trong workflow kiểm thử phải theo từng bước thực tế, không dựng lịch sử, không gom thay đổi ngoài phạm vi và không tự push. Không tự tích checklist, đăng issue, gửi tin hoặc xuất bản video từ việc dùng skill.
