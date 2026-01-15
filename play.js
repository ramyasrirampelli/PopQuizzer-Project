let activeQuizId = null;
let activeJoinCode = null;


async function loadQuizzes() {
  const res = await fetch("https://popquizzer-crud-backend.onrender.com/quizzes");
  const quizzes = await res.json();

  const list = document.getElementById("quizList");
  list.innerHTML = "";

  quizzes.forEach(q => {
    const card = document.createElement("div");
    card.className = "quiz-card";

    card.innerHTML = `
      <span>${q.subject}</span>
      <button>Join</button>
    `;

    card.querySelector("button").onclick = () =>
      startJoin(q.id, q.subject);

    list.appendChild(card);
  });
}

function startJoin(quizId, subject) {
  if (!activeJoinCode) {
    activeJoinCode =
      subject.toUpperCase().replace(/\s+/g, "") +
      "-" +
      Math.floor(100000 + Math.random() * 900000);
  }

  activeQuizId = quizId;

  document.getElementById("joinSection").classList.remove("hidden");

  document.getElementById("codeDisplay").innerText =
  "Join Code: " + activeJoinCode;
}

document.getElementById("joinBtn").onclick = async () => {
  const name = document.getElementById("name").value.trim();

  if (!name) {
    alert("Enter your name");
    return;
  }

  const res = await fetch("https://popquizzer-crud-backend.onrender.com/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quizId: activeQuizId,
      joinCode: activeJoinCode,
      name
    })
  });

  const player = await res.json(); 

  sessionStorage.setItem("quizId", activeQuizId);
  sessionStorage.setItem("playerId", player.id); 
  sessionStorage.setItem("playerName", name);

  window.location.href = "quiz.html";
};

loadQuizzes();
