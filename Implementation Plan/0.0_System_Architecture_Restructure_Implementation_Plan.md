# 🏗️ PHÂN TÍCH & TÁI CẤU TRÚC HỆ THỐNG TOEIC-AI (BELLA)

> **Vai trò**: Senior Software Architect + Product Designer + Business Analyst  
> **Phạm vi**: Phân tích toàn bộ source code hiện tại, đề xuất tái cấu trúc  
> **Nguyên tắc**: Không xóa tính năng, chỉ gộp/di chuyển/ưu tiên hợp lý

---

## BƯỚC 1 — AUDIT HỆ THỐNG HIỆN TẠI

### 1.1 Thống kê hiện trạng

| Chỉ số | Số lượng | Đánh giá |
|:-------|:--------:|:--------:|
| Tổng thư mục con trong `/dashboard` | **31 thư mục** | ⚠️ Quá nhiều |
| Tổng số page.tsx trong dashboard | ~33 files | ⚠️ Phình to |
| Backend modules trong `/api/src` | 25 modules | Hợp lý cho số tính năng |
| Frontend services | 8 files | ✅ Gọn |
| Menu items hiện tại trong Sidebar | ~25 items trong 5 nhóm | ⚠️ Quá nhiều |
| Kích thước `dashboard/page.tsx` | 126KB / 2185 dòng | 🔴 Quá lớn |
| Kích thước `settings/page.tsx` | 132KB / 2908 dòng | 🔴 Quá lớn |
| Kích thước `mock-test/page.tsx` | 88KB / 1846 dòng | ⚠️ Lớn |
| Kích thước `error-log/page.tsx` | 92KB / 1798 dòng | ⚠️ Lớn |

### 1.2 Bảng vấn đề chi tiết

| # | Thành phần | Hiện tại | Vấn đề cụ thể | Mức độ |
|:-:|:-----------|:---------|:---------------|:------:|
| 1 | **schedule + planner + calendar** | 3 page riêng biệt (`/schedule`, `/planner`, `/calendar`) | **Trùng chức năng rõ ràng**: Cả 3 đều xoay quanh lịch học và kế hoạch. Nên là 1 page với tabs/views | 🔴 Cao |
| 2 | **streak + points + badges + achievements** | 4 page riêng biệt | **Sub-feature tách thành page**: Streak, Points, Badges, Achievements đều thuộc Gamification/Progress. Không cần 4 route riêng | 🔴 Cao |
| 3 | **vocabulary + review** | `/vocabulary` (học từ mới) + `/review` (ôn SRS) | **Flow bị tách rời**: Review chính là SRS review của Vocabulary, nên nằm bên trong Vocabulary | 🟠 Trung bình |
| 4 | **courses vs vocabulary + grammar + listening + reading** | `/courses` (Hub 4 tab) vs 4 page riêng lẻ | **Trùng lặp nghiêm trọng**: `/courses` đã chứa 4 tab Từ vựng/Ngữ pháp/Listening/Reading, nhưng lại tồn tại song song 4 page riêng biệt `/vocabulary`, `/grammar`, `/listening`, `/reading`. User không biết nên vào đâu | 🔴 Cao |
| 5 | **practice vs listening/reading** | `/practice` (luyện tổng hợp) vs `/listening` + `/reading` (luyện riêng) | **Flow chồng chéo**: Practice Part 1-4 trùng Listening Drill, Practice Part 5-7 trùng Reading Drill | 🟠 Trung bình |
| 6 | **profile vs settings** | `/profile` (59KB) vs `/settings` (132KB) | **Phạm vi chồng nhau**: Profile có phần bảo mật + đổi mật khẩu. Settings có 5 tab lớn. Security có trang riêng `/security` (30KB). Ba trang cùng quản lý tài khoản người dùng | 🟠 Trung bình |
| 7 | **notifications + reminders** | `/notifications` (62KB) vs `/reminders` (22KB) | **Trùng mục đích**: Notifications quản lý thông báo, Reminders quản lý nhắc nhở — cùng thuộc hệ thống thông báo | 🟡 Nhẹ |
| 8 | **friends + study-groups + social-share** | 3 page riêng biệt | **Module MXH quá lớn cho đồ án**: 3 page social cho 1 đồ án TOEIC là dư thừa, nên gộp hoặc chuyển V2 | 🟠 Trung bình |
| 9 | **audio-player + offline + widgets** | 3 page tiện ích riêng | **Tính năng phụ nhưng tốn trang**: Không phải core learning, có thể gộp vào Settings hoặc chuyển V2 | 🟡 Nhẹ |
| 10 | **recommendations** | Page riêng `/recommendations` | **Có thể là phần của Dashboard**: AI gợi ý nên tích hợp trực tiếp vào Dashboard thay vì trang riêng | 🟡 Nhẹ |
| 11 | **admin + content-admin** | 2 khu vực admin riêng biệt | **Phân tán quản trị**: Admin quản lý user + hệ thống; Content-admin quản lý nội dung. Nên gộp thành 1 Admin Portal | 🟡 Nhẹ |

### 1.3 Phân tích trùng lặp Route

```
TRÙNG TRỰC TIẾP:
  /courses (Tab: Từ vựng)     ↔  /vocabulary        ← Cùng hiển thị bài học từ vựng
  /courses (Tab: Ngữ pháp)    ↔  /grammar            ← Cùng hiển thị bài học ngữ pháp  
  /courses (Tab: Listening)   ↔  /listening           ← Cùng hiển thị Listening drills
  /courses (Tab: Reading)     ↔  /reading             ← Cùng hiển thị Reading drills

TRÙNG LOGIC:
  /schedule + /planner + /calendar                    ← 3 trang cùng quản lý lịch học
  /streak + /points + /badges + /achievements         ← 4 trang cùng thuộc gamification
  /profile + /settings + /security                    ← 3 trang cùng quản lý tài khoản
  /notifications + /reminders                         ← 2 trang cùng quản lý thông báo
  /practice (Part 1-4) ↔ /listening (Part 1-4)        ← Cùng engine luyện nghe
  /practice (Part 5-7) ↔ /reading (Part 5-7)          ← Cùng engine luyện đọc
```

---

## BƯỚC 2 — GOM NHÓM TÍNH NĂNG (RESTRUCTURED ARCHITECTURE)

Từ **31 thư mục con / ~25 menu items**, tái cấu trúc thành **7 Module cấp cao**:

```
TOEIC-AI (BELLA)
│
├── M1. DASHBOARD (Bảng điều khiển & AI Insights)
│   ├── Tổng quan tiến độ (Vital Metrics, Biểu đồ)
│   ├── AI Recommendations (Gợi ý thông minh BELLA — tích hợp, không trang riêng)
│   └── Period Views (Hôm nay / Tuần / Tháng / Tổng quan / Phân tích / Mục tiêu)
│
├── M2. LEARNING (Trung tâm Học tập)
│   ├── Vocabulary (Từ vựng)
│   │   ├── Bài học theo Chặng & Chủ đề
│   │   ├── SRS Flashcard Review (gộp /review vào đây)
│   │   ├── Thống kê từ vựng (sub-page, không trang riêng)
│   │   └── Cài đặt từ vựng (sub-page)
│   └── Grammar (Ngữ pháp)
│       ├── Bài học lý thuyết theo Category
│       ├── Bài tập trắc nghiệm
│       ├── Sổ tay ngữ pháp (Reference)
│       └── Cài đặt (sub-page)
│
├── M3. PRACTICE & TEST (Luyện tập & Thi thử)
│   ├── Listening Practice (Luyện nghe Part 1-4)
│   │   ├── Part 1: Photographs
│   │   ├── Part 2: Question-Response
│   │   ├── Part 3: Conversations
│   │   └── Part 4: Talks
│   ├── Reading Practice (Luyện đọc Part 5-7)
│   │   ├── Part 5: Incomplete Sentences
│   │   ├── Part 6: Text Completion
│   │   └── Part 7: Reading Comprehension
│   ├── Mixed Practice (Luyện tổng hợp ngẫu nhiên)
│   └── Mock Test (Thi thử TOEIC)
│       ├── Mini Test (30-60 phút)
│       ├── Full Test ETS (200 câu / 120 phút)
│       ├── Lịch sử thi & Kết quả chi tiết
│       └── Cài đặt thi (sub-page)
│
├── M4. REVIEW & AI (Sổ tay Câu sai & AI Chẩn đoán)
│   ├── Error Log (Danh sách câu sai tự động)
│   ├── AI Explanation (AI giải thích nguyên nhân sai)
│   ├── Error Drills (Luyện lại câu sai)
│   └── Weakness Radar (Biểu đồ Rada phân tích Part yếu)
│
├── M5. PROGRESS (Tiến độ & Gamification)
│   ├── Streak System (Chuỗi ngày học — tích hợp Header + sub-tab)
│   ├── Achievements & Badges (Thành tích & Huy hiệu — gộp 2 trang)
│   ├── XP & Level (Cấp độ — tích hợp Header)
│   ├── Points History (Lịch sử điểm — sub-tab)
│   ├── Leaderboard (Bảng xếp hạng — sub-tab)
│   └── Daily Challenges (Thử thách hàng ngày — sub-tab)
│
├── M6. ACCOUNT (Tài khoản & Cài đặt)
│   ├── Profile (Hồ sơ cá nhân)
│   ├── Settings (Cài đặt: Học tập / Giao diện / Trợ năng / Ngôn ngữ / Quyền riêng tư)
│   ├── Security (Bảo mật & 2FA — sub-tab trong Profile hoặc Settings)
│   └── Notifications (Thông báo — gộp reminders vào đây)
│
└── M7. ADMIN (Quản trị — khu vực riêng, gộp admin + content-admin)
    ├── Users Management
    ├── Question Bank (Ngân hàng câu hỏi Part 1-7)
    ├── Vocabulary Management (Nhập/Xuất từ vựng)
    ├── Grammar Content Management
    ├── Test Management
    └── System Analytics
```

---

## BƯỚC 3 — TỐI ƯU NAVIGATION

### 3.1 Sidebar đề xuất (chỉ 6 mục cấp cao)

```
📊  Bảng điều khiển         → /dashboard
📚  Trung tâm học tập       → /dashboard/learning
🎯  Luyện tập & Thi thử    → /dashboard/practice
📝  Sổ tay câu sai AI      → /dashboard/error-log
📈  Tiến độ & Thành tích   → /dashboard/progress
👤  Tài khoản & Cài đặt    → /dashboard/account
```

> 6 mục thay vì 25 mục. Mỗi mục dẫn tới 1 Hub page có tabs/sections bên trong.

### 3.2 Header Top-Bar (giữ nguyên widgets hiện tại)

```
[🛡️ Lv.1]  [🔥 5 ngày]  [⭐ 120 pts]  [🔔 3]  [Điểm: 450/750]
```

### 3.3 Bảng ánh xạ Page cũ → mới

| Page hiện tại | Đề xuất | Lý do |
|:--------------|:--------|:------|
| `/dashboard` | **Giữ nguyên** | Trang chủ, vẫn là entry point |
| `/recommendations` | **Tích hợp vào Dashboard** | AI gợi ý nên hiển thị trực tiếp trên Dashboard, không cần page riêng |
| `/courses` | **Bỏ page riêng, phân tán vào Learning** | `/courses` đang trùng với `/vocabulary` + `/grammar` + `/listening` + `/reading`. Hub này gây nhầm lẫn |
| `/vocabulary` | **Giữ** → `/dashboard/learning` (Tab Từ vựng) | Trang chính của module Learning |
| `/vocabulary/statistics` | **Sub-page** bên trong Vocabulary | Không cần route riêng trên sidebar |
| `/vocabulary/settings` | **Sub-page** bên trong Vocabulary | Không cần route riêng trên sidebar |
| `/review` | **Gộp vào Vocabulary** | Review chỉ là SRS review của từ vựng |
| `/grammar` | **Giữ** → `/dashboard/learning` (Tab Ngữ pháp) | Tab thứ 2 của module Learning |
| `/grammar/exercises` | **Sub-page** bên trong Grammar | Không cần route riêng trên sidebar |
| `/grammar/reference` | **Sub-page** bên trong Grammar | Không cần route riêng trên sidebar |
| `/listening` | **Giữ** → `/dashboard/practice` (Tab Luyện nghe) | Tab trong Practice & Test |
| `/reading` | **Giữ** → `/dashboard/practice` (Tab Luyện đọc) | Tab trong Practice & Test |
| `/practice` | **Giữ** → `/dashboard/practice` (Tab Tổng hợp) | Tab trong Practice & Test |
| `/mock-test` | **Giữ** → `/dashboard/practice` (Tab Thi thử) | Tab trong Practice & Test |
| `/error-log` | **Giữ nguyên** | Module đủ lớn, có 3 tab riêng (Sổ tay / Phân tích / Drill) |
| `/schedule` | **Gộp 3 thành 1** → `/dashboard/account` (Tab Lịch học) | `/schedule` + `/planner` + `/calendar` quá trùng |
| `/planner` | **Gộp vào schedule** | Xem lý do trên |
| `/calendar` | **Gộp vào schedule** | Xem lý do trên |
| `/streak` | **Gộp vào Progress** → `/dashboard/progress` (Section Streak) | Sub-feature của Gamification |
| `/points` | **Gộp vào Progress** → `/dashboard/progress` (Section Điểm) | Sub-feature của Gamification |
| `/badges` | **Gộp vào Progress** → Merge với Achievements | Badges và Achievements gần như trùng nhau |
| `/achievements` | **Gộp vào Progress** → `/dashboard/progress` (Tab Thành tích) | Giữ, gộp badges vào |
| `/leaderboard` | **Gộp vào Progress** → `/dashboard/progress` (Tab Bảng xếp hạng) | Sub-feature |
| `/challenges` | **Gộp vào Progress** → `/dashboard/progress` (Tab Thử thách) | Sub-feature |
| `/rewards` | **Gộp vào Progress** → `/dashboard/progress` (Tab Phần thưởng) | Sub-feature |
| `/profile` | **Giữ** → `/dashboard/account` (Tab Hồ sơ) | Tab trong Account |
| `/settings` | **Giữ** → `/dashboard/account` (Tab Cài đặt) | Tab trong Account |
| `/security` | **Gộp vào Account** → Sub-tab của Profile hoặc Settings | Không cần page riêng |
| `/notifications` | **Giữ** → `/dashboard/account` (Tab Thông báo) | Gộp reminders vào |
| `/reminders` | **Gộp vào Notifications** | Trùng mục đích |
| `/friends` | **Chuyển V2** | Social features không phải core TOEIC |
| `/study-groups` | **Chuyển V2** | Social features không phải core TOEIC |
| `/social-share` | **Chuyển V2** | Social features không phải core TOEIC |
| `/audio-player` | **Chuyển V2** | Tiện ích nâng cao |
| `/offline` | **Chuyển V2** | Cần PWA/Service Worker phức tạp |
| `/widgets` | **Chuyển V2** | Tiện ích nâng cao |
| `/admin` + `/content-admin` | **Gộp** → `/admin` | 1 Admin Portal duy nhất |

### Kết quả: Giảm từ **31 page-level routes** xuống còn **~12 page-level routes** (không tính sub-pages)

---

## BƯỚC 4 — TỐI ƯU USER FLOW

### Flow chính (V1 Core):

```
1. Đăng ký / Đăng nhập
   ↓
2. Onboarding
   ├── Placement Test (15-20 câu)
   ├── Chọn mục tiêu điểm (300 → 900+)
   └── AI xếp Chặng (1→5)
   ↓
3. Dashboard (Entry point chính)
   ├── Xem tiến độ tổng quan (3 Vital Metrics)
   ├── AI Gợi ý bài học tiếp theo
   └── Quick Actions → Học / Luyện / Thi
   ↓
4. HỌC (Learning Module)
   ├── Học Từ vựng mới (theo Chặng/Chủ đề)
   ├── Ôn tập SRS Flashcard
   └── Học Ngữ pháp (lý thuyết + trắc nghiệm)
   ↓
5. LUYỆN TẬP (Practice Module)
   ├── Luyện Listening (Part 1-4)
   ├── Luyện Reading (Part 5-7)
   └── Luyện tổng hợp
   ↓
6. THI THỬ (Mock Test)
   ├── Chọn dạng thi (Mini / Full)
   ├── Làm bài + Đồng hồ đếm ngược
   └── Nộp bài → Xem kết quả chi tiết
   ↓
7. XEM LẠI (Review Module)
   ├── Sổ tay câu sai (tự động gom từ bước 5+6)
   ├── AI giải thích câu sai
   ├── Luyện lại Drill câu sai
   └── Biểu đồ Rada phân tích điểm yếu
   ↓
8. AI GỢI Ý (quay lại Dashboard)
   ├── AI đề xuất bài học/luyện tập tiếp theo
   └── Cập nhật tiến độ & Gamification
   ↓
   → Lặp lại vòng 4 → 5 → 6 → 7 → 8
```

---

## BƯỚC 5 — PHÂN LOẠI PRIORITY

| Module | Feature | Priority | V1/V2 | Lý do |
|:-------|:--------|:--------:|:-----:|:------|
| **Auth** | Login/Register (Email + Google) | **P0** | **V1** | Không có thì không vào được hệ thống |
| **Auth** | Forgot/Reset Password | **P0** | **V1** | Bắt buộc cho bất kỳ hệ thống nào |
| **Auth** | 2FA | P2 | V2 | Email+JWT đã đủ cho đồ án |
| **Onboarding** | Placement Test + Goal + Stage | **P0** | **V1** | Xác định lộ trình học, core flow |
| **Dashboard** | Vital Metrics + Period Views | **P0** | **V1** | Entry point, theo dõi tiến độ |
| **Dashboard** | AI Recommendations | **P1** | **V1** | Điểm sáng AI của đồ án |
| **Learning** | Vocabulary (Lessons + SRS) | **P0** | **V1** | Core learning |
| **Learning** | Grammar (Lessons + Quiz) | **P0** | **V1** | Core learning |
| **Practice** | Listening Drill (Part 1-4) | **P0** | **V1** | Core TOEIC skill |
| **Practice** | Reading Drill (Part 5-7) | **P0** | **V1** | Core TOEIC skill |
| **Practice** | Mixed Practice | **P1** | **V1** | Giá trị gia tăng, dùng chung engine |
| **Mock Test** | Mini Test + Full Test | **P0** | **V1** | Core exam feature |
| **Mock Test** | ETS Scoring + Answer Review | **P0** | **V1** | Không có thì thi thử vô nghĩa |
| **Review** | Error Log (Auto Capture) | **P0** | **V1** | Core AI feature |
| **Review** | AI Explanation | **P0** | **V1** | Điểm sáng AI quan trọng nhất |
| **Review** | Error Drills | **P1** | **V1** | Giá trị gia tăng lớn |
| **Review** | Weakness Radar | **P1** | **V1** | Biểu đồ phân tích trực quan |
| **Progress** | Streak + Level (Header) | **P1** | **V1** | Gamification cơ bản, giữ chân user |
| **Progress** | Achievements | **P1** | **V1** | Gamification cơ bản |
| **Progress** | Points & Rewards Store | P2 | V2 | Gamification nâng cao |
| **Progress** | Leaderboard | P2 | V2 | Cần nhiều user thật |
| **Progress** | Daily Challenges | P2 | V2 | Gamification nâng cao |
| **Account** | Profile + Settings | **P0** | **V1** | Quản lý tài khoản cơ bản |
| **Account** | Notifications | **P1** | **V1** | Cần thiết nhưng có thể đơn giản |
| **Account** | Schedule/Planner/Calendar | P2 | V2 | Tính năng phụ, không thuộc core learning |
| **Social** | Friends + Study Groups + Social Share | P3 | V2 | Không phải core TOEIC |
| **Utility** | Audio Player + Offline + Widgets | P3 | V2 | Tiện ích nâng cao |
| **Admin** | Question Bank + Vocab Management | **P0** | **V1** | Admin phải có để nhập nội dung |
| **Admin** | User Management + Analytics | **P1** | **V1** | Admin cơ bản |

---

## BƯỚC 6 — ĐỀ XUẤT KIẾN TRÚC CUỐI CÙNG

### 6.1 Information Architecture (V1)

```
TOEIC-AI V1
├── Dashboard              ← Tổng quan + AI Recommendations (tích hợp)
├── Learning               ← Tab: Từ vựng (+ SRS Review) | Ngữ pháp
├── Practice & Test        ← Tab: Luyện nghe | Luyện đọc | Tổng hợp | Thi thử TOEIC
├── Review & AI            ← Tab: Sổ tay câu sai | Phân tích AI | Drill luyện lại
├── Progress               ← Streak + Achievements + Badges (tabs/sections)
├── Account                ← Tab: Hồ sơ | Cài đặt | Thông báo
└── Admin                  ← Users | Questions | Vocabulary | Tests | Analytics
```

### 6.2 Navigation cuối cùng

**Sidebar (6 mục):**
```
📊  Bảng điều khiển         /dashboard
📚  Trung tâm học tập       /dashboard/learning
🎯  Luyện tập & Thi thử    /dashboard/practice
📝  Sổ tay câu sai AI      /dashboard/error-log
📈  Tiến độ & Thành tích   /dashboard/progress
👤  Tài khoản & Cài đặt    /dashboard/account
```

**Header (5 widgets — giữ nguyên):**
```
[Lv.1 🛡️]  [🔥 5 ngày]  [⭐ 120 pts]  [🔔 3]  [450/750 🎯]
```

### 6.3 Page Structure (V1)

```
/dashboard                          ← Dashboard chính
/dashboard/learning                 ← Hub: Tab Từ vựng | Tab Ngữ pháp
/dashboard/learning/vocabulary/settings
/dashboard/learning/grammar/exercises
/dashboard/learning/grammar/reference
/dashboard/practice                 ← Hub: Tab Listening | Tab Reading | Tab Mixed | Tab Mock-Test
/dashboard/practice/listening/part-1..4
/dashboard/practice/reading/part-5..7
/dashboard/practice/mock-test       ← Danh sách đề thi
/dashboard/practice/mock-test/[attemptId]
/dashboard/practice/mock-test/result/[attemptId]
/dashboard/practice/mock-test/mini-test
/dashboard/error-log                ← Error Log + AI Analysis + Drills (3 tabs)
/dashboard/progress                 ← Streak + Achievements + Badges + Points + Leaderboard (tabs)
/dashboard/account                  ← Profile + Settings + Security + Notifications + Schedule (tabs)
/admin                              ← Admin Portal (gộp admin + content-admin)
```

### 6.4 Implementation Roadmap

```
Phase 1: Tái cấu trúc Navigation
  ├── Cập nhật Sidebar 6 mục cốt lõi
  ├── Giữ nguyên tất cả page code hiện tại
  └── Chỉ thay đổi routing/linking

Phase 2: Gộp các Hub pages
  ├── Tạo /dashboard/learning (hub cho vocab + grammar)
  ├── Nâng cấp /dashboard/practice (hub cho listening + reading + practice + mock-test)
  ├── Tạo /dashboard/progress (hub cho streak + achievements + badges + points)
  └── Tạo /dashboard/account (hub cho profile + settings + notifications + schedule)

Phase 3: Dọn dẹp & Tích hợp
  ├── Tích hợp AI Recommendations vào Dashboard
  ├── Tích hợp Mock Test tab vào Practice
  └── Đảm bảo 100% backward compatibility cho mọi route cũ

Phase 4: Thu gọn các trang mở rộng V2
  ├── Nhóm "Mở rộng & Tiện ích" tự động thu gọn mặc định trên Sidebar
  └── Vẫn tìm kiếm và truy cập được 100%
```

---

## TÓM TẮT KẾT QUẢ SAU TÁI CẤU TRÚC

| Chỉ số | Trước | Sau | Cải thiện |
|:-------|:-----:|:---:|:---------:|
| Menu Sidebar chính | 25 items / 5 nhóm | **6 items / 1 nhóm** | -76% |
| Page-level routes | 31 | **~12** | -61% |
| Trang trùng lặp | 10+ cặp trùng | **0** | ✅ |
| User phải nhớ bao nhiêu mục | 25+ | **6** | Dễ sử dụng |
| File code bị xóa | — | **0 file** | An toàn tuyệt đối |
| Database thay đổi | — | **0 thay đổi** | An toàn tuyệt đối |
