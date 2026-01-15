let index = 0;
let score = 0;
let quiz;
let timer;
let timeLeft = 10;
let userAnswers = [];
let selectedIndex = null;

async function loadQuiz() {
  const quizId = sessionStorage.getItem("quizId");

  if (!quizId) {
    alert("Invalid quiz access");
    location.href = "play.html";
    return;
  }

  const res = await fetch(`https://popquizzer-crud-backend.onrender.com/quizzes/${quizId}`);
  quiz = await res.json();
  showQuestion();
}

function showQuestion() {
  clearInterval(timer);
  timeLeft = 10;
  selectedIndex = null;

  const nextBtn = document.getElementById("nextBtn");
  nextBtn.disabled = true;

  if (index >= quiz.questions.length) {
    sessionStorage.setItem("score", score);
    sessionStorage.setItem("answers", JSON.stringify(userAnswers));
    location.href = "result.html";
    return;
  }

  document.getElementById("subject").innerText = `${quiz.subject} Quiz`;

  document.getElementById("progress").innerText = `Question ${index + 1} of ${
    quiz.questions.length
  }`;

  document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;

  const basePercent = (index / quiz.questions.length) * 100;

  document.getElementById("progressFill").style.width = `${basePercent}%`;

  if (index === quiz.questions.length - 1) {
    nextBtn.innerText = "Submit";
  } else {
    nextBtn.innerText = "Next";
  }

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      nextQuestion();
    }
  }, 1000);

  const q = quiz.questions[index];
  document.getElementById("question").innerText = q.question;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "option";
    div.innerText = opt;

    div.onclick = () => {
      document
        .querySelectorAll(".option")
        .forEach((o) => o.classList.remove("selected"));

      div.classList.add("selected");
      selectedIndex = i;
      nextBtn.disabled = false;

      const percent = ((index + 1) / quiz.questions.length) * 100;

      document.getElementById("progressFill").style.width = `${percent}%`;
    };

    optionsDiv.appendChild(div);
  });
}

document.getElementById("nextBtn").onclick = nextQuestion;

function nextQuestion() {
  clearInterval(timer);

  userAnswers.push(selectedIndex);

  if (
    selectedIndex !== null &&
    selectedIndex === quiz.questions[index].answer
  ) {
    score += 10;
  }

  index++;
  showQuestion();
}

loadQuiz();
