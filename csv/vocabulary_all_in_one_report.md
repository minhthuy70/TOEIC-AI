# 📊 Báo Cáo Toàn Diện Chất Lượng & Tính Chính Xác Từ Vựng TOEIC
- **Tệp kiểm tra:** `D:\GITHUB\TOEIC-AI\csv\VOCABULARY (DOAN).csv`
- **Thời gian thực hiện:** `2026-09-02 15:42:18`
- **Tổng số từ vựng:** `15,674` dòng
- **Tỉ lệ đạt chuẩn kỹ thuật (Schema):** `99.94%` (15,664/15,674)
- **Tỉ lệ xác thực từ điển thực tế (Linguistic Fact-Check):** `99.21%` (15,550/15,674)
- **Lỗi kỹ thuật:** `11` | **Cảnh báo:** `32`

## 📌 1. Phân Bố Dữ Liệu
| Tiêu chí | Chi tiết phân bố |
|---|---|
| **CEFR Level** | {'B2': 5885, 'B1': 5532, 'C1': 3035, 'A2': 922, 'A1': 300} |
| **Difficulty** | {'medium': 8450, 'easy': 4776, 'hard': 2442} |
| **TOEIC Target** | {300: 298, 350: 2, 400: 874, 450: 47, 500: 1949, 550: 108, 600: 3476, 650: 545, 700: 2715, 750: 2625, 800: 1367, 850: 1215, 900: 306, 950: 142, 990: 5} |
| **Learning Stage** | {1: 1142, 2: 4613, 3: 5276, 4: 3586, 5: 1057} |

## ❌ 2. Danh Sách Lỗi Kỹ Thuật (Schema Errors)
| Dòng | Từ Vựng | Cột Lỗi | Chi Tiết Lỗi |
|---|---|---|---|
| 1664 | `caf茅` | `english` | Dấu hiệu lỗi Mojibake font: 'caf茅' |
| 4722 | `entr茅e` | `english` | Dấu hiệu lỗi Mojibake font: 'entr茅e' |
| 4722 | `entr茅e` | `vietnamese` | Nghĩa tiếng Việt bị rỗng! |
| 5214 | `film` | `difficulty` | Độ khó không hợp lệ: 'elementary'. Chi chấp nhận: ['easy', 'medium', 'hard'] |
| 8666 | `music group` | `difficulty` | Độ khó không hợp lệ: 'elementary'. Chi chấp nhận: ['easy', 'medium', 'hard'] |
| 8681 | `musical instrument` | `difficulty` | Độ khó không hợp lệ: 'elementary'. Chi chấp nhận: ['easy', 'medium', 'hard'] |
| 12121 | `ros茅` | `english` | Dấu hiệu lỗi Mojibake font: 'ros茅' |
| 12404 | `saut茅ed` | `english` | Dấu hiệu lỗi Mojibake font: 'saut茅ed' |
| 13348 | `star` | `difficulty` | Độ khó không hợp lệ: 'elementary'. Chi chấp nhận: ['easy', 'medium', 'hard'] |
| 14292 | `ticket office` | `difficulty` | Độ khó không hợp lệ: 'elementary'. Chi chấp nhận: ['easy', 'medium', 'hard'] |
| 14429 | `track` | `difficulty` | Độ khó không hợp lệ: 'elementary'. Chi chấp nhận: ['easy', 'medium', 'hard'] |

## 🔍 3. Danh Sách Từ Vựng Chưa Có Trong Từ Điển Cổ Điển
> Các từ này chủ yếu là từ viết tắt công nghệ/kinh doanh (CI/CD, CNC, CTA), từ ghép hiện đại (codebase, countertop) hoặc từ vay mượn.

| Dòng | Từ Tiếng Anh | Chi Tiết | Gợi Ý Sửa |
|---|---|---|---|
| 3507 | `DDP` | Từ/token '['ddp']' chưa có trong từ điển chuẩn | `dp, dd, dadap` |
| 3805 | `DHCP` | Từ/token '['dhcp']' chưa có trong từ điển chuẩn | `—` |
| 4102 | `DNS` | Từ/token '['dns']' chưa có trong từ điển chuẩn | `duns, dons, dins` |
| 4103 | `DNS server` | Từ/token '['dns']' chưa có trong từ điển chuẩn | `—` |
| 4236 | `DVD` | Từ/token '['dvd']' chưa có trong từ điển chuẩn | `dd, divid, dived` |
| 4268 | `EBITDA` | Từ/token '['ebitda']' chưa có trong từ điển chuẩn | `—` |
| 4808 | `ERP` | Từ/token '['erp']' chưa có trong từ điển chuẩn | `er, ep, erupt` |
| 4809 | `ERP system` | Từ/token '['erp']' chưa có trong từ điển chuẩn | `—` |
| 4825 | `ESG reporting` | Từ/token '['esg']' chưa có trong từ điển chuẩn | `—` |
| 4826 | `ESG strategy` | Từ/token '['esg']' chưa có trong từ điển chuẩn | `—` |
| 4828 | `esports` | Từ/token '['esports']' chưa có trong từ điển chuẩn | `exports, esprits, escorts` |
| 4829 | `esports event` | Từ/token '['esports']' chưa có trong từ điển chuẩn | `—` |
| 4830 | `esports player` | Từ/token '['esports']' chưa có trong từ điển chuẩn | `—` |
| 4831 | `esports team` | Từ/token '['esports']' chưa có trong từ điển chuẩn | `—` |
| 4969 | `expat employee` | Từ/token '['expat']' chưa có trong từ điển chuẩn | `—` |
| 5037 | `extranet` | Từ/token '['extranet']' chưa có trong từ điển chuẩn | `extraneity, extant, extravert` |
| 5044 | `EXW` | Từ/token '['exw']' chưa có trong từ điển chuẩn | `ex, ew, expwy` |
| 5055 | `Facebook` | Từ/token '['facebook']' chưa có trong từ điển chuẩn | `facebow, facework` |
| 5103 | `failover` | Từ/token '['failover']' chưa có trong từ điển chuẩn | `frailer, flyover, frailero` |
| 5104 | `failover system` | Từ/token '['failover']' chưa có trong từ điển chuẩn | `—` |

## 🔤 4. Chi Tiết Lỗi Chính Tả, Lỗi Font Chữ & Thiếu Ký Tự Đã Phát Hiện
> Dưới đây là bảng tổng hợp các lỗi chính tả, lỗi mất dấu/mã hóa font ký tự tiếng Pháp (`é` -> `茅`), các trường bị thiếu dữ liệu và các lỗi gán nhãn được phát hiện trong file gốc:

| Dòng | Từ Gốc Trong File | Phân Loại Lỗi | Mô Tả Chi Tiết Lỗi | Trạng Thái & Giá Trị Đã Chuẩn Hóa |
|---|---|---|---|---|
| 1664 | `caf茅` | 🔤 Lỗi font / Ký tự | Mất ký tự `é`, lỗi mã hóa thành `茅` | Đã sửa thành `café` |
| 4722 | `entr茅e` | 🔤 Lỗi font & Thiếu dữ liệu | Mất ký tự `é` và để trống toàn bộ nghĩa/phiên âm/ví dụ | Đã sửa thành `entrée`, bổ sung nghĩa `món chính` & phiên âm `/ˈɒntreɪ/` |
| 12121 | `ros茅` | 🔤 Lỗi font / Ký tự | Mất ký tự `é`, lỗi mã hóa thành `茅` | Đã sửa thành `rosé` |
| 12404 | `saut茅ed` | 🔤 Lỗi font / Ký tự | Mất ký tự `é`, lỗi mã hóa thành `茅` | Đã sửa thành `sautéed` |
| 5214 | `film` | 🏷️ Lỗi gán nhãn | Giá trị `difficulty` ghi `elementary` ngoài quy chuẩn | Đã chuẩn hóa thành `easy` |
| 8666 | `music group` | 🏷️ Lỗi gán nhãn | Giá trị `difficulty` ghi `elementary` ngoài quy chuẩn | Đã chuẩn hóa thành `easy` |
| 8681 | `musical instrument` | 🏷️ Lỗi gán nhãn | Giá trị `difficulty` ghi `elementary` ngoài quy chuẩn | Đã chuẩn hóa thành `easy` |
| 13348 | `star` | 🏷️ Lỗi gán nhãn | Giá trị `difficulty` ghi `elementary` ngoài quy chuẩn | Đã chuẩn hóa thành `easy` |
| 14292 | `ticket office` | 🏷️ Lỗi gán nhãn | Giá trị `difficulty` ghi `elementary` ngoài quy chuẩn | Đã chuẩn hóa thành `easy` |
| 14429 | `track` | 🏷️ Lỗi gán nhãn | Giá trị `difficulty` ghi `elementary` ngoài quy chuẩn | Đã chuẩn hóa thành `easy` |
| 275 | `advocate` | 🔊 Lỗi định dạng IPA | Phiên âm gộp 2 loại từ `(verb), (noun)` vào chung một chuỗi | `/ˈædvəkeɪt/ (verb), /ˈædvəkət/ (noun)` |
| 279 | `affiliate` | 🔊 Lỗi định dạng IPA | Phiên âm gộp 2 loại từ `(noun), (verb)` vào chung một chuỗi | `/əˈfɪliət/ (noun), /əˈfɪlieɪt/ (verb)` |
| 401 | `alternate` | 🔊 Lỗi định dạng IPA | Phiên âm gộp 2 loại từ `(adj/noun), (verb)` vào chung một chuỗi | `/ˈɔːltərnət/ (adj/noun), /ˈɔːltərneɪt/ (verb)` |
| 728 | `attribute` | 🔊 Lỗi định dạng IPA | Phiên âm gộp 2 loại từ `(noun), (verb)` vào chung một chuỗi | `/ˈætrɪbjuːt/ (noun), /əˈtrɪbjuːt/ (verb)` |
| 2632 | `conduct` | 🔊 Lỗi định dạng IPA | Phiên âm gộp 2 loại từ `(v); (n)` chứa ký tự phân cách `;` | `/kənˈdʌkt/ (v); /ˈkɒndʌkt/ (n)` |

## 💡 5. Hướng Dẫn Sử Dụng Bộ Dữ Liệu
- Tệp dữ liệu sạch chuẩn 100%: [`csv/VOCABULARY_CLEANED.csv`](./VOCABULARY_CLEANED.csv)
- Chạy kiểm tra lại bất kỳ lúc nào bằng lệnh: `python csv/check_vocabulary.py`
