# Project Rules

Những quy tắc này áp dụng cho mọi lần setup, sửa code, build UI, hoặc làm tính năng có liên quan đến dữ liệu trong repo này.

## Commands

- Khi chạy script Node/NPM trên Windows/PowerShell, luôn dùng `npm.cmd` thay vì `npm`.
- Ví dụ:
  - `npm.cmd install`
  - `npm.cmd run dev`
  - `npm.cmd run build`
  - `npm.cmd run lint`

## UI Work

- Khi làm hoặc sửa UI, phải đảm bảo đầy đủ responsive cho mobile, tablet, và desktop.
- UI cần được format gọn, nhất quán spacing, typography, trạng thái hover/focus/loading/empty/error khi phù hợp.
- Ưu tiên icon từ thư viện đang có trong project như `@mui/icons-material` hoặc `react-icons`; không tự vẽ icon thủ công nếu thư viện đã có icon phù hợp.
- Không hoàn tất task UI nếu chưa kiểm tra layout không vỡ, không tràn chữ, và các thành phần chính dùng được trên viewport nhỏ.

## Supabase

- Project dùng Supabase cho auth/dữ liệu, nên trước khi làm tính năng liên quan đến đăng nhập, session, database, storage, hoặc persistence phải đọc cấu hình hiện có.
- Các file cần kiểm tra trước:
  - `.env.example`
  - `.env.local` hoặc `.env` nếu cần xác nhận biến môi trường, nhưng không được in hoặc commit secret
  - `lib/supabase/config.ts`
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/middleware.ts`
  - `docs/supabase-google-oauth.md` nếu task liên quan Google OAuth
- Không hard-code Supabase URL/key trong code. Luôn lấy qua config/env hiện có.
- Không đưa `service_role` key hoặc secret vào frontend. Frontend chỉ được dùng publishable/anon key phù hợp.
- Khi thêm hoặc đổi bảng, policy, view, function, storage bucket, hoặc luồng ghi dữ liệu, phải xem xét RLS và quyền truy cập Supabase trước khi coi là xong.
- Khi Supabase behavior/API có thể đã thay đổi, kiểm tra tài liệu/changelog Supabase hiện tại trước khi implement.
