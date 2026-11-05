// Dùng chung cho mọi trang: dựng thanh nav (tab lĩnh vực) từ data/categories.json,
// và xử lý phần UI của ô tìm kiếm (mở/đóng) nếu trang đó có ô tìm kiếm.
// Lọc nội dung theo từ khoá là việc riêng của từng trang (home.js / index.js).
//
// Phần tử <nav id="site-nav"> cần có thuộc tính data-base = đường dẫn tương đối
// về thư mục gốc repo (vd "" ở trang gốc, "../" ở trang trong English/).

async function initNavbar() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;

  const base = nav.dataset.base || "";
  const tabsWrap = document.getElementById("nav-tabs");

  if (tabsWrap) {
    try {
      const res = await fetch(`${base}data/categories.json`);
      if (res.ok) {
        const categories = await res.json();
        const currentPath = window.location.pathname;

        tabsWrap.innerHTML = categories
          .map((cat) => {
            const isActive = cat.baseDir && currentPath.includes(`/${cat.baseDir}`);
            return `<a class="nav-tab${isActive ? " active" : ""}" href="${base}${cat.path}">
              <span class="nav-tab-icon">${cat.icon || "📂"}</span>${cat.title}
            </a>`;
          })
          .join("");
      }
    } catch (err) {
      console.warn("Không tải được danh sách lĩnh vực cho thanh nav:", err);
    }
  }

  // Ô tìm kiếm (nếu trang này có) — chỉ xử lý mở/đóng, việc lọc nội dung do trang tự làm.
  const searchWrap = document.getElementById("nav-search");
  const searchToggle = document.getElementById("nav-search-toggle");
  const searchInput = document.getElementById("nav-search-input");

  if (searchWrap && searchToggle && searchInput) {
    searchToggle.addEventListener("click", () => {
      searchWrap.classList.toggle("open");
      if (searchWrap.classList.contains("open")) searchInput.focus();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
        searchWrap.classList.remove("open");
        searchToggle.focus();
      }
    });

    searchInput.addEventListener("blur", () => {
      if (!searchInput.value) searchWrap.classList.remove("open");
    });
  }
}

initNavbar();
