# Mẫu AI-02 và record

Nguồn cấu trúc: `[AI-02] - FIT@HCMUS - AI Audit Report_Vn_filled_corrected.docx` do người dùng cung cấp, bản HW01. Chỉ tái sử dụng cấu trúc, không mang kết quả đánh giá HW01 sang HW02. Đề HW02 mục 9 yêu cầu tool/date/prompt/output từng tương tác.

## Record JSON

Các trường bắt buộc: request_key, tool, recorded_at (ISO 8601 có múi giờ), prompt, final_output, task. `artifacts` là danh sách đường dẫn file tuyệt đối vừa tạo/sửa. Nếu không có file thì script dùng final_output làm artifact phản hồi. `source_timestamp` là tùy chọn, chỉ dùng khi có chứng cứ. `log_scope` phải ghi rõ giới hạn transcript; có thể dùng phạm vi phản hồi cuối và artifact, chưa có export tool/commentary.

## Cấu trúc báo cáo

- 1. Thông tin Sinh viên: tên, MSSV, lớp, mã HW02, ngày, công cụ. Chưa biết ghi chưa xác nhận.
- 2. Hướng dẫn: nguyên văn prompt/output, verdict dựa review thật, lý do có nguồn, bản sửa so sánh được.
- 3. Bảng năm cột: Prompt + Công cụ (toàn bộ input nguyên văn, tên Codex, giờ:phút:giây ngày/tháng/năm UTC+07:00), Output AI (toàn bộ output nguyên văn ngay trong ô), Verdict (chỉ VALID/INVALID/INCOMPLETE; chưa review để trống), Lý do (ISTQB hoặc slide/RFC phù hợp), Bản SV sửa. Không dùng link thay prompt/output hoặc đính kèm record JSON trong bảng.
- 4. Thống kê: tổng artifact ghi nhận, số đã review, số chưa review; VALID/INVALID/INCOMPLETE chỉ trên nhóm đã review, mẫu số được nêu rõ.
- 5. Kết luận 80–150 chữ từ pattern quan sát thật; chưa đủ review để kết luận thì ghi chưa thực hiện.
- 6. Mandatory Disclosure: mẫu từ file gốc là câu có chỗ điền về artifact AI, phần sinh viên sửa/tự viết và phụ lục; chưa có chứng cứ không tự điền như đã xác nhận. Chưa ký tên.
- Tham khảo và Appendix A: từng tương tác có bốn trường bắt buộc, prompt/output lưu nguyên văn, phân biệt date recorded với thời gian prompt nếu chưa biết.

Không phải tất cả các trường trên đều do riêng mục 9 quy định; các mục bổ sung đến từ template người dùng yêu cầu áp dụng. AI Critique 200–300 từ là tài liệu riêng.
