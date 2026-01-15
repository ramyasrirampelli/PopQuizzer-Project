let questions = [];
let existingQuizId = null;
let editIndex = null;
let activeSubject = null;
const explanationInput = document.getElementById("explanation");

const subjectSelect = document.getElementById("subjectSelect");
const newSubjectInput = document.getElementById("newSubjectInput");
const questionInput = document.getElementById("question");
const optionInputs = document.querySelectorAll(".option");
const correctSelect = document.getElementById("correct");
const addBtn = document.getElementById("addQuestion");
const saveBtn = document.getElementById("saveQuiz");
const listEl = document.getElementById("questionsList");

document.addEventListener("DOMContentLoaded", loadSubjects);

async function loadSubjects() {
  // const res = await fetch("http://localhost:3000/quizzes");
    const res = await fetch("https://popquizzer-crud-backend.onrender.com/quizzes");

  const quizzes = await res.json();

  quizzes.forEach((q) => {
    const opt = document.createElement("option");
    opt.value = q.subject;
    opt.textContent = q.subject;
    subjectSelect.appendChild(opt);
  });
}

subjectSelect.addEventListener("change", () => {
  const value = subjectSelect.value;

  if (value === "__new__") {
    activeSubject = null;
    existingQuizId = null;
    questions = [];
    renderQuestions();

    newSubjectInput.value = "";
    newSubjectInput.style.display = "block";
    newSubjectInput.focus();
    return;
  }

  if (value) {
    newSubjectInput.style.display = "none";
    activeSubject = value;
    loadExistingQuiz(value);
  }
});

newSubjectInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const subject = newSubjectInput.value.trim().toUpperCase();
  if (!subject) return;

  activeSubject = subject;
  existingQuizId = null;
  questions = [];
  renderQuestions();

  newSubjectInput.style.display = "none";
});
function ensureActiveSubject() {
  if (activeSubject) return true;

  if (
    newSubjectInput.style.display !== "none" &&
    newSubjectInput.value.trim()
  ) {
    activeSubject = newSubjectInput.value.trim().toUpperCase();
    existingQuizId = null;
    return true;
  }

  return false;
}

addBtn.addEventListener("click", () => {
  if (!ensureActiveSubject()) {
    alert("Select or create a subject first");
    return;
  }

  const question = questionInput.value.trim();
  const options = [...optionInputs].map((o) => o.value.trim());
  const answer = Number(correctSelect.value);

  if (!question || options.includes("") || isNaN(answer)) {
    alert("Fill all fields");
    return;
  }

  const explanation = explanationInput.value.trim();

  const data = {
    question,
    options,
    answer,
    explanation,
  };

  if (editIndex !== null) {
    questions[editIndex] = data;
    editIndex = null;
    addBtn.innerText = "Add Question";
  } else {
    questions.push(data);
  }

  renderQuestions();
  clearInputs();
});

function renderQuestions() {
  listEl.innerHTML = "";

  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "preview";

    const optionsHtml = q.options
      .map(
        (opt, idx) => `
      <div class="option-item ${idx === q.answer ? "correct" : ""}">
        ${idx + 1}. ${opt} ${idx === q.answer}
      </div>
    `
      )
      .join("");

    div.innerHTML = `
      <div class="q-header">
        <span class="q-badge">Q${i + 1}</span>
        <span class="q-text">${q.question}</span>
      </div>

      <div class="options-list">${optionsHtml}</div>
${
  q.explanation
    ? `
  <div class="explanation-box">
    <strong>Explanation:</strong> ${q.explanation}
  </div>
`
    : ""
}

      <div class="actions-row">
        <button class="edit-btn" data-index="${i}">Edit</button>
        <button class="delete-btn" data-index="${i}">Delete</button>
      </div>
    `;

    listEl.appendChild(div);
  });

  attachEditDeleteEvents();
}

function attachEditDeleteEvents() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = () => loadQuestionForEdit(Number(btn.dataset.index));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = () => deleteQuestion(Number(btn.dataset.index));
  });
}

function loadQuestionForEdit(index) {
  const q = questions[index];

  questionInput.value = q.question;
  optionInputs.forEach((opt, i) => (opt.value = q.options[i]));
  correctSelect.value = q.answer;
  explanationInput.value = q.explanation || "";

  editIndex = index;
  addBtn.innerText = "Update Question";
}

async function deleteQuestion(index) {
  if (!confirm("Delete this question permanently?")) return;

  questions.splice(index, 1);
  renderQuestions();

  if (existingQuizId) {
    await fetch(`https://popquizzer-crud-backend.onrender.com/quizzes/${existingQuizId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });
  }
}

async function loadExistingQuiz(subject) {
  const res = await fetch("https://popquizzer-crud-backend.onrender.com/quizzes");
  const quizzes = await res.json();

  const found = quizzes.find((q) => q.subject === subject);

  if (found) {
    existingQuizId = found.id;
    questions = [...found.questions];
  } else {
    existingQuizId = null;
    questions = [];
  }

  renderQuestions();
}

saveBtn.addEventListener("click", async () => {
  if (!ensureActiveSubject() || questions.length === 0) {
    alert("Subject and questions required");
    return;
  }

  const quiz = { subject: activeSubject, questions };

  await fetch(
    existingQuizId
      ? `https://popquizzer-crud-backend.onrender.com/quizzes/${existingQuizId}`
      : "https://popquizzer-crud-backend.onrender.com/quizzes",
    {
      method: existingQuizId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        existingQuizId ? { id: existingQuizId, ...quiz } : quiz
      ),
    }
  );

  alert("Quiz saved successfully!");
});

function clearInputs() {
  questionInput.value = "";
  optionInputs.forEach((o) => (o.value = ""));
  correctSelect.value = "";
  explanationInput.value = "";
  editIndex = null;
  addBtn.innerText = "Add Question";
}
