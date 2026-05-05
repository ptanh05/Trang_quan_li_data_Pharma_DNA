# PharmaDNA - Blockchain Supply Chain Management

Hệ thống quản lý chuỗi cung ứng dược phẩm dựa trên công nghệ blockchain, đảm bảo tính minh bạch và truy xuất nguồn gốc cho mọi lô thuốc.

## 🚀 Tính năng

### 🔐 Admin Portal
- Quản lý người dùng và cấp quyền
- Gán vai trò (Manufacturer, Distributor, Pharmacy)
- Đồng bộ quyền lên blockchain
- Thống kê tổng quan hệ thống

### 🏭 Manufacturer Portal (Nhà Sản Xuất)
- Tạo lô thuốc mới (mint NFT)
- Ghi nhận thông tin sản xuất lên blockchain
- Quản lý danh sách lô thuốc đã tạo
- Theo dõi trạng thái phân phối

### 🚚 Distributor Portal (Nhà Phân Phối)
- Quản lý vận chuyển
- Cập nhật trạng thái lô hàng
- Theo dõi lộ trình phân phối
- Lịch sử giao hàng

### 💊 Pharmacy Portal (Nhà Thuốc)
- Xác minh nguồn gốc lô thuốc
- Quét QR code để tra cứu
- Xác nhận nhập kho
- Quản lý kho thuốc

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.2.4, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Blockchain**: ethers.js, PharmaDNA Chainlet (Saga Network)
- **Database**: PostgreSQL (pg)
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod
- **Analytics**: Vercel Analytics

## 📋 Yêu cầu hệ thống

- Node.js 18+ hoặc 20+
- PostgreSQL 14+
- pnpm (khuyến nghị) hoặc npm

## 🔧 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd Trang_quan_li_data_Pharma_DNA
```

### 2. Cài đặt dependencies

```bash
pnpm install
# hoặc
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pharmadna

# Blockchain
PHARMA_NFT_ADDRESS=0xaa3f88a6b613985f3D97295D6BAAb6246c2699c6
PHARMADNA_RPC=https://pharmadna-2759821881746000-1.jsonrpc.sagarpc.io
OWNER_PRIVATE_KEY=your_private_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Khởi tạo database

Chạy script SQL để tạo schema:

```bash
psql -U username -d pharmadna -f database/schema.sql
```

Hoặc kết nối vào PostgreSQL và chạy:

```sql
\i database/schema.sql
```

### 5. Chạy development server

```bash
pnpm dev
# hoặc
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc thư mục

```
Trang_quan_li_data_Pharma_DNA/
├── app/
│   ├── admin/              # Admin portal
│   ├── manufacturer/       # Manufacturer portal
│   ├── distributor/        # Distributor portal
│   ├── pharmacy/           # Pharmacy portal
│   ├── api/
│   │   └── admin/          # Admin API routes
│   ├── actions/            # Server actions
│   ├── components/         # App-specific components
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── AdminGuard.tsx      # Admin route guard
│   └── AdminLoginForm.tsx  # Admin login
├── hooks/
│   ├── useAdminAuth.ts     # Admin authentication
│   └── useRoleAuth.ts      # Role types
├── lib/
│   ├── pharmaNFT-abi.json  # Smart contract ABI
│   └── utils.ts            # Utility functions
├── database/
│   └── schema.sql          # Database schema
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 Đăng nhập Admin

Thông tin đăng nhập mặc định:

- **Username**: `Admin123`
- **Password**: `Admin123`

⚠️ **Lưu ý**: Đổi thông tin đăng nhập trong production!

## 🗄️ Database Schema

### Bảng `users`
Lưu trữ thông tin người dùng và vai trò:
- `address`: Địa chỉ ví blockchain
- `role`: ADMIN | MANUFACTURER | DISTRIBUTOR | PHARMACY
- `assigned_at`: Thời gian cấp quyền

### Bảng `drug_batches`
Lưu trữ thông tin lô thuốc/NFT:
- `token_id`: ID của NFT trên blockchain
- `batch_number`: Mã lô thuốc
- `drug_name`: Tên thuốc
- `manufacturer_address`: Địa chỉ nhà sản xuất
- `status`: MANUFACTURED | IN_TRANSIT | IN_PHARMACY | SOLD

### Bảng `supply_chain_events`
Lưu trữ lịch sử di chuyển:
- `batch_id`: ID lô thuốc
- `event_type`: MANUFACTURED | SHIPPED | RECEIVED | SOLD
- `from_address`, `to_address`: Địa chỉ gửi/nhận
- `transaction_hash`: Hash giao dịch blockchain

## 🔗 Smart Contract

Contract được deploy trên **PharmaDNA Chainlet** (Saga Network):

- **Address**: `0xaa3f88a6b613985f3D97295D6BAAb6246c2699c6`
- **Network**: PharmaDNA Chainlet
- **RPC**: `https://pharmadna-2759821881746000-1.jsonrpc.sagarpc.io`
- **Explorer**: [https://pharmadna-2759821881746000-1.sagaexplorer.io](https://pharmadna-2759821881746000-1.sagaexplorer.io)

## 🚧 Tính năng đang phát triển

- [ ] Tích hợp MetaMask/WalletConnect
- [ ] Mint NFT thực tế từ Manufacturer portal
- [ ] Cập nhật trạng thái blockchain từ Distributor
- [ ] Xác minh blockchain từ Pharmacy
- [ ] Upload metadata lên IPFS
- [ ] QR code generation và scanning
- [ ] Real-time notifications
- [ ] Dashboard analytics với charts
- [ ] Export báo cáo PDF/Excel
- [ ] Multi-language support

## 📝 Scripts

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Lint
pnpm lint
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát triển cho mục đích giáo dục và nghiên cứu.

## 📞 Liên hệ

- **Project**: PharmaDNA
- **Network**: Saga PharmaDNA Chainlet
- **Year**: 2025

---

Made with ❤️ using Next.js and Blockchain Technology