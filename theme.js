function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.getAttribute("data-theme") === "light";

  if (isLight) {
    root.removeAttribute("data-theme");
    localStorage.setItem("ielts-theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
    localStorage.setItem("ielts-theme", "light");
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  btn.textContent = isLight ? "🌙" : "☀️";
}

document.addEventListener("DOMContentLoaded", updateThemeIcon);