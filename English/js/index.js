// Trang mục lục lĩnh vực Tiếng Anh: tải danh sách bài trắc nghiệm từ data/fields.json
// và hiển thị dạng thẻ chọn (giống logic trang chủ gốc, áp dụng ở cấp English/).

async function loadFields() {
  const grid = document.getElementById("field-grid");
  try {
    const res = await fetch("data/fields.json");
    if (!res.ok) throw new Error("Không tải được danh sách bài trắc nghiệm.");
    const fields = await res.json();

    if (!Array.isArray(fields) || fields.length === 0) {
      grid.innerHTML = '<p class="loading">Chưa có bài trắc nghiệm nào. Quay lại sau nhé!</p>';
      return;
    }

    grid.innerHTML = fields
      .map(
        (field) => `
        <a class="field-card" href="quiz.html?field=${encodeURIComponent(field.id)}">
          <span class="field-icon">${field.icon || "📝"}</span>
          <h3>${field.title}</h3>
          <p>${field.description || ""}</p>
          <span class="field-count">${field.questionCount || "?"} câu hỏi</span>
        </a>`
      )
      .join("");
  } catch (err) {
    grid.innerHTML = `<p class="error-text">Có lỗi khi tải dữ liệu: ${err.message}</p>`;
  }
}

loadFields();
