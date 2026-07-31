# 🎯 TÍNH NĂNG BẮT BUỘC ĐỂ HỆ THỐNG TOEIC 900+ HOÀN THIỆN

> Dựa trên danh sách 500+ tính năng, đây là các tính năng **CỐT LÕI** mà hệ thống **BẮT BUỘC** phải có.

---

## 📊 TỔNG QUAN HIỆN TẠI

| Module | Trạng thái | Ghi chú |
|--------|-----------|---------|
| Auth (Đăng ký/Đăng nhập) | ✅ Có | `auth.controller.ts`, `auth.service.ts` |
| Profile | ✅ Có | `profile.controller.ts`, `profile.service.ts` |
| Onboarding | ✅ Có | `/onboarding` page |
| Vocabulary (Từ vựng) | ✅ Có | API + Web page, SRS progress tracking |
| Placement Test | 🟡 Một phần | Controller có, thiếu service logic |
| Listening Practice | ❌ Chưa có | Không có module API |
| Reading Practice | ❌ Chưa có | Không có module API |
| Grammar System | ❌ Chưa có | Không có module API |
| Test System (Mini/Full) | ❌ Chưa có | Chỉ có UI mock-test |
| Error Tracking | ❌ Chưa có | — |
| Progress Tracking | ❌ Chưa có | Thiếu API thống kê |
| Admin Panel | ❌ Chưa có | — |

---

## ✅ DANH SÁCH TÍNH NĂNG BẮT BUỘC (Chia theo nhóm ưu tiên)

---

### 🔴 ƯU TIÊN 1 — NỀN TẢNG CỐT LÕI (Không có thì hệ thống không hoạt động)

#### 1. Authentication & User Management
- [x] Đăng ký bằng email/password
- [x] Đăng nhập bằng email/password
- [ ] **Forgot password** (form + gửi email reset)
- [ ] **Đổi mật khẩu** (current + new + confirm)
- [ ] **Logout** (manual + auto sau 30 phút inactive)
- [ ] **JWT refresh token** / session management cơ bản

#### 2. Onboarding & Placement Test
- [x] Welcome screen + nhập điểm hiện tại/mục tiêu
- [x] Chọn thời gian học hàng ngày
- [ ] **Placement Test hoàn chỉnh** — BẮT BUỘC:
  - [ ] Hiển thị câu hỏi (Listening Part 1-4 + Reading Part 5-7)
  - [ ] Timer (45 phút Listening + 75 phút Reading)
  - [ ] Nộp bài (thủ công + tự động khi hết giờ)
  - [ ] Tính điểm & phân tích kết quả
  - [ ] Gán chặng tự động dựa trên điểm
- [ ] **Hiển thị kết quả Placement Test** (tổng điểm, điểm từng phần, điểm yếu)

#### 3. Profile Management
- [x] Xem thông tin hồ sơ
- [ ] **Chỉnh sửa tên, email**
- [ ] **Upload avatar**
- [ ] **Xem ngày tạo tài khoản, ngày đăng nhập gần nhất**

---

### 🟠 ƯU TIÊN 2 — HỆ THỐNG HỌC TẬP CHÍNH (Giá trị cốt lõi của sản phẩm)

#### 4. Vocabulary System (Hệ thống Từ vựng) — HOÀN THIỆN
- [x] Học từ mới (hiển thị từ, phiên âm, nghĩa, ví dụ)
- [x] SRS tracking (review level, next review)
- [ ] **Phát âm thanh** (audio playback cho từ vựng)
- [ ] **Flashcard mode** — lật thẻ học từ
- [ ] **Ôn tập SRS** — hiển thị hàng đợi ôn, nút Easy/Good/Hard
- [ ] **Tìm kiếm từ vựng** (theo tiếng Anh/Việt)
- [ ] **Lọc từ vựng** (theo stage, topic, status)
- [ ] **Thống kê từ vựng cơ bản** (tổng đã học, đang ôn, thành thạo)

#### 5. Listening Practice (Luyện Nghe) — MỚI
- [ ] **Part 1** — Photographs: hiển thị ảnh + phát audio + 4 đáp án + giải thích
- [ ] **Part 2** — Question-Response: phát audio + 3 đáp án + giải thích
- [ ] **Part 3** — Conversations: phát audio hội thoại + 3 câu hỏi/đoạn + transcript
- [ ] **Part 4** — Talks: phát audio bài nói + 3 câu hỏi/đoạn + transcript
- [ ] **Chung cho tất cả Part**:
  - [ ] Audio playback control (play/pause/replay)
  - [ ] Điều chỉnh tốc độ phát (0.75x, 1x, 1.25x)
  - [ ] Hiển thị đáp án đúng + giải thích
  - [ ] Hiển thị transcript
  - [ ] Đánh dấu xem lại
  - [ ] Timer (tùy chọn)

#### 6. Reading Practice (Luyện Đọc) — MỚI
- [ ] **Part 5** — Incomplete Sentences: hiển thị câu + 4 đáp án + giải thích ngữ pháp
- [ ] **Part 6** — Text Completion: hiển thị đoạn văn có chỗ trống + 4 đáp án/chỗ trống
- [ ] **Part 7** — Reading Comprehension:
  - [ ] Single Passages (đoạn văn đơn + câu hỏi)
  - [ ] Multiple Passages (đoạn văn kép + câu hỏi)
- [ ] **Chung cho tất cả Part**:
  - [ ] Hiển thị đáp án đúng + giải thích
  - [ ] Đánh dấu xem lại
  - [ ] Timer (tùy chọn)
  - [ ] Chọn số câu hỏi

#### 7. Grammar System (Hệ thống Ngữ pháp) — MỚI
- [ ] **Danh sách bài học ngữ pháp** (theo category, theo stage)
- [ ] **Xem chi tiết bài học** (giải thích, ví dụ, lỗi thường gặp)
- [ ] **Bài tập ngữ pháp** (câu hỏi trắc nghiệm + giải thích đáp án)
- [ ] **Đánh dấu bài học hoàn thành**

---

### 🟡 ƯU TIÊN 3 — HỆ THỐNG KIỂM TRA & ĐÁNH GIÁ (Đo lường tiến độ)

#### 8. Test System (Mini Test + Full Test)
- [ ] **Mini Test** (50 câu):
  - [ ] Chọn phần (Listening/Reading/Mixed)
  - [ ] Timer (30/45/60 phút)
  - [ ] Điều hướng giữa các câu hỏi
  - [ ] Đánh dấu xem lại
  - [ ] Nộp bài (thủ công + tự động)
  - [ ] Hiển thị kết quả (điểm, phân tích theo phần, câu sai)
- [ ] **Full Test** (200 câu):
  - [ ] Listening (45 phút) + Reading (75 phút)
  - [ ] Tất cả Part 1-7 theo thứ tự
  - [ ] Score breakdown by part
  - [ ] Review câu sai + giải thích
- [ ] **Lịch sử kiểm tra**:
  - [ ] Danh sách các bài test đã làm
  - [ ] Xem lại chi tiết bài test
  - [ ] Biểu đồ xu hướng điểm

#### 9. Error Tracking (Theo dõi lỗi)
- [ ] **Tự động ghi lỗi** khi trả lời sai (từ practice + test)
- [ ] **Danh sách lỗi** (lọc theo loại lỗi, theo Part)
- [ ] **Xem chi tiết lỗi** (câu hỏi gốc, đáp án sai, đáp án đúng, giải thích)
- [ ] **Đánh dấu đã giải quyết/chưa giải quyết**

---

### 🟢 ƯU TIÊN 4 — THEO DÕI TIẾN ĐỘ & TRẢI NGHIỆM (Giữ chân người dùng)

#### 10. Progress Tracking (Dashboard thống kê)
- [ ] **Daily Dashboard**:
  - [ ] Thời gian học hôm nay
  - [ ] Số từ đã học/ôn
  - [ ] Số câu luyện tập
  - [ ] Tỷ lệ chính xác
  - [ ] Streak (chuỗi ngày học)
- [ ] **Biểu đồ tiến độ**:
  - [ ] Xu hướng điểm test theo thời gian
  - [ ] Tăng trưởng từ vựng
  - [ ] Phân tích điểm mạnh/yếu theo Part
- [ ] **Stage Progress** (tiến độ chặng hiện tại)

#### 11. Gamification cơ bản
- [ ] **Streak System** — đếm chuỗi ngày học liên tiếp
- [ ] **Achievement cơ bản** — huy hiệu cho các mốc quan trọng (100 từ, 7 ngày streak, hoàn thành 1 full test...)
- [ ] **Thanh tiến độ XP/Level** — hiển thị cấp độ người dùng

---

### 🔵 ƯU TIÊN 5 — QUẢN TRỊ & VẬN HÀNH (Admin panel)

#### 12. Admin Panel
- [ ] **Quản lý người dùng** — danh sách, tìm kiếm, xem chi tiết, khóa/mở tài khoản
- [ ] **Quản lý từ vựng** — thêm/sửa/xóa, import hàng loạt
- [ ] **Quản lý ngân hàng câu hỏi** — thêm/sửa/xóa câu hỏi (Listening + Reading)
- [ ] **Quản lý bài test** — tạo/sửa/xóa test
- [ ] **Thống kê hệ thống** — số user active, tỷ lệ giữ chân

---

## 📋 TÓM TẮT SỐ LƯỢNG

| Nhóm ưu tiên | Số nhóm tính năng | Mô tả |
|---------------|-------------------|-------|
| 🔴 Ưu tiên 1 | 3 nhóm | Nền tảng — Auth, Onboarding, Profile |
| 🟠 Ưu tiên 2 | 4 nhóm | Học tập chính — Vocab, Listening, Reading, Grammar |
| 🟡 Ưu tiên 3 | 2 nhóm | Kiểm tra — Test System, Error Tracking |
| 🟢 Ưu tiên 4 | 2 nhóm | Trải nghiệm — Progress, Gamification |
| 🔵 Ưu tiên 5 | 1 nhóm | Vận hành — Admin Panel |
| **Tổng** | **12 nhóm** | **~120 tính năng cốt lõi** (từ 500+ gốc) |

---

## ⚠️ TÍNH NĂNG CÓ THỂ BỎ QUA (Nice-to-have)

Các tính năng sau **KHÔNG BẮT BUỘC** cho đồ án, có thể bổ sung sau:

| Tính năng | Lý do bỏ qua |
|-----------|--------------|
| OAuth (Google/Facebook) | Email/password đủ cho đồ án |
| Email notifications | Push/in-app notification đủ dùng |
| Offline mode | Web app không cần thiết |
| Social features (bạn bè, nhóm) | Không phải core learning |
| Leaderboard | Nice-to-have, không ảnh hưởng học tập |
| Challenges (thử thách) | Gamification nâng cao |
| Calendar integration | Tính năng phụ |
| Two-factor authentication | Bảo mật nâng cao |
| Accessibility settings | Có thể bổ sung sau |
| Mobile widgets | Chỉ dùng cho mobile app |
| Study Groups | Tính năng xã hội nâng cao |
| Rewards/Points redemption | Gamification nâng cao |
| PDF report download | Nice-to-have |
| Theme customization | Light/dark mode cơ bản đủ |

---

## 🗺️ GỢI Ý THỨ TỰ TRIỂN KHAI

```
Giai đoạn 1: Hoàn thiện nền tảng (Ưu tiên 1)
    ├── Hoàn thiện Auth (forgot password, logout)
    ├── Hoàn thiện Placement Test (service logic + scoring)
    └── Hoàn thiện Profile (edit, avatar)

Giai đoạn 2: Xây dựng hệ thống học tập (Ưu tiên 2)
    ├── Hoàn thiện Vocabulary (SRS review, flashcard, search/filter)
    ├── Xây dựng Listening Practice (Part 1-4)
    ├── Xây dựng Reading Practice (Part 5-7)
    └── Xây dựng Grammar System

Giai đoạn 3: Hệ thống kiểm tra (Ưu tiên 3)
    ├── Mini Test (50 câu)
    ├── Full Test (200 câu)
    ├── Test History & Analytics
    └── Error Tracking System

Giai đoạn 4: Dashboard & Gamification (Ưu tiên 4)
    ├── Daily Dashboard thống kê
    ├── Biểu đồ tiến độ
    ├── Streak System
    └── Achievement badges

Giai đoạn 5: Admin Panel (Ưu tiên 5)
    ├── User management
    ├── Content management (vocab, questions, tests)
    └── System analytics
```

> [!IMPORTANT]
> Tổng cộng cần khoảng **~120 tính năng cốt lõi** từ danh sách 500+ tính năng gốc. Đây là mức tối thiểu để hệ thống TOEIC 900+ được coi là **hoàn thiện và có giá trị sử dụng thực tế**.
