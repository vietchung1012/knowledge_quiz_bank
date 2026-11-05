# Knowledge Quiz Bank

Ngân hàng bài tập trắc nghiệm kiểm tra kiến thức, dạng web tĩnh (không cần server/database). Bản v1 bắt đầu với lĩnh vực **Từ vựng TOEIC**, thiết kế để dễ dàng bổ sung thêm lĩnh vực mới sau này.

🔗 Demo (sau khi bật GitHub Pages): `https://vietchung1012.github.io/knowledge_quiz_bank/`

## Cấu trúc thư mục

```
knowledge_quiz_bank/
├── index.html          # Trang chủ — danh sách các lĩnh vực để chọn
├── quiz.html            # Trang làm bài trắc nghiệm
├── css/
│   └── style.css        # Giao diện chung
├── js/
│   ├── home.js           # Logic trang chủ
│   └── quiz.js           # Logic làm bài, chấm điểm
├── data/
│   ├── fields.json       # Danh mục các lĩnh vực hiện có (dùng cho quiz)
│   ├── toeic_vocab.json  # Bộ câu hỏi mẫu: Từ vựng TOEIC (25 câu)
│   └── word-banks/
│       └── oxford_3000.json  # Kho dữ liệu thô: 3396 từ vựng (word/type/phiên âm/nghĩa)
└── README.md
```

## Kho dữ liệu từ vựng thô: `data/word-banks/oxford_3000.json`

Trích xuất từ file nguồn `source/english/words/3000.pdf` ("Oxford 3000 – Từ vựng tiếng Anh thông dụng nhất", nguồn: effortlessenglishclub.edu.vn) bằng **script tự động** (không phải AI tự soạn nội dung) — mỗi mục gồm `no` (số thứ tự gốc trong PDF), `word`, `type`, `pronunciation`, `meaning`.

**Đây là kho dữ liệu từ điển thô, CHƯA phải câu hỏi quiz** — chưa được nối vào `index.html`/`quiz.html`. Cần một bước xử lý riêng (sinh câu hỏi trắc nghiệm tự động từ kho này) trước khi hiển thị cho người dùng — bước đó **chưa làm**, cần thống nhất cách làm trước.

Giới hạn đã biết (ghi rõ trong field `notes` của chính file JSON):
- Tổng 3396 mục (nhiều hơn 3000 vì PDF gốc đánh số luôn cả một số cụm từ/thành ngữ, không chỉ từ đơn)
- ~19% số mục có `pronunciation` để trống — do PDF gốc ghi phiên âm bằng chữ thường (không dùng ký hiệu IPA) nên script không tách được khỏi `meaning`; dữ liệu không mất, chỉ còn dính ở đầu chuỗi `meaning`
- 47 mục là cụm từ/thành ngữ được chuẩn hoá thủ công (không có nhãn loại từ trong PDF gốc)

⚠️ **Lưu ý về bản quyền:** file PDF nguồn do effortlessenglishclub.edu.vn biên soạn/trình bày — tôi chưa đưa file PDF gốc vào repo (chỉ đưa dữ liệu đã trích xuất dạng JSON) để tránh rủi ro phát tán lại nguyên bản tài liệu của bên thứ ba. Chung nên cân nhắc việc này nếu định công khai repo rộng rãi.

## Cách hoạt động

1. `index.html` đọc `data/fields.json` để hiển thị danh sách lĩnh vực dạng thẻ.
2. Chọn một lĩnh vực sẽ chuyển sang `quiz.html?field=<id>`.
3. `quiz.js` đọc đúng bộ câu hỏi tương ứng (file JSON được khai báo trong `fields.json`), xáo thứ tự câu hỏi, cho làm từng câu một, chấm điểm và hiện kết quả + ôn lại các câu sai ở cuối bài.
4. Kết quả mỗi lần làm được lưu tạm vào `localStorage` của trình duyệt (không có backend, không cần tài khoản).

## Cách thêm một lĩnh vực mới

1. Tạo file `data/<ten_linh_vuc>.json` theo đúng cấu trúc của `toeic_vocab.json`:

```json
{
  "id": "ten_linh_vuc",
  "title": "Tên hiển thị",
  "description": "Mô tả ngắn",
  "questions": [
    {
      "id": "q001",
      "question": "Nội dung câu hỏi",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "answer": 0,
      "explanation": "Giải thích vì sao đáp án đó đúng (tuỳ chọn)"
    }
  ]
}
```

- `answer` là **chỉ số (index)** của đáp án đúng trong mảng `options`, bắt đầu từ `0`.

2. Thêm một mục mới vào `data/fields.json`:

```json
{
  "id": "ten_linh_vuc",
  "title": "Tên hiển thị",
  "description": "Mô tả ngắn",
  "file": "data/ten_linh_vuc.json",
  "icon": "🧪",
  "color": "#3b82f6",
  "questionCount": 20
}
```

Không cần sửa code HTML/CSS/JS — trang chủ sẽ tự động hiển thị lĩnh vực mới.

## Trạng thái hiện tại (v1)

- [x] Khung giao diện web tĩnh (trang chủ + trang làm bài)
- [x] 1 lĩnh vực mẫu: Từ vựng TOEIC (25 câu, do Claude soạn — **cần Chung rà soát lại nội dung trước khi dùng chính thức**)
- [ ] Rà soát/chỉnh sửa nội dung câu hỏi TOEIC
- [ ] Bổ sung thêm các lĩnh vực khác
- [ ] Bật GitHub Pages để có link demo public
- [ ] Cân nhắc thêm dạng câu hỏi khác (điền từ, đúng/sai...) nếu cần
