// Trang luyện viết đoạn văn hàng ngày: chọn 6 từ cố định theo ngày từ kho Oxford 3000,
// cho viết đoạn văn, kiểm tra (cơ học, không AI) xem đã dùng đủ từ chưa, lưu lịch sử + tính streak.

const WORD_BANK_URL = "data/word-banks/oxford_3000.json";
const HISTORY_KEY = "writing_history";
const WORDS_PER_CATEGORY = { n: 2, v: 2, adj: 2 };

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateStr, delta) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  const y2 = dt.getFullYear();
  const m2 = String(dt.getMonth() + 1).padStart(2, "0");
  const d2 = String(dt.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

// ---- PRNG xác định theo chuỗi seed (để mỗi ngày luôn ra cùng 1 bộ từ) ----
function hashStringToSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

function mulberry32(seed) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(array, seed) {
  const rng = mulberry32(seed);
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function typeList(typeStr) {
  if (!typeStr) return [];
  return typeStr.split(",").map((t) => t.trim());
}

function hasType(word, code) {
  return typeList(word.type).includes(code);
}

// Một từ được xếp vào kho "n" (danh từ) chỉ khi nó KHÔNG đồng thời là pron/det,
// vì một số từ chức năng (he, it, this, most...) trong nguồn PDF bị gắn nhãn "n" lẫn
// vào type list — để tránh ra đề với toàn từ để/đại từ thay vì từ vựng thực chất.
function buildCategoryPools(words) {
  const pools = { n: [], v: [], adj: [] };
  for (const w of words) {
    if (hasType(w, "n") && !hasType(w, "pron") && !hasType(w, "det")) pools.n.push(w);
    if (hasType(w, "v")) pools.v.push(w);
    if (hasType(w, "adj")) pools.adj.push(w);
  }
  return pools;
}

function pickWordsForDate(pools, dateStr) {
  const picked = [];
  const usedWords = new Set();
  for (const category of Object.keys(WORDS_PER_CATEGORY)) {
    const count = WORDS_PER_CATEGORY[category];
    const seed = hashStringToSeed(dateStr + "|" + category);
    const shuffled = seededShuffle(pools[category], seed);
    let taken = 0;
    for (const w of shuffled) {
      if (usedWords.has(w.word)) continue;
      picked.push(w);
      usedWords.add(w.word);
      taken++;
      if (taken >= count) break;
    }
  }
  return picked;
}

// ---- localStorage: lịch sử bài viết ----
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch (err) {
    console.warn("Không đọc được lịch sử bài viết:", err);
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn("Không lưu được lịch sử bài viết:", err);
  }
}

function upsertEntry(history, entry) {
  const idx = history.findIndex((e) => e.date === entry.date);
  if (idx >= 0) history[idx] = entry;
  else history.push(entry);
  history.sort((a, b) => (a.date < b.date ? 1 : -1)); // mới nhất trước
  return history;
}

function calcStreak(history) {
  const dateSet = new Set(history.map((e) => e.date));
  let anchor = todayStr();
  if (!dateSet.has(anchor)) {
    const yesterday = addDays(anchor, -1);
    if (dateSet.has(yesterday)) anchor = yesterday;
    else return 0;
  }
  let streak = 0;
  let cursor = anchor;
  while (dateSet.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// ---- Kiểm tra đủ từ trong đoạn văn (cơ học: substring, không phân biệt hoa thường) ----
function checkWordsUsed(paragraph, words) {
  const lower = paragraph.toLowerCase();
  return words.map((w) => ({
    word: w.word,
    used: lower.includes(w.word.toLowerCase()),
  }));
}

// ---- Render & khởi tạo trang ----
let allWords = [];
let todayWords = [];
let history = [];

async function init() {
  const date = todayStr();
  document.getElementById("today-date").textContent = formatDateVN(date);

  try {
    const res = await fetch(WORD_BANK_URL);
    const data = await res.json();
    allWords = data.words;
  } catch (err) {
    document.getElementById("word-chips").innerHTML =
      `<p class="error-text">Không tải được kho từ vựng: ${err.message}</p>`;
    return;
  }

  const pools = buildCategoryPools(allWords);
  todayWords = pickWordsForDate(pools, date);

  history = loadHistory();
  renderStreak();
  renderWordChips();
  renderExistingEntryIfAny(date);
  renderHistory();

  document.getElementById("paragraph-input").addEventListener("input", onParagraphInput);
  document.getElementById("save-btn").addEventListener("click", onSave);
  onParagraphInput(); // cập nhật trạng thái ban đầu
}

function formatDateVN(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `ngày ${d}/${m}/${y}`;
}

function renderStreak() {
  const streak = calcStreak(history);
  const el = document.getElementById("streak-badge");
  if (streak > 0) {
    el.textContent = `🔥 ${streak} ngày viết liên tục`;
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function renderWordChips() {
  const wrap = document.getElementById("word-chips");
  wrap.innerHTML = todayWords
    .map(
      (w) => `
      <div class="word-chip" data-word="${w.word.toLowerCase()}">
        <span class="chip-check">○</span>
        <span class="chip-word">${w.word}</span>
        <span class="chip-meaning">${w.meaning}</span>
      </div>`
    )
    .join("");
}

function renderExistingEntryIfAny(date) {
  const existing = history.find((e) => e.date === date);
  if (existing) {
    document.getElementById("paragraph-input").value = existing.paragraph;
    document.getElementById("save-note").textContent =
      "Bạn đã lưu bài viết cho hôm nay — có thể chỉnh sửa rồi lưu lại.";
  }
}

function onParagraphInput() {
  const text = document.getElementById("paragraph-input").value;
  const statuses = checkWordsUsed(text, todayWords);

  statuses.forEach((s) => {
    const chip = document.querySelector(`.word-chip[data-word="${s.word.toLowerCase()}"]`);
    if (!chip) return;
    const checkEl = chip.querySelector(".chip-check");
    if (s.used) {
      chip.classList.add("done");
      checkEl.textContent = "✓";
    } else {
      chip.classList.remove("done");
      checkEl.textContent = "○";
    }
  });

  const allUsed = statuses.every((s) => s.used);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById("word-count").textContent = `${wordCount} từ`;

  const saveBtn = document.getElementById("save-btn");
  saveBtn.disabled = !allUsed || wordCount === 0;

  const missing = statuses.filter((s) => !s.used).map((s) => s.word);
  const noteEl = document.getElementById("save-note");
  if (missing.length > 0) {
    noteEl.textContent = `Còn thiếu từ: ${missing.join(", ")}`;
  } else if (wordCount > 0) {
    noteEl.textContent = "Đã dùng đủ 6 từ — có thể lưu bài viết.";
  } else {
    noteEl.textContent = "";
  }
}

function onSave() {
  const date = todayStr();
  const paragraph = document.getElementById("paragraph-input").value.trim();
  if (!paragraph) return;

  const entry = {
    date,
    words: todayWords.map((w) => w.word),
    paragraph,
    savedAt: new Date().toISOString(),
  };
  history = upsertEntry(history, entry);
  saveHistory(history);

  renderStreak();
  renderHistory();
  document.getElementById("save-note").textContent = "✅ Đã lưu bài viết hôm nay!";
}

function renderHistory() {
  const wrap = document.getElementById("history-list");
  if (history.length === 0) {
    wrap.innerHTML = '<p class="loading">Chưa có bài viết nào. Hôm nay là ngày đầu tiên!</p>';
    return;
  }
  wrap.innerHTML = history
    .map(
      (e) => `
      <div class="history-item">
        <div class="history-date">${formatDateVN(e.date)}</div>
        <div class="history-words">${e.words.join(", ")}</div>
        <p class="history-paragraph">${escapeHtml(e.paragraph)}</p>
      </div>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();
