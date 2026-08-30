import { ArrowLeft, createIcons } from "lucide";

createIcons({ icons: { ArrowLeft } });

const form = document.querySelector("#loginForm");
const message = document.querySelector("#loginMessage");

async function checkSession() {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return;
  const user = await response.json();
  if (user.rol === "admin") window.location.href = "/admin";
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Verificando...";

  const payload = Object.fromEntries(new FormData(form));
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    message.textContent = result.error || "No se pudo iniciar sesion.";
    return;
  }

  window.location.href = result.user?.rol === "admin" ? "/admin" : "/";
});

checkSession().catch(() => {});
