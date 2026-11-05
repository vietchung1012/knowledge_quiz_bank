// Trang chủ: với mỗi lĩnh vực trong data/categories.json, tải danh sách bài
// (qua loadCatalogItems — xem js/catalog.js) và hiển thị dạng danh sách gọn,
// nhóm theo lĩnh vực. Có tìm kiếm trực tiếp trên thanh nav, lọc theo tên/mô tả bài.

async function renderHome() {
  const root = document.getElementById("catalog-root");
  let categories;
  try {
    const res = await fetch("data/categories.json");
    if (!res.ok) throw new Error("Không tải được danh sách lĩnh vực.");
    categories = await res.json();
  } catch (err) {
    root.innerHTML = `<p class="error-text">Có lỗi khi tải dữ liệu: ${err.message}</p>`;
    return;
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    root.innerHTML = '<p class="loading">Chưa có lĩnh vực nào. Quay lại sau nhé!</p>';
    return;
  }

  const sectionsHtml = await Promise.all(
    categories.map(async (cat) => {
      const items = await loadCatalogItems(cat.dataDir);
      return renderCatalogSection(cat, items);
    })
  );

  root.innerHTML = sectionsHtml.join("") + `<p id="catalog-no-results" class="catalog-empty hidden">Không tìm thấy bài nào khớp với từ khoá bạn gõ.</p>`;

  attachSearch();
}

function renderCatalogSection(cat, items) {
  const itemsHtml = items.length
    ? items
        .map(
          (item) => `
        <div class="catalog-item" data-search="${escapeHtml((item.title + " " + item.description).toLowerCase())}">
          <a class="catalog-item-title" href="${cat.baseDir}${item.href}">${escapeHtml(item.title)}</a>
          <p class="catalog-item-desc">${escapeHtml(item.description)}</p>
          ${item.meta ? `<span class="catalog-item-meta">${escapeHtml(item.meta)}</span>` : ""}
        </div>`
        )
        .join("")
    : `<p class="catalog-empty">Chưa có bài nào trong lĩnh vực này.</p>`;

  return `
    <section class="catalog-section" id="${cat.id}">
      <h2 class="catalog-heading"><span class="catalog-heading-icon">${cat.icon || "📂"}</span>${escapeHtml(cat.title)}</h2>
      <p class="catalog-description">${escapeHtml(cat.description || "")}</p>
      <div class="catalog-grid">${itemsHtml}</div>
    </section>`;
}

function attachSearch() {
  const input = document.getElementById("nav-search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const sections = document.querySelectorAll(".catalog-section");
    let anyVisible = false;

    sections.forEach((section) => {
      const items = section.querySelectorAll(".catalog-item");
      let sectionHasVisible = false;

      items.forEach((item) => {
        const matches = !query || (item.dataset.search || "").includes(query);
        item.classList.toggle("is-hidden", !matches);
        if (matches) sectionHasVisible = true;
      });

      section.classList.toggle("is-hidden", items.length > 0 && !sectionHasVisible);
      if (sectionHasVisible || items.length === 0) anyVisible = true;
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

renderHome();
