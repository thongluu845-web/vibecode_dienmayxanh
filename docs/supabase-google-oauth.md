# Setup Supabase Google OAuth

Tài liệu này áp dụng cho web bán hàng điện lạnh dùng Next.js App Router và Supabase Auth.

## 1. Tạo hoặc chuẩn bị Supabase project

1. Vào Supabase Dashboard, tạo project cho hệ thống bán hàng điện lạnh.
2. Mở **Project Settings > API** hoặc nút **Connect**.
3. Lấy:
   - `Project URL`
   - `Publishable key` (`sb_publishable_...`). Nếu project cũ chưa có publishable key, có thể dùng `anon public` key cho biến này.
4. Tạo file `.env.local` từ `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Không đưa `service_role` key hoặc Google client secret vào frontend.

## 2. Lấy Supabase callback URL

1. Vào **Authentication > Sign In / Providers**.
2. Mở provider **Google**.
3. Copy **Callback URL**. Với Supabase hosted, URL có dạng:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Đây là URL sẽ nhập vào Google Cloud, không phải `/auth/callback` của Next.js app.

## 3. Tạo Google OAuth client

1. Vào [Google Auth Platform Clients](https://console.developers.google.com/auth/clients).
2. Chọn hoặc tạo Google Cloud project.
3. Nếu được yêu cầu, đăng ký app trong Google Auth Platform:
   - App name: tên shop hoặc thương hiệu điện lạnh của bạn.
   - User support email: email hỗ trợ khách hàng.
   - Audience/User type: chọn **External** nếu khách hàng dùng Gmail ngoài tổ chức.
   - Branding: thêm logo, domain sản xuất, email liên hệ.
4. Vào **Data Access / Scopes** và đảm bảo có các scope:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Vào **Clients > Create client**.
6. Chọn **Application type: Web application**.
7. Thêm **Authorized JavaScript origins**:

```text
http://localhost:3000
https://your-production-domain.com
```

8. Thêm **Authorized redirect URIs**:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Nếu chạy Supabase CLI local, thêm:

```text
http://127.0.0.1:54321/auth/v1/callback
```

9. Bấm **Create**, tải/lưu ngay Client ID và Client Secret. Google chỉ hiển thị full client secret tại thời điểm tạo hoặc lúc rotate secret.

## 4. Bật Google provider trong Supabase

1. Quay lại **Supabase Dashboard > Authentication > Sign In / Providers > Google**.
2. Bật **Google enabled**.
3. Dán:
   - Google Client ID
   - Google Client Secret
4. Save.

## 5. Cấu hình redirect URL của app trong Supabase

Vào **Authentication > URL Configuration**.

Site URL khi dev:

```text
http://localhost:3000
```

Additional Redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

Nếu dùng preview deploy, có thể thêm wildcard preview theo domain của nền tảng deploy. Production nên dùng URL chính xác.

## 6. Chạy và kiểm tra

1. Khởi động lại dev server sau khi tạo `.env.local`.
2. Chạy:

```bash
npm run dev
```

3. Mở:

```text
http://localhost:3000/tai-khoan
```

4. Bấm **Đăng nhập bằng Google**.
5. Sau consent, luồng đúng là:

```text
App /tai-khoan -> Supabase Auth -> Google -> Supabase callback -> App /auth/callback -> /tai-khoan
```

Lỗi thường gặp:

- `redirect_uri_mismatch`: URL trong Google **Authorized redirect URIs** chưa đúng Supabase callback URL.
- Redirect về localhost trên production: thiếu production URL trong Supabase **URL Configuration**.
- Button bị disable: thiếu `.env.local` hoặc chưa restart dev server.
