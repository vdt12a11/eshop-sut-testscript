# Kiến thức sử dụng framework Jest

## 1. Chuẩn bị và dọn dẹp bằng hooks

- `beforeEach`: chạy trước mỗi `test(...)` trong phạm vi khai báo, dùng chuẩn bị môi trường và dữ liệu cần thiết.
- `afterEach`: chạy sau mỗi test, kể cả khi assertion thất bại, dùng đóng kết nối và giải phóng tài nguyên.
- Mỗi test nên có trạng thái ban đầu độc lập để kết quả không phụ thuộc test chạy trước.

```js
let context;

beforeEach(async () => {
  context = await prepareEnvironment();
});

afterEach(async () => {
  await cleanupEnvironment(context);
});
```

`beforeEach` và `afterEach` do Jest cung cấp. `prepareEnvironment` và `cleanupEnvironment` trong ví dụ là helper do người viết test tự định nghĩa.

## 2. Chờ công việc bất đồng bộ với async/await

Jest chờ Promise được trả về từ test hoặc hook trước khi coi công việc hoàn tất. Hàm `async` trả về Promise; `await` chờ một thao tác bất đồng bộ hoàn tất trước khi thực hiện bước tiếp theo.

```js
test('trả về kết quả mong đợi', async () => {
  const actual = await getResult();
  expect(actual).toBe(10);
});
```

Phải `await` hoặc trả về Promise của công việc cần kiểm tra. Nếu gọi thao tác bất đồng bộ mà không chờ, test có thể kết thúc trước khi nhận được kết quả hoặc thực hiện assertion. Quy tắc này áp dụng cho cả bước chuẩn bị và dọn dẹp.

## 3. Viết assertion bằng expect và matcher

`expect(actual)` nhận giá trị thực tế. Matcher phía sau diễn đạt điều kiện cần đúng; nếu không đúng, Jest ghi nhận test thất bại.

```js
expect(actual).toEqual(expected);
```

Expected phải xuất phát từ yêu cầu kiểm thử. Không thay expected bằng kết quả thực tế chỉ để test pass.

## 4. Dùng toEqual để so sánh nội dung mảng và object

`toEqual` so sánh nội dung của mảng/object, thay vì yêu cầu chúng là cùng một đối tượng trong bộ nhớ.

```js
expect({ count: 2 }).toEqual({ count: 2 });
expect(['a', 'b']).toEqual(['a', 'b']);
```

Với mảng, thứ tự phần tử có ảnh hưởng:

```js
// Assertion này thất bại vì thứ tự khác nhau.
expect(['b', 'a']).toEqual(['a', 'b']);
```

Nếu yêu cầu chỉ quan tâm các phần tử mà không quan tâm thứ tự, có thể sắp xếp bản sao của cả hai mảng trước khi so sánh:

```js
expect([...actual].sort()).toEqual([...expected].sort());
```

`sort()` là hàm JavaScript, không phải API Jest. Cách trên phù hợp với mảng chuỗi; mảng số hoặc object cần hàm so sánh thích hợp. Không sắp xếp nếu thứ tự chính là điều cần kiểm tra.

## 5. Phân biệt toBe và toEqual

- `toBe`: phù hợp để so sánh giá trị đơn như số, chuỗi, boolean; với object, kiểm tra cùng tham chiếu.
- `toEqual`: phù hợp để so sánh nội dung mảng và object.

```js
expect(7).toBe(7);
expect('ready').toBe('ready');
expect({ ready: true }).toEqual({ ready: true });
```

## 6. Hiểu đúng kết quả test

Một test PASS cho biết các assertion đã viết đều thoả mãn trong môi trường và dữ liệu của lần chạy đó. Nó không chứng minh toàn bộ chức năng hoặc ứng dụng đều đúng.

Một test FAIL cần được đọc cùng thông báo lỗi: có thể assertion không thoả mãn, hoặc bước chuẩn bị/thực thi gặp lỗi. Cần xác định nguyên nhân trước khi kết luận về phần mềm đang kiểm thử.

## Ghi chú bổ sung: PRAGMA trong SQLite

PRAGMA là lệnh đặc biệt của SQLite, không phải API của Jest. Nó dùng để đọc metadata, kiểm tra database hoặc thay đổi cấu hình.

| Lệnh | Công dụng |
|---|---|
| `PRAGMA table_info('users');` | Xem cấu trúc cột: tên, kiểu khai báo, NOT NULL, mặc định, khóa chính |
| `PRAGMA index_list('coupons');` | Xem danh sách index của bảng |
| `PRAGMA foreign_key_list('orders');` | Xem các khóa ngoại được khai báo trong bảng |
| `PRAGMA foreign_keys;` | Xem trạng thái kiểm tra khóa ngoại của kết nối hiện tại: 1 bật, 0 tắt |
| `PRAGMA integrity_check;` | Kiểm tra tính toàn vẹn cấu trúc file DB; bình thường trả về ok, không thay thế kiểm tra nghiệp vụ |
| `PRAGMA foreign_keys = ON;` | Bật kiểm tra khóa ngoại trên kết nối hiện tại; cần thực hiện ngoài transaction |

Phân biệt dữ liệu và metadata:

```sql
SELECT * FROM users;         -- Dữ liệu tài khoản
PRAGMA table_info('users');  -- Cấu trúc các cột
```

Phân biệt khai báo và thực thi: foreign_key_list cho biết bảng khai báo quan hệ nào; foreign_keys cho biết kết nối có bật kiểm tra các quan hệ đó không. Bật foreign_keys không tự tạo ràng buộc còn thiếu và không tự bật cho các kết nối khác.
