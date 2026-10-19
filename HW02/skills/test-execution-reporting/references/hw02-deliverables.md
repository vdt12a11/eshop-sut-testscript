# Hồ sơ HW02

Đối chiếu lại đề người dùng cung cấp khi áp dụng; tài liệu này ghi yêu cầu đã đọc trong bản HW02 năm 2026, không thay thế đề nếu có cập nhật.

- Cá nhân: một feature mỗi pool A/B/C/D, không trùng trong nhóm. Pool D không được tự suy ra đã chốt; tại thời điểm tạo skill người dùng chọn FR-02, FR-09, FR-15, để D sau. Không áp đặt lựa chọn này lên người dùng/bài khác.
- Mỗi feature có giải thích từng bước Domain Testing và BVA, test case, thực thi/bằng chứng, bug report và AI gap analysis nếu có bỏ sót.
- Báo cáo chính Markdown + PDF: Domain Testing và BVA. Test case có thể gộp hoặc tách, phải liên kết rõ.
- Bug report: Markdown và GitHub Issues nhóm, screenshot từng issue. Đề không bắt riêng một bản PDF bug report.
- AI Audit Report là phụ lục bắt buộc: khai báo, công cụ, ngày giờ, prompt/output cho từng tương tác; Markdown + PDF.
- AI Critique: đoạn 200–300 từ về sai/thiếu/thiên lệch của AI, nguyên nhân và bài học; Markdown + PDF. Dùng bằng chứng thật, người học rà soát.
- Git commit cho mỗi bước kiểm thử từng feature; Git commit log file văn bản.
- README.md có bảng tự chấm (A25/B25/C25/D15/Skills10), test summary số feature/test thiết kế/đã chạy/pass/fail/chưa chạy, số bug, demo video links.
- Agent Skills được khuyến khích, có 10 điểm riêng. Nếu làm, nộp skills cùng link YouTube demo end-to-end trên một feature hoàn chỉnh. Không coi validate cấu trúc là đã demo thành công.
- Tài liệu hỗ trợ, ảnh, script và dữ liệu nếu sử dụng. Các tên Main_Report.md, Bug_Report.md, AI_Audit_Report.md, AI_Critique.md, Git_Commit_Log.txt là gợi ý tổ chức, chỉ README.md và định dạng ZIP được đề chỉ rõ.
- ZIP: `<StudentID>_HW02_AI_DomainTesting_<SelfAssessedGrade>.zip`, điểm 3 chữ số 000..100. Nộp Moodle, hạn lấy từ link nộp, không tự đoán.
- Không nộp trễ; thiếu tài liệu bắt buộc bị 0; sao chép giữa sinh viên kể cả prompt khiến cả hai bị 0. Không suy ra Agent Skill khuyến khích là tài liệu bắt buộc của mọi bài.

Demo đề xuất: mở đặc tả → Input/Output → điều kiện và EC (cả output) → coverage → human review thực tế → BVA → chạy test và evidence → bug/summary. Nếu dùng cả bộ skill, trình bày rõ cách chuyển dữ liệu giữa các skill. Chưa có video thật thì để chưa hoàn thành.
