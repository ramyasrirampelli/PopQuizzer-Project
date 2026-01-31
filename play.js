const loggedUser = JSON.parse(sessionStorage.getItem("user"));

if (!loggedUser) {
  alert("Please login first");
  window.location.href = "login.html";
}

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
    alert("Please enter your name");
    return;
  }

  const email = loggedUser.email;

  const existingRes = await fetch(
    `https://popquizzer-crud-backend.onrender.com/players?quizId=${activeQuizId}&email=${email}`
  );
  const existingPlayers = await existingRes.json();

  let player;

  if (existingPlayers.length > 0) {
    player = existingPlayers[0];

    await fetch(
      `https://popquizzer-crud-backend.onrender.com/players/${player.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      }
    );
  } else {
    const res = await fetch(
      "https://popquizzer-crud-backend.onrender.com/players",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuizId,
          joinCode: activeJoinCode,
          name,
          email
        })
      }
    );

    player = await res.json();
  }

  sessionStorage.setItem("quizId", activeQuizId);
  sessionStorage.setItem("playerId", player.id);
  sessionStorage.setItem("playerName", name);
loggedUser.name = name;
sessionStorage.setItem("user", JSON.stringify(loggedUser));
  window.location.href = "quiz.html";
};

loadQuizzes();
