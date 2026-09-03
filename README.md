# DS Tiên Cosmetics - E-Commerce Platform

Một nền tảng thương mại điện tử hiện đại, tốc độ cao được xây dựng cho **DS Tiên Cosmetics**, sử dụng React, Vite, Tailwind CSS và Firebase. 

## Tính năng nổi bật
- **Trải nghiệm mua sắm mượt mà:** Giao diện người dùng tối ưu, thân thiện trên cả điện thoại và máy tính.
- **Giỏ hàng & Thanh toán:** Quản lý giỏ hàng, áp dụng mã giảm giá, tính phí vận chuyển và đặt hàng (ngăn chặn trùng lặp mã đơn).
- **Theo dõi đơn hàng:** Khách hàng có thể tra cứu tình trạng đơn hàng thời gian thực.
- **Đồng bộ URL:** Trạng thái trang (tìm kiếm, chi tiết sản phẩm/bài viết) được đồng bộ với URL để dễ dàng chia sẻ và sử dụng nút back/forward.
- **Bảng điều khiển Admin:** Quản lý sản phẩm, danh mục, voucher, đơn hàng và bài viết blog trực tiếp trên giao diện web an toàn.
- **Backend Firebase:** Xác thực người dùng bằng Firebase Auth, lưu trữ dữ liệu với Firestore.

## Cấu trúc thư mục (Directory Structure)

```text
.
├── src/
│   ├── components/
│   │   ├── admin/       # Bảng điều khiển quản trị (quản lý đơn hàng, sản phẩm, blog)
│   │   ├── ui/          # Các UI component độc lập (SEO, Drawer, Modal)
│   │   └── views/       # Các trang hiển thị chính (Home, Checkout, Product, Blog)
│   ├── hooks/           # Custom React hooks (VD: useUrlSync.ts)
│   ├── lib/             # Cấu hình dịch vụ (VD: firebase.ts)
│   ├── types/           # Định nghĩa các interface và types của TypeScript
│   ├── utils/           # Các hàm tiện ích hỗ trợ (format tiền tệ, xử lý ngày tháng)
│   ├── App.tsx          # Main Component chứa logic định tuyến views (routing)
│   └── main.tsx         # Điểm khởi chạy của ứng dụng (Entry point)
├── package.json         # Danh sách thư viện và scripts
└── vite.config.ts       # Cấu hình Vite
```

## Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (phiên bản 18+ khuyến nghị)
- [Bun](https://bun.sh/) (Bộ công cụ chạy và quản lý package siêu tốc)

## Cài đặt (Installation)
Clone dự án và cài đặt toàn bộ thư viện cần thiết thông qua `bun`:
```bash
# Cài đặt dependencies
bun install
```

## Khởi chạy môi trường phát triển (Development)
Để chạy dự án ở chế độ dev với hot-reload:
```bash
bun run dev
```
Ứng dụng sẽ được khởi động. Truy cập địa chỉ http://localhost:3000 trên trình duyệt để sử dụng.

## Cấu hình môi trường (Environment Variables)
Đảm bảo bạn có file `.env` ở thư mục gốc chứa các thông số cấu hình Firebase để ứng dụng hoạt động:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Đóng gói & Triển khai (Build & Deploy)
Để đóng gói ứng dụng cho môi trường Production (sẵn sàng để deploy):
```bash
bun run build
```
Lệnh này sẽ tạo ra thư mục `dist/` chứa toàn bộ code frontend đã được tối ưu hóa (minified, code-split).

Thư mục `dist/` này có thể được triển khai trực tiếp lên các nền tảng như **Firebase Hosting**, **Vercel**, **Netlify**, hoặc **Cloud Run**. 

Ví dụ với Firebase Hosting:
```bash
# Cài đặt Firebase CLI (nếu chưa có)
bun install -g firebase-tools

# Đăng nhập và khởi tạo
firebase login
firebase init hosting # Chọn thư mục public là `dist`

# Triển khai
firebase deploy --only hosting
```
