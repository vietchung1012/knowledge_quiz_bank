// Trang làm bài quiz: đọc tham số ?field=, tải câu hỏi tương ứng, chạy luồng làm bài và chấm điểm.

const quizArea = document.getElementById("quiz-area");
const resultArea = document.getElementById("result-area");
const quizTitleEl = document.getElementById("quiz-title");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

const params = new URLSearchParams(window.location.search);
const fieldId = params.get("field");

let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let reviewLog = []; // { question, chosenText, correctText, isCorrect }

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function init() {
  if (!fieldId) {
    quizArea.innerHTML = '<p class="error-text">Thiếu thông tin lĩnh vực. Vui lòng quay lại trang chủ.</p>';
    return;
  }

  try {
    const fieldsRes = await fetch("data/fields.json");
    const fields = await fieldsRes.json();
    const field = fields.find((f) => f.id === fieldId);

    if (!field) {
      quizArea.innerHTML = '<p class="error-text">Không tìm thấy lĩnh vực này.</p>';
      return;
    }

    quizTitleEl.textContent = field.title;

    const dataRes = await fetch(field.file);
    if (!dataRes.ok) throw new Error("Không tải được bộ câu hỏi.");
    const data = await dataRes.json();

    questions = shuffle(data.questions);
    renderQuestion();
  } catch (err) {
    quizArea.innerHTML = `<p class="error-text">Có lỗi khi tải câu hỏi: ${err.message}</p>`;
  }
}

function updateProgress() {
  const percent = Math.round((currentIndex / questions.length) * 100);
  progressFill.style.width = percent + "%";
  progressText.textContent = `Câu ${currentIndex + 1} / ${questions.length}`;
}

function renderQuestion() {
  answered = false;
  updateProgress();

  const q = questions[currentIndex];

  const optionsHtml = q.options
    .map(
      (opt, i) => `<button class="option-btn" data-index="${i}">${opt}</button>`
    )
    .join("");

  quizArea.innerHTML = `
    <div class="question-card">
      <p class="question-text">${q.question}</p>
      <div class="options-list" id="options-list">${optionsHtml}</div>
      <div id="explanation-wrap"></div>
      <div class="next-wrap" id="next-wrap"></div>
    </div>
  `;

  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleAnswer(Number(btn.dataset.index)));
  });
}

function handleAnswer(choiceIndex) {
  if (answered) return;
  answered = true;

  const q = questions[currentIndex];
  const isCorrect = choiceIndex === q.answer;
  if (isCorrect) score++;

  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("correct");
    else if (i === choiceIndex) btn.classList.add("incorrect");
  });

  if (q.explanation) {
    document.getElementById("explanation-wrap").innerHTML =
      `<div class="explanation">${q.explanation}</div>`;
  }

  reviewLog.push({
    question: q.question,
    chosenText: q.options[choiceIndex],
    correctText: q.options[q.answer],
    isCorrect,
  });

  const isLast = currentIndex === questions.length - 1;
  document.getElementById("next-wrap").innerHTML =
    `<button id="next-btn" class="btn btn-primary">${isLast ? "Xem kết quả" : "Câu tiếp theo →"}</button>`;

  document.getElementById("next-btn").addEventListener("click", () => {
    if (isLast) {
      showResult();
    } else {
      currentIndex++;
      renderQuestion();
    }
  });
}

function showResult() {
  currentIndex = questions.length;
  updateProgress();

  quizArea.classList.add("hidden");
  resultArea.classList.remove("hidden");

  const total = questions.length;
  const percent = Math.round((score / total) * 100);

  document.getElementById("result-score").textContent = `${score} / ${total} (${percent}%)`;

  let message = "Cố gắng hơn ở lần sau nhé!";
  if (percent >= 90) message = "Xuất sắc! Vốn từ của bạn rất vững.";
  else if (percent >= 70) message = "Khá tốt! Chỉ còn vài chỗ cần ôn lại.";
  else if (percent >= 50) message = "Tạm ổn, nên ôn lại các từ bị sai bên dưới.";

  document.getElementById("result-message").textContent = message;

  const wrongItems = reviewLog.filter((item) => !item.isCorrect);
  const reviewListEl = document.getElementById("review-list");

  if (wrongItems.length === 0) {
    reviewListEl.innerHTML = '<p class="loading">Bạn trả lời đúng tất cả câu hỏi! 🎉</p>';
  } else {
    reviewListEl.innerHTML =
      "<h3>Các câu trả lời sai:</h3>" +
      wrongItems
        .map(
          (item) => `
          <div class="review-item wrong">
            <strong>${item.question}</strong><br>
            Bạn chọn: ${item.chosenText} — Đáp án đúng: ${item.correctText}
          </div>`
        )
        .join("");
  }

  saveResult(total, score, percent);
}

function saveResult(total, score, percent) {
  try {
    const key = `quiz_history_${fieldId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ date: new Date().toISOString(), score, total, percent });
    // Chỉ giữ 20 lần làm gần nhất để tránh phình dữ liệu.
    const trimmed = existing.slice(-20);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (err) {
    // localStorage có thể bị chặn (chế độ ẩn danh...) — bỏ qua, không chặn trải nghiệm làm bài.
    console.warn("Không lưu được kết quả vào localStorage:", err);
  }
}

document.getElementById("retry-btn")?.addEventListener("click", () => {
  currentIndex = 0;
  score = 0;
  reviewLog = [];
  resultArea.classList.add("hidden");
  quizArea.classList.remove("hidden");
  questions = shuffle(questions);
  renderQuestion();
});

init();
