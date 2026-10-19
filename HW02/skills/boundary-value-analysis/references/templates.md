# Biểu mẫu BVA

## Phân tích biên

| Boundary-ID | Requirement/C-ID | Input/Output/State ID | EC-ID | Kiểu/đơn vị | Miền/bất đẳng thức | Biên đóng/mở | LB/UB hoặc ngưỡng | δ và căn cứ | Giới hạn UI riêng | Nguồn/điểm chưa rõ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Chọn điểm và thiết kế test

| Boundary-ID | Vị trí tại/trong/ngoài/đại diện/UI cực trị | Giá trị hoặc chuỗi thao tác | EC đầu vào/trạng thái | EC output dự kiến | TC-ID có sẵn hoặc mới | Expected và nguồn |
| --- | --- | --- | --- | --- | --- | --- |

## Bao phủ biên

| Boundary-ID | Biến Input/Output/State | Điểm cần xét | TC-ID | Có test/Chưa có/Không áp dụng | Lý do | Đã chạy và bằng chứng nếu có |
| --- | --- | --- | --- | --- | --- | --- |

## Kế hoạch thời gian/trạng thái

Ghi mốc bắt đầu, độ chính xác, phương pháp thiết lập trạng thái, đồng hồ sử dụng, sai số quan sát, reset và giới hạn test đúng ngưỡng. Với output khó kích hoạt, mô tả cách tạo Input hoặc ghi rõ chưa bao phủ; không giả nhận output đã xuất hiện.

## Audit và review

Interaction-ID; công cụ/model; thời gian thực tế/múi giờ; prompt; snapshot/link output đầy đủ; phản hồi người học; thay đổi; câu hỏi chưa giải quyết. Giữ phiên bản ban đầu và sửa đổi, không dùng file đang thay đổi như bằng chứng duy nhất của output cũ.
