---
name: ai-audit-report
description: Ghi AI Audit cho từng prompt và output của HW02 sau khi hoàn tất tác vụ, trước phản hồi cuối; dùng khi ghi hoặc tổng hợp nhật ký theo mẫu AI-02 và mục 9 HW02. Chỉ báo Đã ghi audit khi đã lưu và đọc lại thành công.
---

# AI Audit Report

## Kích hoạt và thời điểm ghi

Áp dụng sau mỗi prompt liên quan HW02 trong workspace Software testing, kể cả giải thích lý thuyết phục vụ bài, sửa báo cáo, tạo skill và phản hồi chỉnh sửa. Hoàn thành tác vụ và soạn nội dung phản hồi cuối trước, sau đó lưu bản audit, kiểm tra đọc lại rồi mới gửi phản hồi. Kết thúc phản hồi bằng dòng nguyên văn `Đã ghi audit` chỉ khi lưu thành công. Nếu ghi thất bại, không in dòng xác nhận; báo ngắn lỗi và phần chưa ghi.

Skill không phải event hook hay tiến trình chạy nền; discovery không bảo đảm tự gọi sau mọi prompt. Dùng AGENTS.md của workspace để nhắc quy tắc mỗi lượt; không sửa cấu hình khác hoặc ghi hội thoại ngoài HW02 khi không được yêu cầu. Nếu người dùng dừng/tác vụ bị ngắt trước bước ghi, không nhận đã lưu.

## Nội dung bắt buộc

Khai báo đầu báo cáo: `Tôi sử dụng công cụ AI cho các nhiệm vụ sau:` và liệt kê nhiệm vụ thực tế.

Mỗi tương tác có đủ bốn mục: **Tên công cụ AI**, **Ngày và giờ** có múi giờ thực tế, **Prompt của bạn** nguyên văn, **Output của AI** nguyên văn. Không thay prompt/output bằng tóm tắt. Ghi model nếu biết, nếu không để chưa xác minh. Nhật ký bao gồm phản hồi cuối và snapshot tài liệu AI sinh; log tool/commentary nếu có nguồn truy xuất, nếu chưa có phải ghi phạm vi thiếu.

## Cấu trúc AI-02

Quy ước người dùng xác nhận: cột (1) phải ghi toàn bộ prompt trực tiếp, công cụ chỉ hiển thị `Codex`, thời gian `HH:mm:ss dd/MM/yyyy` (UTC+07:00); cột (2) ghi toàn bộ output trực tiếp. Không thay nội dung bằng link, không đính kèm record JSON trong bảng. Nếu nội dung nguyên văn đã chứa link/tên model, giữ trong trích dẫn gốc nhưng không thêm như metadata mới. Mã hóa Markdown khi cần để bảng không vỡ, kiểm tra giải mã trả lại đúng nguyên văn. Verdict chỉ nhận `VALID`, `INVALID`, `INCOMPLETE`; chưa được đánh giá thì để ô trống và ghi trạng thái ngoài cột, không dùng nhãn tiếng Việt làm verdict.

Đọc [template](references/template.md) để giữ sáu mục và bảng audit năm cột. Phân biệt tương tác với artifact: một prompt tạo ba tài liệu thì có một record tương tác và ba hàng artifact liên kết cùng record. Với câu trả lời không sinh file, chính phản hồi là một artifact.

1. Thông tin Sinh viên.
2. Hướng dẫn.
3. Bảng Audit — một hàng/artifact: (1) Prompt + Công cụ; (2) Output AI; (3) Verdict; (4) Lý do (ISTQB); (5) Bản SV sửa.
4. Tổng kết Độ chính xác AI.
5. Kết luận — Khi nào nên / không nên dùng AI? 80–150 chữ theo template; không thay AI Critique 200–300 từ của HW02.
6. Mandatory Disclosure, tiếp theo chữ ký, tham khảo và Appendix A nhật ký nguyên văn.

Thông tin mẫu HW01 không phải kết quả HW02: không sao chép điểm, verdict, ngày, chữ ký hoặc nhận xét đã điền. Tên/MSSV có thể dùng từ tài liệu người dùng cung cấp, ghi nguồn; ngày và giảng viên chỉ điền khi đã xác nhận. Không tự ký hay cam đoan thay sinh viên.

## Cách ghi

1. Xác định prompt hiện tại, thời gian bắt đầu nếu có chứng cứ; lấy thời gian ghi thực tế với UTC+07:00, không dùng làm thời điểm prompt cũ. Mọi trường thiếu ghi rõ, không dựng lịch sử.
2. Tạo record JSON UTF-8 theo mẫu trong reference; dùng request_key ổn định cho cùng lượt để tránh append hai lần. Soạn trước final_output khớp chính xác phản hồi sẽ gửi. Đính kèm danh sách file tạo/sửa và snapshot; không chèn bí mật.
3. Chạy `scripts/record_audit.py --root <thư mục audit> --record <record.json>` bằng Python có sẵn. Script lưu record và snapshot, gọi render_inline_audit.py để tổng hợp cả lịch sử đã import và record mới thành báo cáo có prompt/output đầy đủ trong ô bảng. JSON là dữ liệu nội bộ, không phải phụ thuộc đọc báo cáo. Đọc lại record, xác nhận key/output/snapshot khớp trước thông báo thành công. Nếu đã có chỉnh sửa trực tiếp báo cáo, bảo toàn bản đó trước tái tạo; verdict được lưu trong human_review.json theo request_key/turn_id để không mất sau khi ghi lượt mới.
4. Giữ bản gốc, ghi phản hồi human review bổ sung theo lịch sử, không sửa snapshot cũ. Verdict VALID/INVALID/INCOMPLETE chỉ ghi khi có đánh giá thực tế; chưa review ghi chưa rà soát, không tính như VALID hoặc INCOMPLETE. Lý do cần nguồn slide/ISTQB/RFC phù hợp, không bịa trích dẫn. Bản SV sửa phải giữ diff/tô sáng khi xuất Word.
5. Tổng hợp Markdown+PDF theo đề khi được yêu cầu xuất hồ sơ; dùng công cụ document/PDF phù hợp để render và kiểm tra. Script hiện tại chỉ sinh Markdown/JSON, không nhận đã có PDF hoặc Word.

Không log lại vô hạn hành động ghi audit. Không tự gửi/upload/đăng thông tin. Với lịch sử cũ chỉ thu thập phần có thể truy xuất và ghi giới hạn rõ ràng.
