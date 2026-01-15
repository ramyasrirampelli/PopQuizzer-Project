
function goPlay() {
  window.location.href = "login.html";
}


function openAuthorBox() {
  const box = document.getElementById("authorBox");

  if (box) {
    box.classList.remove("hidden");
    document.getElementById("authorEmail")?.focus();
  }
}

function continueAsAuthor() {
  const emailInput = document.getElementById("authorEmail");
  if (!emailInput) return;

  const email = emailInput.value.trim();

  if (!email || !email.includes("@")) {
    alert("Please enter a valid author email");
    return;
  }

  sessionStorage.setItem("isAuthor", "true");
  sessionStorage.setItem("authorEmail", email);

  window.location.href = "create.html";
}

function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const elementVisible = 120;

    if (elementTop < windowHeight - elementVisible) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("load", revealOnScroll);

window.addEventListener("scroll", revealOnScroll);


if (window.location.pathname.includes("create.html")) {
  const isAuthor = sessionStorage.getItem("isAuthor");
  const authorEmail = sessionStorage.getItem("authorEmail");

  if (!isAuthor || !authorEmail) {
    alert("Access denied. Author only.");
    window.location.href = "index.html";
  }
}
