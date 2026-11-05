// Dùng chung cho trang chủ và trang mục lục từng lĩnh vực: gộp
// <dataDir>/features.json (tính năng tĩnh, vd Luyện viết) và <dataDir>/fields.json
// (bài trắc nghiệm) thành 1 danh sách thống nhất để hiển thị dạng "danh sách gọn".
//
// Mỗi mục trả về có dạng: { id, title, description, href, meta }
// - href của mục trắc nghiệm luôn là "quiz.html?field=<id>" (quy ước cố định, không
//   lưu trong fields.json vì bản thân fields.json còn dùng cho quiz.js).
// - Nếu một lĩnh vực chưa có features.json hoặc fields.json thì bỏ qua êm, không báo lỗi
//   (lĩnh vực mới thêm sau này có thể chỉ có 1 trong 2 file).

async function loadCatalogItems(dataDir) {
  const items = [];

  try {
    const res = await fetch(`${dataDir}/features.json`);
    if (res.ok) {
      const features = await res.json();
      for (const f of features) {
        items.push({
          id: f.id,
          title: f.title,
          description: f.description || "",
          href: f.href,
          meta: f.meta || "",
        });
      }
    }
  } catch (err) {
    // Không có features.json cho lĩnh vực này — bỏ qua.
  }

  try {
    const res = await fetch(`${dataDir}/fields.json`);
    if (res.ok) {
      const fields = await res.json();
      for (const f of fields) {
        items.push({
          id: f.id,
          title: f.title,
          description: f.description || "",
          href: `quiz.html?field=${encodeURIComponent(f.id)}`,
          meta: f.questionCount ? `${f.questionCount} câu hỏi` : "",
        });
      }
    }
  } catch (err) {
    // Không có fields.json cho lĩnh vực này — bỏ qua.
  }

  return items;
}
