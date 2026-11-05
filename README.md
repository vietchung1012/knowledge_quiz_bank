# Knowledge Quiz Bank

Ngân hàng bài tập trắc nghiệm kiểm tra kiến thức, dạng web tĩnh (không cần server/database). Mỗi **lĩnh vực** là một thư mục riêng ở gốc repo (hiện có `English/`), để dễ bổ sung thêm lĩnh vực mới (Lịch sử, Khoa học...) sau này mà không ảnh hưởng lĩnh vực đã có.

🔗 Demo (sau khi bật GitHub Pages): `https://vietchung1012.github.io/knowledge_quiz_bank/`

## Cấu trúc thư mục

```
knowledge_quiz_bank/
├── index.html                      # Trang chủ — danh sách LĨNH VỰC để chọn
├── css/
│   └── style.css                    # Giao diện chung, dùng cho mọi trang (gốc + trong từng lĩnh vực)
├── js/
│   └── home.js                      # Logic trang chủ: đọc data/categories.json
├── data/
│   └── categories.json              # Danh mục lĩnh vực hiện có (vd English) — trang chủ đọc file này
│
├── English/                         # Lĩnh vực: Tiếng Anh
│   ├── index.html                    # Mục lục lĩnh vực: Luyện viết + danh sách bài trắc nghiệm
│   ├── quiz.html                      # Trang làm bài trắc nghiệm
│   ├── writing.html                   # Luyện viết đoạn văn hàng ngày
│   ├── js/
│   │   ├── index.js                    # Logic mục lục lĩnh vực: đọc data/fields.json
│   │   ├── quiz.js                     # Logic làm bài, chấm điểm
│   │   └── writing.js                  # Logic chọn từ theo ngày, lưu bài viết, tính streak, gợi ý câu mẫu
│   └── data/
│       ├── fields.json                 # Danh mục bài trắc nghiệm trong lĩnh vực này
│       ├── toeic_vocab.json            # Bộ câu hỏi mẫu: Từ vựng TOEIC (25 câu)
│       └── word-banks/
│           ├── oxford_3000.json          # Kho dữ liệu thô: 3396 từ vựng (word/type/phiên âm/nghĩa)
│           └── example_sentences.json    # Câu mẫu (EN + dịch VN) cho 335 từ của 60 ngày đầu
│
└── README.md
```

⚠️ Repo đã được tái cấu trúc (trước đây `quiz.html`/`writing.html`/dữ liệu nằm thẳng ở gốc) — các đường link cũ ở gốc (`quiz.html`, `writing.html`...) **không còn hoạt động**, đã chuyển hết sang trong `English/`.

## Cách hoạt động (điều hướng)

1. `index.html` (gốc) đọc `data/categories.json`, hiển thị danh sách lĩnh vực dạng thẻ.
2. Chọn một lĩnh vực (vd "Tiếng Anh") sẽ chuyển sang trang mục lục của lĩnh vực đó, ví dụ `English/index.html`.
3. Trang mục lục của lĩnh vực hiển thị các tính năng/bài trong lĩnh vực đó — hiện tại gồm **Luyện viết đoạn văn** (link tĩnh) và **danh sách bài trắc nghiệm** (đọc từ `English/data/fields.json`, hiển thị dạng thẻ).
4. Chọn một bài trắc nghiệm sẽ chuyển sang `English/quiz.html?field=<id>` — `quiz.js` đọc đúng bộ câu hỏi tương ứng, xáo thứ tự, cho làm từng câu, chấm điểm, hiện kết quả + ôn lại câu sai.
5. Kết quả mỗi lần làm, và bài viết hàng ngày, được lưu tạm vào `localStorage` của trình duyệt (không có backend, không cần tài khoản).

## Luyện viết đoạn văn hàng ngày (`English/writing.html`)

Mỗi ngày hệ thống chọn cố định **6 từ** từ kho `oxford_3000.json` (2 danh từ + 2 động từ + 2 tính từ), dùng seed xác định theo ngày (`YYYY-MM-DD`) — mở lại trong cùng ngày luôn thấy đúng 6 từ đó, sang ngày mới (theo giờ máy người dùng) tự đổi bộ từ khác. Không dùng AI để chấm bài — chỉ kiểm tra cơ học (so khớp văn bản) xem đoạn văn đã chứa đủ 6 từ yêu cầu chưa trước khi cho lưu.

- Lọc bỏ các từ chức năng (đại từ, từ để) khỏi kho danh từ — PDF nguồn đôi khi gắn nhãn "n" cho cả những từ như "he", "it", "this" lẫn với nhãn "pron"/"det"; đã lọc để kho danh từ chỉ còn từ vựng thực chất.
- Bài viết lưu vào `localStorage` theo từng ngày (key `writing_history`), có thể sửa lại bài của ngày hôm nay, xem lịch sử các ngày trước.
- Streak (số ngày viết liên tục) tính dựa trên các ngày có bài đã lưu, hiển thị dạng "🔥 N ngày viết liên tục".
- **Giới hạn đã biết:** kiểm tra "đủ từ" chỉ là so khớp chuỗi con (không phân biệt hoa thường), không xử lý biến thể bất quy tắc (vd từ "go" sẽ không được tính nếu bạn viết "went"). Đây là đánh đổi để giữ 100% cơ học, không cần AI/API.

### Câu mẫu tham khảo ("Xem gợi ý")

Mỗi từ (trong số 6 từ mỗi ngày) có thêm nút **"Xem gợi ý"** — bấm vào mới hiện một câu ví dụ tiếng Anh + dịch tiếng Việt cho riêng từ đó, mặc định ẩn để không làm giảm giá trị tự luyện trước.

- Dữ liệu câu mẫu nằm ở `English/data/word-banks/example_sentences.json`, do Claude **soạn trực tiếp** (không trích dẫn/lấy từ nguồn khác), không phải sinh tự động hàng loạt.
- **Chỉ phủ 335 từ** — đúng tập từ duy nhất sẽ xuất hiện trong 60 ngày đầu của vòng xoay (tính từ 2026-11-05), để tránh rủi ro soạn hàng nghìn câu bằng AI mà không kiểm được từng câu. Sẽ mở rộng phạm vi dần theo thời gian.
- Nếu từ của ngày đó chưa có trong 335 từ này (ví dụ sau ngày 60, hoặc vòng xoay ra từ mới), ô từ đó hiện dòng chữ nhỏ "Chưa có câu mẫu cho từ này" thay cho nút — không tự sinh câu để lấp chỗ trống.

## Kho dữ liệu từ vựng thô: `English/data/word-banks/oxford_3000.json`

Trích xuất từ file nguồn `source/english/words/3000.pdf` ("Oxford 3000 – Từ vựng tiếng Anh thông dụng nhất", nguồn: effortlessenglishclub.edu.vn) bằng **script tự động** (không phải AI tự soạn nội dung) — mỗi mục gồm `no` (số thứ tự gốc trong PDF), `word`, `type`, `pronunciation`, `meaning`.

Giới hạn đã biết (ghi rõ trong field `notes` của chính file JSON):
- Tổng 3396 mục (nhiều hơn 3000 vì PDF gốc đánh số luôn cả một số cụm từ/thành ngữ, không chỉ từ đơn)
- ~19% số mục có `pronunciation` để trống — do PDF gốc ghi phiên âm bằng chữ thường (không dùng ký hiệu IPA) nên script không tách được khỏi `meaning`; dữ liệu không mất, chỉ còn dính ở đầu chuỗi `meaning`
- 47 mục là cụm từ/thành ngữ được chuẩn hoá thủ công (không có nhãn loại từ trong PDF gốc)

⚠️ **Lưu ý về bản quyền:** file PDF nguồn do effortlessenglishclub.edu.vn biên soạn/trình bày — tôi chưa đưa file PDF gốc vào repo (chỉ đưa dữ liệu đã trích xuất dạng JSON) để tránh rủi ro phát tán lại nguyên bản tài liệu của bên thứ ba. Chung nên cân nhắc việc này nếu định công khai repo rộng rãi.

## Cách thêm một lĩnh vực mới (vd Lịch sử, Khoa học...)

1. Tạo thư mục mới ở gốc, vd `History/`, với cấu trúc tương tự `English/` (`index.html`, `js/index.js`, `data/fields.json`, các bộ câu hỏi riêng).
2. Thêm một mục vào `data/categories.json` (ở gốc):

```json
{
  "id": "history",
  "title": "Lịch sử",
  "icon": "📜",
  "description": "Mô tả ngắn",
  "path": "History/index.html"
}
```

Trang chủ sẽ tự động hiển thị lĩnh vực mới — không cần sửa code HTML/CSS/JS ở gốc.

## Cách thêm một bài trắc nghiệm mới trong một lĩnh vực đã có (vd thêm vào English/)

1. Tạo file `English/data/<ten_bai>.json` theo đúng cấu trúc của `toeic_vocab.json`:

```json
{
  "id": "ten_bai",
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

2. Thêm một mục mới vào `English/data/fields.json`:

```json
{
  "id": "ten_bai",
  "title": "Tên hiển thị",
  "description": "Mô tả ngắn",
  "file": "data/ten_bai.json",
  "icon": "🧪",
  "color": "#3b82f6",
  "questionCount": 20
}
```

Trang mục lục `English/index.html` sẽ tự động hiển thị bài mới — không cần sửa code.

## Trạng thái hiện tại

- [x] Khung giao diện web tĩnh (trang chủ theo lĩnh vực → mục lục lĩnh vực → bài cụ thể)
- [x] Lĩnh vực Tiếng Anh: 1 bài trắc nghiệm mẫu (Từ vựng TOEIC, 25 câu, do Claude soạn — **cần Chung rà soát lại nội dung trước khi dùng chính thức**) + luyện viết đoạn văn hàng ngày + gợi ý câu mẫu (335/3396 từ)
- [ ] Rà soát/chỉnh sửa nội dung câu hỏi TOEIC
- [ ] Soạn thêm câu mẫu cho các từ ngoài 60 ngày đầu
- [ ] Bổ sung thêm các lĩnh vực khác (ngoài Tiếng Anh)
- [ ] Bật GitHub Pages để có link demo public
- [ ] Cân nhắc thêm dạng câu hỏi khác (điền từ, đúng/sai...) nếu cần
