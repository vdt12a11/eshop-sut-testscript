# Biểu mẫu thực thi và báo cáo

## Run

| Run-ID | TC-ID | Thời gian/múi giờ | Source/môi trường | Tiền điều kiện thực tế | Dữ liệu/bước chạy | Expected và nguồn | Actual | EC output quan sát | Pass/Fail/Not Run | Evidence | Bug-ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Mỗi lần chạy có Run-ID riêng. Chưa chạy: actual để chưa quan sát, không suy đoán. Có thể tách bảng quá rộng thành các mục chi tiết mỗi run.

## Bug

Bug-ID và tiêu đề; requirement/source; TC/Run-ID; môi trường; tiền điều kiện; dữ liệu; bước tái hiện; expected; actual; tần suất đã quan sát; severity và lý do; screenshot/log; GitHub Issue URL hoặc chưa đăng. Không để dữ liệu bí mật vào ảnh/log. Không ghi đã có screenshot nếu chỉ có log.

## Summary

| Chức năng | Designed TC duy nhất | Executed | Pass | Fail | Not Run | Bug duy nhất | Giới hạn |
| --- | --- | --- | --- | --- | --- | --- | --- |

Với trạng thái cuối mỗi TC: executed = pass + fail, designed = executed + not run. Nếu có blocked, tính trong not run, ghi rõ số blocked. Lịch sử run được thống kê riêng; dùng trạng thái cuối để tổng kết và vẫn giữ thất bại trước đó. Tổng số bug phải khử trùng nếu một bug liên quan nhiều chức năng.

## AI gap analysis / review

| Gap-ID | Output AI ban đầu có snapshot | Thiếu/sai gì | Người/cách phát hiện | Bằng chứng | Bổ sung/sửa | Nguyên nhân xác nhận hoặc giả thuyết |
| --- | --- | --- | --- | --- | --- | --- |

## AI Audit

Interaction-ID; công cụ/model nếu biết; thời gian thực tế/múi giờ; prompt đầy đủ; output đầy đủ hoặc liên kết snapshot; nguồn đầu vào; hành động; human review thực tế; thay đổi. Không coi ghi tóm tắt output là log đầy đủ.
