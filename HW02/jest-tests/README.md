# Jest — HW02 EShop

Catalog chứa 82 TC của bốn FR. Các script Web/API cũ phục vụ 68 TC FR-02/FR-09/FR-15; 14 TC FR-20 dùng Android native qua UiAutomator2/ADB. `specs/fr-02.test.cjs`, `fr-09.test.cjs`, `fr-15.test.cjs` dùng Jest và Playwright thật. Không sửa logic SUT để làm test pass.

## Chạy

Node 24; cài các dependency trong package.json và `sqlite3`, rồi cài Chromium bằng `npx playwright install chromium`. Trong workspace hiện tại, runner tái sử dụng Jest/sqlite3 từ `eshop-sut/testing` và Playwright từ runtime Codex. Có thể đặt `HW02_SUT`, `HW02_NODE_MODULES`, `HW02_CHROMIUM` nếu đường dẫn khác.

```powershell
npm test -- --fr FR-02 --demo
npm test -- --fr FR-02
npm test -- --fr FR-09
npm test -- --fr FR-15
npm test -- --fr FR-09 --demo --approved-next-video
npm test -- --fr FR-15 --demo --approved-next-video
```

Chế độ demo FR-02 chạy TC01, TC02, TC03, TC04, TC07, TC14, cửa sổ Chromium hiển thị và Playwright ghi video WebM. Mỗi run lưu environment, actual, từng assertion, ảnh, kết quả Jest và video tại `runs/<Run-ID>/`. Thanh dưới cùng trong video là **test harness**, hiển thị expected/actual thu được từ request và CSDL; không phải giao diện gốc của EShop. Không lưu JWT hoặc response chứa mật khẩu.

Backend được sao chép nguyên mã nguồn vào `HW02/runtime/jest-sut/<Run-ID>/`, dùng DB riêng. Không reset backend giữa các TC; chỉ thiết lập trạng thái test độc lập qua SQLite. Hash CSDL SUT gốc được đối chiếu trước/sau. Port 3000/5173 phải trống; FR-15 dùng thêm 5174. Server được tắt khi run kết thúc.

FR-02 TC13 giữ Not Run vì expected tại đúng 30 giây chưa được xác nhận. Các điểm thời gian khác ghi khoảng thời gian thực đo được; không khẳng định đã trúng đúng mili giây bằng đồng hồ hệ điều hành. TC14 chờ ít nhất 31 giây thật kể từ khi khóa mới được quan sát. FR-09 có preload đồng hồ kiểm soát riêng cho so sánh `expired_at`; preload không đổi thời gian khi không có giá trị kiểm soát.

Ở chế độ demo, FR-09 chạy UI checkout cho TC01/TC02/TC05/TC09/TC14/TC17, với sản phẩm thử riêng tạo tổng giỏ đúng dữ liệu thiết kế; không sửa ô tổng tiền. TC09 mở checkout trực tiếp qua history/popstate khi thiếu JWT. FR-15 chạy UI admin cho TC01/TC02/TC03/TC04/TC07/TC10, đối chiếu dữ liệu API/SQLite và quan sát ngay sau lưu, sau reload. Các trường hợp còn lại chưa chạy; chế độ không demo giữ bộ script đầy đủ.

Sau video FR-02 phải dừng để sinh viên xem và đồng ý trước hai video tiếp theo. Video này minh họa chạy TC; chưa phải video dùng skill từ đầu đến cuối.

## Nhịp video để người xem theo dõi

Yêu cầu cuối của người dùng: đọc mục tiêu 4 giây; nhập từng ô và dừng 1,5 giây sau mỗi ô; dừng 2 giây trước khi gửi; giữ kết quả 3,5 giây. Không dừng riêng ở tiền điều kiện. Chú thích tiếng Việt. Timestamps lấy lúc request thật được gửi; thời gian gõ không được tính vào phép đo khóa. Ở TC14, nhập sẵn dữ liệu và dành 2 giây cuối của thời gian chờ làm khoảng dừng trước khi gửi quanh mốc 31 giây thật.

## Môi trường admin và ghi nhận lỗi công cụ

Trong máy hiện tại, frontend-admin/node_modules liên kết tới frontend-web/node_modules vì package.json khai báo cùng các thư viện. Runner dùng cache Vite admin riêng trong runtime để tránh xung đột; không sửa mã ứng dụng. Máy khác có thể cài dependency thông thường trong từng frontend.

Một lần khởi động thiếu dependency và một lần locator trùng ô ảnh/tên đã được giữ trong lịch sử; các lỗi chuẩn bị đó là Not Run, không tính thành bug EShop. Các video cuối được quay lại sau khi sửa. Runner chèn khoảng trống trình bày sau bảng admin để các hàng không bị thanh chú thích che; không thay đổi dữ liệu sản phẩm.




## FR-20 — Android native

- `specs/fr-20.test.cjs`: 14 TC Giỏ hàng Mobile; `helpers/native-mobile.cjs`: đọc cây giao diện UiAutomator2, thao tác ADB và bằng chứng Android; `scripts/run-mobile.cjs`: môi trường/backend riêng.
- Android Emulator 16 / API 36; AVD thử riêng `HW02Mobile`, serial mặc định `emulator-5556`. Không chạy trên thiết bị cá nhân có dữ liệu quan trọng. Runtime và dữ liệu emulator đặt trong `HW02/runtime/`, không đưa vào Git.
- Expo Go **54.0.8**, dự án Expo SDK 54 và UiAutomator2 server **10.7.0**. Mở emulator trước; có Android SDK/ADB, Node và npm trên PATH.
- Thiết lập: `powershell -File scripts/setup-mobile.ps1 -SutRoot "D:/vscode/Software testing/eshop-sut"`. Script sao chép nguyên vẹn Mobile sang runtime, cài dependency từ lockfile và cài APK vào emulator; không sửa logic SUT.

```powershell
$env:HW02_SUT = 'D:/vscode/Software testing/eshop-sut'
$env:HW02_ANDROID_SERIAL = 'emulator-5556'
npm test -- --fr FR-20
npm test -- --fr FR-20 --demo
```

Chạy thường xét toàn bộ 14 TC. Chế độ demo chọn TC01, TC03, TC05, TC06, TC09 và TC14 để minh họa giỏ trống, thêm hàng, thiếu nút +/-, xác nhận xóa, điều hướng và nhập tay số lượng. Có thể đặt `HW02_CASES=TC01,TC14` khi cần tái hiện riêng.

App có API host cố định `192.168.10.13:3000`. Runner dùng HTTP proxy trên emulator để ánh xạ host đó tới backend thử `localhost:3000`; không thay `App.js`. Proxy cũ được khôi phục sau run. Dùng cổng 3000/3080/8081; mỗi run có ADB server và cổng forward UiAutomator2 riêng, được ghi trong environment.json và ADB reverse/forward; runner từ chối chiếm cổng đang dùng. Emulator được kết nối qua TCP (emulator-5556 tương ứng 127.0.0.1:5557); ADB server riêng của run được đóng sau khi khôi phục proxy, tránh ảnh hưởng ADB server của người dùng. Màn hình 720×1280, density 320; thao tác bấm trong bounds của node, tránh phần bị thanh trạng thái che. Không kiểm thử HTTP/DOM thay cho UI Mobile.

Video `videos/FR-20-demo.webm` ghi viewer hiển thị ảnh Android trực tiếp qua ADB bên cạnh chú thích. Đây là màn hình ứng dụng native được phản chiếu, không phải frontend Web hay hình UI dựng lại. Nhịp: đọc mục tiêu 4 giây, dừng 1,5 giây sau nhập, 2 giây trước thao tác gửi, giữ kết quả 3,5 giây. Các màn chuẩn bị dữ liệu là thao tác UI thực, không tính là test đã Pass.

TC10–TC12: nếu app tự chuẩn hóa đầu vào thành 1, ghi actual và giữ trạng thái Not Run với lý do chờ xác nhận oracle; nếu UI chặn không cho nhập đúng dữ liệu thử, ghi giới hạn bao phủ. Not Run bao gồm chưa thể kết luận; không tính các trường hợp này vào executed/pass/fail. Trạng thái Jest chỉ phản ánh việc kịch bản có hoàn tất; tổng kết nghiệp vụ lấy từ results.json, không coi kịch bản chờ oracle là Pass. Một invariant sai có căn cứ vẫn là Fail. Không tự quy chuẩn hóa thành bug.

Mỗi run lưu environment (hash nguồn/CSDL, phiên bản), `results.json`, Jest JSON, ảnh PNG Android, XML UI, log Metro/backend/UiAutomator2 và timeline. Ảnh `-presentation.png` chỉ là minh họa trong viewer; ảnh bug chính là PNG màn hình Android. Các lượt lỗi hạ tầng được giữ local, không trộn vào tổng kết sản phẩm.

Nguồn cài đặt: [Expo Go SDK 54](https://expo.dev/go?device=false&platform=android&sdkVersion=54), [UiAutomator2 server](https://github.com/appium/appium-uiautomator2-server).
