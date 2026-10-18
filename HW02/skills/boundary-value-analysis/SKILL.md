---
name: boundary-value-analysis
description: Thiết kế test giá trị biên từ đặc tả và các EC, gồm biên đóng/mở, thời gian, trạng thái và bao phủ Input/Output. Dùng khi áp dụng BVA theo S04; không mặc định mọi miền đều có hai biên hay cần chín test.
---

# Boundary Value Analysis

## Đầu vào

Đọc đặc tả gốc, tài liệu phương pháp và bảng điều kiện/EC đã có. Có thể chạy riêng nếu thông tin đủ; không bắt buộc skill khác được cài. Ghi trạng thái human review của đầu vào. Với HW02, đọc S04 trang 24–27 và yêu cầu đề, không chỉ dựa trên bản dịch; các ví dụ có lỗi số học phải được nhận diện, không sao chép thành oracle.

Viết tiếng Việt kèm thuật ngữ tiếng Anh quan trọng trong ngoặc. Dùng [biểu mẫu](references/templates.md) khi tạo kết quả.

## Quy trình

1. Liệt kê các biến/điều kiện có thứ tự từ từng Input, Output và trạng thái: số, độ dài, tiền, thời gian, số lần. Phân loại miền một phía/hai phía/không có biên áp dụng. Không đặt giá tối đa hoặc độ dài tối đa khi đặc tả không có.
2. Ghi kiểu và miền, ràng buộc chính xác, biên đóng/mở, LB/UB nếu có. Phân biệt ngưỡng đặc tả với giá trị hợp lệ cực tiểu/cực đại; ví dụ số nguyên `0 < x < 100` có miền hợp lệ 1..99. Với điều kiện thời gian, xác định mốc thời gian, tính bao hàm và điều gì xảy ra tại đúng ngưỡng; nếu thiếu thì ghi điểm chưa rõ.
3. Chọn bước thay đổi δ theo độ chính xác có căn cứ. Số nguyên thường δ=1; tiền theo đơn vị hợp lệ; thời gian theo độ chính xác quan sát/điều khiển được. Không nhận phép thử tại đúng thời điểm là chính xác nếu công cụ không thể kiểm soát mốc đó; ghi sai số và giới hạn kiểm chứng.
4. Chọn các điểm tại, ngay trong và ngay ngoài từng biên; giá trị đại diện trong miền; xem xét giá trị nhỏ/lớn nhất UI cho phép theo S04 trang 26. Không ép 7/9 test cho miền một phía, boolean, enum, miền nhỏ có điểm trùng hoặc miền không xác định giới hạn. Ghi lý do thiếu điểm hoặc không áp dụng. Giới hạn UI là ràng buộc quan sát riêng, không tự coi là yêu cầu nghiệp vụ.
5. Với nhiều biến, giữ các đầu vào còn lại và ngữ cảnh hợp lệ khi thay đổi một biến. Liệt kê EC đầu vào/trạng thái và EC output dự kiến cho mỗi test; nếu phát hiện EC mới, đề xuất bổ sung có lý do và giữ liên kết.
6. Với trạng thái/chuỗi thao tác, viết tiền điều kiện, các thao tác thiết lập, hành động tại ngưỡng, reset và cách quan sát. FR-02 cần chuỗi sai liên tiếp và đồng hồ khóa; FR-09 cần lịch sử lượt dùng và mốc expired_at; FR-15 cần độ dài tên và giá >0. Không lấy trạng thái chuẩn bị bất khả thi làm test chạy được.
7. Đối chiếu test đã có, gắn nhãn Domain/BVA cho test dùng chung; không nhân đôi số test. Kiểm tra expected result từ đặc tả, không từ code. Trình bày bảng biên và lý do chọn dữ liệu để người học rà soát; giữ bản trước/sau sửa.

## Đầu ra

Trong HW02 này, dùng bảng test cuối đúng 10 cột ID, Test case name, Precondition, Test step, Expected Result, Actual Result, Status, Tester, Tested Date, Remark theo mẫu người dùng. Bảng biên, EC và mapping kỹ thuật là phần phân tích riêng; không thêm cột vào bảng test để trình bày các thông tin đó.

`Boundary_Value_Analysis.md`, cập nhật `Test_Cases.md`, bảng bao phủ biên cho Input/Output, danh sách câu hỏi/giả định và yêu cầu chuẩn bị dữ liệu. Giữ ID chức năng, không đổi ID test cũ. Phân biệt coverage thiết kế và thực thi. Không có giá trị biên phù hợp phải giải thích chứ không tạo giới hạn giả.

## Audit, review và Git

Với HW02, ghi từng tương tác gồm công cụ/model nếu biết, thời gian thực tế/múi giờ, prompt và output đầy đủ hoặc snapshot có link. Không bịa lịch sử và không tự ghi người học đã duyệt; giữ chỗ thiếu bằng trạng thái chưa xác nhận. Lưu giải thích từng bước và human corrections cho AI gap analysis. Nếu đã được yêu cầu làm toàn bộ, hoàn thành bản nháp, không bắt người dùng duyệt từng tiểu bước trừ khi họ yêu cầu học từng bước hoặc quyết định còn thiếu làm thay đổi kết quả.

Commit các file đúng phạm vi sau từng bước thực tế trong workflow HW02 khi repo đích đã xác định; không dựng commit hồi tố, không gom thay đổi ngoài phạm vi/push. Ghi thiếu Git rõ ràng nếu chưa sẵn sàng. Chỉ đánh dấu checklist hoàn thành khi người dùng yêu cầu. Không tự đăng issue/video từ việc gọi skill.
