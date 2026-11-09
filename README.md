# Du Lịch Vòng Quanh Thăng Long — Hanoi Heritage Tour Explorer 🏛️

> Ứng dụng mô hình hóa bài toán đồ thị du lịch học đường: **Chu trình Hamilton**, **Đường đi Hamilton** và **Thuật toán Dijkstra** kết nối trường **THPT Thăng Long (Hà Nội)** với 13 danh lam thắng cảnh di sản Thủ đô.

---

## 🌟 Tính Năng Nổi Bật

- **Bài 1: Một vòng khám phá quanh Thăng Long (Chu trình Hamilton)**
  - Tìm hành trình khép kín ngắn nhất xuất phát từ cổng trường THPT Thăng Long, đi qua đúng một lần các danh thắng đã chọn rồi quay về trường.
- **Bài 2: Từ cổng trường đến một điểm hẹn cuối (Đường đi Hamilton)**
  - Lập lộ trình một chiều tối ưu từ trường THPT Thăng Long tới một điểm hẹn di sản đích.
- **Bài 3: Tìm đường ngắn nhất qua tập điểm (Thuật toán Dijkstra)**
  - Minh họa thuật toán Dijkstra từng bước với đồ thị trọng số cự ly thực tế (km).
- **Giao diện trực quan & mở rộng**:
  - Bản đồ địa lý tương tác (Leaflet & Google Maps).
  - Đồ thị mạng lưới liên kết các điểm đến.
  - Cửa sổ chi tiết từng địa danh 2 cột hiện đại: hình ảnh chất lượng cao, thuyết minh âm thanh song ngữ (Việt - Anh), cự ly và thời gian di chuyển (đi bộ, xe đạp, xe máy, ô tô).
  - Tùy chọn bố cục linh hoạt: *Chia đôi màn hình*, *Mở rộng danh sách địa điểm*, *Mở rộng bản đồ*.

---

## 🚀 Cài Đặt & Chạy Trên Máy Tính (Local)

### 1. Yêu cầu hệ thống
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 hoặc 20 trở lên).
- Trình quản lý gói `npm` (đi kèm sẵn với Node.js).

### 2. Các bước khởi chạy
1. Mở cửa sổ Terminal / PowerShell hoặc VS Code tại thư mục dự án:
```bash
# Cài đặt toàn bộ thư viện cần thiết
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

2. Mở trình duyệt web và truy cập vào đường dẫn:
```
http://localhost:3000
```

### 3. Đóng gói bản chạy thực tế (Production Build)
```bash
npm run build
npm run preview
```

---

## 📤 Hướng Dẫn Đẩy Code Lên GitHub

Nếu bạn vừa tải thư mục mã nguồn này về máy tính, thực hiện các lệnh sau trong Terminal tại thư mục dự án:

```bash
# 1. Khởi tạo kho git cục bộ
git init

# 2. Thêm toàn bộ tệp tin vào git
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: Initial commit for Hanoi Heritage Tour Explorer - THPT Thang Long"

# 4. Đặt tên nhánh chính là main
git branch -M main

# 5. Liên kết với kho chứa trên GitHub của bạn
# (Thay your-username và repository-name bằng tên tài khoản và tên repo của bạn)
git remote add origin https://github.com/your-username/repository-name.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

## 🌐 Triển Khai Miễn Phí Lên Vercel (Tạo link .vercel.app)

Giống như trang mẫu `dulichmarie.vercel.app`, bạn có thể đưa trang web lên mạng chỉ trong 1 phút hoàn toàn miễn phí:

1. Đăng nhập vào [Vercel](https://vercel.com/) (có thể đăng nhập bằng tài khoản GitHub).
2. Nhấn **Add New Project** → Chọn **Import** kho lưu trữ GitHub bạn vừa đẩy code lên.
3. Framework Preset: Để mặc định là **Vite**.
4. Nhấn **Deploy**.
5. Sau khoảng 30 - 60 giây, bạn sẽ nhận được đường dẫn trực tuyến công khai dạng `https://ten-du-an-cua-ban.vercel.app`.

---

## 📁 Cấu Trúc Dự Án

```
├── src/
│   ├── components/         # Các thành phần giao diện (GuideShell, MapView, GraphCanvas, LocationDetailModal...)
│   ├── data/               # Dữ liệu 14 địa danh & đồ thị khoảng cách (graphData.ts)
│   ├── utils/              # Thuật toán Hamilton, Dijkstra & công thức cự ly (graphAlgorithms.ts)
│   ├── types.ts            # Định nghĩa kiểu dữ liệu TypeScript
│   ├── App.tsx             # Giao diện chính và bộ điều khiển tour
│   └── main.tsx            # Điểm khởi chạy React
├── package.json            # Khai báo thư viện và script
└── README.md
```

---

© 2026 THPT Thăng Long — Hà Nội
