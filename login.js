const API = "https://popquizzer-crud-backend.onrender.com/users";

let isLogin = true;

function togglePassword() {
  const p = document.getElementById("password");
  p.type = p.type === "password" ? "text" : "password";
}

function toggleMode() {
  isLogin = !isLogin;

  const title = document.getElementById("title");
  const desc = document.getElementById("desc");
  const submit = document.getElementById("submit");
  const switchText = document.getElementById("switchText");
  const switchAction = document.getElementById("switchAction");

  if (isLogin) {
    title.innerText = "Welcome back";
    desc.innerText =
      "Glad to see you again! Log in to join a quiz and start playing.";
    submit.innerText = "Log in";
    switchText.innerText = "New user?";
    switchAction.innerText = "Sign up";
  } else {
    title.innerText = "Create your account";
    desc.innerText =
      "Join PopQuizzer to play live quizzes, compete with others, and have fun learning.";
    submit.innerText = "Sign up";
    switchText.innerText = "Existing user?";
    switchAction.innerText = "Log in";
  }
}

function handleAuth() {
  if (isLogin) {
    login();
  } else {
    signup();
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  const res = await fetch(`${API}?email=${email}&password=${password}`);
  const users = await res.json();

  if (users.length === 0) {
    alert("Invalid email or password.");
    return;
  }

  sessionStorage.setItem("user", JSON.stringify(users[0]));
  window.location.href = "play.html";
}

async function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter a valid email and password.");
    return;
  }

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  alert("Account created successfully! Please log in.");
  isLogin = false;
  toggleMode();
}

async function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    const email = user.email;
    const name = user.displayName;
    const uid = user.uid;

    const res = await fetch(`${API}?email=${email}`);
    const users = await res.json();

    let finalUser;

    if (users.length === 0) {
      const saveRes = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          provider: "google",
          uid
        })
      });

      finalUser = await saveRes.json();
    } else {
      finalUser = users[0];
    }

    sessionStorage.setItem("user", JSON.stringify(finalUser));
    window.location.href = "play.html";

  } catch (error) {
    alert(error.message);
  }
}

