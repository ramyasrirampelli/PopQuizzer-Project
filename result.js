const user = JSON.parse(sessionStorage.getItem("user"));

const email = user.email;
const name = user.name;

showResult();

async function showResult() {
  const quizId = sessionStorage.getItem("quizId");
  const playerId = sessionStorage.getItem("playerId");
  const userAnswers = JSON.parse(sessionStorage.getItem("answers")) || [];

  if (!quizId) {
    document.body.innerHTML = "<h2>Invalid quiz access</h2>";
    return;
  }
  const quiz = await fetch(
    `https://popquizzer-crud-backend.onrender.com/quizzes/${quizId}`,
  ).then((r) => r.json());
  const subject = quiz.subject;

  let correct = 0;
  quiz.questions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) correct++;
  });

  const total = quiz.questions.length;
  const wrong = total - correct;
  const score = correct * 10;
  const accuracy = Math.round((correct / total) * 100);
  if (accuracy === 100) {
    launchConfetti();
  }

  document.getElementById("scoreText").innerText = `Your Score: ${score}`;

  showCheerMessage(accuracy);

  document.getElementById("stats").innerHTML = `
    <p>Total Questions: ${total}</p>
    <p>Correct Answers: ${correct}</p>
    <p>Wrong Answers: ${wrong}</p>
    <p>Accuracy: ${accuracy}%</p>
  `;

  renderReview(quiz, userAnswers);

  const results = await fetch(
    `https://popquizzer-crud-backend.onrender.com/results?subject=${subject}`,
  ).then((r) => r.json());

  results.sort((a, b) => b.score - a.score);

  const leaderboardEl = document.getElementById("leaderboard");
  leaderboardEl.innerHTML = "";

  const top3 = results.slice(0, 3);
  if (top3.length > 0) {
    const topCard = document.createElement("div");
    topCard.className = "top3-card";

    top3.forEach((entry, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
      const card = document.createElement("div");
      card.className = "top3-item";

      if (playerId && entry.email === email) {
        card.classList.add("current-player");
      }

      card.innerHTML = `
        <div class="medal">${medal}</div>
        <div class="name">${entry.name}</div>
        <div class="score">${entry.score} pts</div>
        ${
          playerId && entry.email === email
            ? `<div class="you-badge">YOU</div>`
            : ""
        }
      `;

      topCard.appendChild(card);
    });

    leaderboardEl.appendChild(topCard);
  }

  results.slice(3).forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "leaderboard-row";

    if (playerId && entry.email === email) {
      li.classList.add("current-player");
    }

    li.innerHTML = `
      <span>#${index + 4} ${entry.name}</span>
      <span>${entry.score}</span>
      ${
        playerId && entry.email === email
          ? `<span class="you-inline">YOU</span>`
          : ""
      }
    `;

    leaderboardEl.appendChild(li);
  });

  saveResult({
    email,
    name,
    subject,
    score,
  });
}

function saveResult(data) {
  fetch(
    `https://popquizzer-crud-backend.onrender.com/results?email=${data.email}&subject=${data.subject}`,
  )
    .then((r) => r.json())
    .then((existing) => {
      if (existing.length === 0) {
        // First attempt
        return fetch("https://popquizzer-crud-backend.onrender.com/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        const existingResult = existing[0];

        return fetch(
          `https://popquizzer-crud-backend.onrender.com/results/${existingResult.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              score: Math.max(existingResult.score, data.score),
            }),
          },
        );
      }
    });
}

function showCheerMessage(accuracy) {
  const el = document.getElementById("cheerMessage");
  let msg = "";

  if (accuracy >= 90) {
    msg = "🎉 Outstanding! You nailed it!";
  } else if (accuracy >= 70) {
    msg = "👏 Great job! Almost perfect!";
  } else if (accuracy >= 40) {
    msg = "🙂 Good effort! Keep practicing!";
  } else {
    msg = "💪 Don’t worry — try again and improve!";
  }

  el.innerText = msg;
}

function renderReview(quiz, userAnswers) {
  const reviewDiv = document.getElementById("review");
  reviewDiv.innerHTML = "";

  quiz.questions.forEach((q, qIndex) => {
    const box = document.createElement("div");
    box.className = "review-box";

    let optionsHTML = "";

    q.options.forEach((opt, i) => {
      let cls = "option";
      let icon = "";

      if (i === q.answer) {
        cls += " correct";
        icon = "✔";
      } else if (i === userAnswers[qIndex]) {
        cls += " wrong";
        icon = "✖";
      }
      const letter = String.fromCharCode(65 + i);
      optionsHTML += `
  <div class="${cls}">
    <span>${letter}) ${opt}</span>
    <span class="icon">${icon}</span>
  </div>
`;
    });

    box.innerHTML = `
      <p><strong>Q${qIndex + 1}:</strong> ${q.question}</p>
      ${optionsHTML}

      ${
        q.explanation
          ? `
            <div class="review-explanation">
              <strong>Explanation:</strong>
              <p>${q.explanation}</p>
            </div>
          `
          : ""
      }
    `;

    reviewDiv.appendChild(box);
  });
}

document.getElementById("retryBtn")?.addEventListener("click", () => {
  sessionStorage.removeItem("score");
  sessionStorage.removeItem("answers");

  window.location.href = "quiz.html";
});

document.getElementById("dashboardBtn")?.addEventListener("click", () => {
  sessionStorage.removeItem("score");
  sessionStorage.removeItem("answers");

  window.location.href = "landing.html";
});

function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ["#22c55e", "#4f46e5", "#facc15", "#ec4899", "#38bdf8"];

  for (let i = 0; i < 160; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: Math.random() * Math.PI,
    });
  }

  let animationFrame;
  const gravity = 0.6;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.ellipse(p.x, p.y, p.r, p.r / 2, p.tilt, 0, Math.PI * 2);
      ctx.fill();
    });

    update();
  }

  function update() {
    pieces.forEach((p) => {
      p.y += p.d * gravity;
      p.tiltAngle += 0.1;
      p.tilt = Math.sin(p.tiltAngle) * 8;

      if (p.y > canvas.height) {
        p.y = -20;
      }
    });
  }

  function animate() {
    draw();
    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 3000);
}
function logout() {
  sessionStorage.clear();

  if (window.firebase && firebase.auth) {
    firebase
      .auth()
      .signOut()
      .finally(() => {
        window.location.href = "login.html";
      });
  } else {
    window.location.href = "login.html";
  }
}

const logoutBtn = document.querySelector(".logout-btn");

let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  if (currentScroll > 30) {
    logoutBtn.classList.add("hide");
  } else {
    logoutBtn.classList.remove("hide");
  }

  lastScrollY = currentScroll;
});
