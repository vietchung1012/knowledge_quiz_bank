// Trang mục lục lĩnh vực Tiếng Anh: gộp features.json + fields.json (qua loadCatalogItems
// — xem js/catalog.js ở gốc) thành 1 danh sách gọn, có tìm kiếm lọc trực tiếp trên thanh nav.

async function renderCatalog() {
  const root = document.getElementById("catalog-root");
  let items;
  try {
    items = await loadCatalogItems("data");
  } catch (err) {
    root.innerHTML = `<p class="error-text">Có lỗi khi tải dữ liệu: ${err.message}</p>`;
    return;
  }

  if (!items.length) {
    root.innerHTML = '<p class="loading">Chưa có bài nào. Quay lại sau nhé!</p>';
    return;
  }

  const itemsHtml = items
    .map(
      (item) => `
      <div class="catalog-item" data-search="${escapeHtml((item.title + " " + item.description).toLowerCase())}">
        <a class="catalog-item-title" href="${item.href}">${escapeHtml(item.title)}</a>
        <p class="catalog-item-desc">${escapeHtml(item.description)}</p>
        ${item.meta ? `<span class="catalog-item-meta">${escapeHtml(item.meta)}</span>` : ""}
      </div>`
    )
    .join("");

  root.innerHTML = `
    <div class="catalog-grid">${itemsHtml}</div>
    <p id="catalog-no-results" class="catalog-empty hidden">Không tìm thấy bài nào khớp với từ khoá bạn gõ.</p>`;

  attachSearch();
}

function attachSearch() {
  const input = document.getElementById("nav-search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const items = document.querySelectorAll(".catalog-item");
    let anyVisible = false;

    items.forEach((item) => {
      const matches = !query || (item.dataset.search || "").includes(query);
      item.classList.toggle("is-hidden", !matches);
      if (matches) anyVisible = true;
    });

    const noResults = document.getElementById("catalog-no-results");
    if (noResults) noResults.classList.toggle("hidden", !query || anyVisible);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

renderCatalog();
