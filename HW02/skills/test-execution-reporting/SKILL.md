---
name: test-execution-reporting
description: Thực thi bộ test đã thiết kế, lưu actual và bằng chứng, lập bug report và tổng hợp hồ sơ HW02 hoặc bài kiểm thử tương tự. Dùng khi chạy test hoặc báo cáo kết quả thực tế; không thay thế bước thiết kế EC/BVA.
---

# Test Execution and Reporting

## Đầu vào và giới hạn

Quy ước báo cáo HW02 ngày 16/10/2026: bảng test cuối dùng đúng 10 cột theo mẫu Test cases_Template_En.xlsx, một hàng/test, header lặp khi qua trang. Không thêm cột EC/kỹ thuật/biên/evidence hoặc ba bảng cho mỗi test. Các dữ liệu đó giữ trong phần phân tích, bảng bao phủ và hồ sơ run riêng; Remark chỉ dùng ghi chú ngắn/mã evidence.

Đọc bộ test, đặc tả, trạng thái rà soát, môi trường và phạm vi người dùng yêu cầu. Dùng công cụ có sẵn, không mặc định có browser/API connector. Nếu cần giải thích layout hoặc xuất PDF, dùng quy trình PDF sẵn có nếu có; không coi skill đó là phụ thuộc bắt buộc khi chỉ viết Markdown. Đọc [biểu mẫu](references/templates.md) khi ghi run/bug/report; đọc [yêu cầu HW02](references/hw02-deliverables.md) khi chuẩn bị bài HW02.

## Quy trình

1. Ghi source commit và thay đổi chưa commit liên quan, hệ điều hành, phiên bản runtime/app/browser, endpoint, dữ liệu, thời gian/múi giờ. Không ghi token/mật khẩu thật vào báo cáo; tài khoản demo có thể được mô tả phù hợp.
2. Chuẩn bị dữ liệu test và reset trong môi trường phù hợp đã được người dùng cho phép. Giữ dữ liệu đối chứng cho kiểm tra ảnh hưởng sản phẩm khác. Không tự chạy thay đổi lên production. Khi cần thông tin còn thiếu, tiếp tục phần độc lập và ghi test phụ thuộc là chưa chạy.
3. Chạy test bằng UI/API/script phù hợp với mục tiêu test. Kiểm tra UI không được thay thế hoàn toàn bằng API và nhận đã kiểm UI. Mỗi lần chạy ghi Run-ID, TC-ID, tiền điều kiện thực tế, bước/dữ liệu, actual, thời gian và evidence. Lưu các lần chạy trước, không ghi đè lịch sử.
4. Dùng trạng thái Pass/Fail/Not Run; nếu cần Blocked thì ghi như một phân loại con của chưa chạy và giải thích quy ước thống kê. Chỉ Pass khi đã chạy và assertions thỏa; chỉ Fail khi có khác biệt với expected có căn cứ. Đọc code mới thấy nghi vấn thì ghi nghi vấn cần xác nhận. Không dựng bằng chứng, kết quả hoặc lời duyệt.
5. Với sai lệch, kiểm tra dữ liệu, oracle và điều kiện trước khi xác nhận bug. Bug report chứa nguồn requirement, môi trường, tiền điều kiện, bước tái hiện, expected/actual, tác động/severity có lý do, screenshot và TC/Run-ID. Một bug có thể gây nhiều test fail; không đếm mỗi fail là một bug mới.
6. Soạn issue từ bug đã xác nhận; chỉ đăng khi có chỉ dẫn người dùng cho phép đăng. Với HW02, mọi bug phát hiện phải được báo cả Markdown và GitHub Issues nhóm, từng issue có screenshot. Nếu chưa được phép hoặc công cụ chưa có, giữ bản nháp và ghi rõ chưa đăng; không nhận hoàn tất yêu cầu này. Không gửi tin, xuất bản video hoặc push chỉ vì gọi skill.
7. Tổng hợp EC Input/Output và biên đã thực sự quan sát, phân biệt với coverage thiết kế. Đếm TC duy nhất; test Domain+BVA không tính hai lần. Tách số test với số run. Theo dõi số designed, executed, pass, fail, not run, số bug duy nhất và các khoảng trống.
8. So sánh output AI ban đầu, human review và kết quả chạy; ghi các test/bug AI bỏ sót có bằng chứng. Giải thích nguyên nhân như giả thuyết nếu chưa chứng minh; không bịa sai sót cho đủ bài. Soạn AI Critique từ diễn biến thực tế để người học rà soát.
9. Tổng hợp hồ sơ Markdown; nếu yêu cầu bản nộp HW02, đối chiếu reference về định dạng, README, PDF, Git log và ZIP. Kiểm tra PDF trực quan khi xuất. Ghi video demo là chưa có nếu chưa quay/đăng; kịch bản không phải video. Không tự chấm điểm như người học đã xác nhận.

## Ghi nhận xuyên suốt

- Audit theo từng tương tác, gồm công cụ/model nếu biết, thời gian thực tế/múi giờ, prompt, output đầy đủ hoặc link snapshot; thêm actions/run evidence và human corrections riêng. Nếu không có toàn bộ lịch sử thì nêu khoảng thiếu, không dựng lại nguyên văn.
- Trong workflow HW02, commit file đúng phạm vi theo từng bước thực tế sau khi xác định repo; kiểm tra diff trước commit, không gom thay đổi không liên quan, không dựng lịch sử hoặc push. Xuất Git log trung thực và phân biệt commit trước đó/ngoài phạm vi.
- Lưu đầu ra nháp để người học rà soát, không bắt xác nhận lặp lại cho các thao tác đã được yêu cầu. Checklist HW02 chỉ tích theo yêu cầu người dùng; tạo đủ file không tự đồng nghĩa mọi nội dung hoàn thành.

## Tiêu chí kết thúc

Mọi test có trạng thái và nguyên nhân nếu chưa chạy, test đã chạy có actual/evidence, bug được liên kết, số liệu khớp. Nêu rõ phần chưa thực hiện và những tài liệu/video/link còn thiếu. Skill hỗ trợ tái sử dụng; không gắn cứng vào FR-02/09/15.
