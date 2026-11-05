// Trang chủ: tải danh sách LĨNH VỰC từ data/categories.json và hiển thị dạng thẻ chọn.
// Mỗi lĩnh vực là 1 thư mục riêng (vd English/) có trang mục lục con của nó.

async function loadCategories() {
  const grid = document.getElementById("field-grid");
  try {
    const res = await fetch("data/categories.json");
    if (!res.ok) throw new Error("Không tải được danh sách lĩnh vực.");
    const categories = await res.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      grid.innerHTML = '<p class="loading">Chưa có lĩnh vực nào. Quay lại sau nhé!</p>';
      return;
    }

    grid.innerHTML = categories
      .map(
        (cat) => `
        <a class="field-card" href="${cat.path}">
          <span class="field-icon">${cat.icon || "📂"}</span>
          <h3>${cat.title}</h3>
          <p>${cat.description || ""}</p>
        </a>`
      )
      .join("");
  } catch (err) {
    grid.innerHTML = `<p class="error-text">Có lỗi khi tải dữ liệu: ${err.message}</p>`;
  }
}

loadCategories();
