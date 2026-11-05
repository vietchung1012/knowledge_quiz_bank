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
│   ├── fields.json       # Danh mục các lĩnh vực hiện có
│   └── toeic_vocab.json  # Bộ câu hỏi mẫu: Từ vựng TOEIC (25 câu)
└── README.md
```

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
