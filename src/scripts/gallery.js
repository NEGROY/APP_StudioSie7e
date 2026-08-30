import { CameraOff, createIcons } from "lucide";
import { resolvePublicMediaUrl } from "../config/media.js";

const modelDeck = document.querySelector("#modelDeck");
const modelCount = document.querySelector("#modelCount");
const brandStrip = document.querySelector("#brandStrip");
const cardTilts = [-7, 4, -3, 6, -5, 3, -4, 5];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicName(value) {
  return String(value || "Modelo")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function refreshDynamicIcons() {
  createIcons({ icons: { CameraOff } });
}

function renderModelState(message, type = "empty") {
  if (!modelDeck) return;
  modelDeck.setAttribute("aria-busy", "false");
  modelDeck.innerHTML = `
    <div class="gallery-state gallery-state--${type}">
      <i data-lucide="camera-off" aria-hidden="true"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  refreshDynamicIcons();
}

function renderModels(models) {
  if (!modelDeck || !modelCount) return;

  if (!models.length) {
    modelCount.textContent = "0 perfiles activos";
    renderModelState("No hay modelos activos disponibles en este momento.");
    return;
  }

  modelCount.textContent = `${models.length} ${models.length === 1 ? "perfil activo" : "perfiles activos"}`;
  modelDeck.setAttribute("aria-busy", "false");
  const deckWidth = 238 + Math.max(models.length - 1, 0) * 196;
  modelDeck.style.setProperty("--model-deck-width", `${deckWidth}px`);
  modelDeck.innerHTML = models
    .map((model, index) => {
      const imageUrl = resolvePublicMediaUrl(model.foto_url);
      const image = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="Retrato de ${escapeHtml(publicName(model.nombre))}" loading="lazy" />`
        : "";

      return `
        <article class="model-card" style="--card-tilt: ${cardTilts[index % cardTilts.length]}deg; --card-order: ${index + 1};">
          <div class="model-card__photo">
            <span class="model-card__fallback" aria-hidden="true"><i data-lucide="camera-off"></i></span>
            ${image}
          </div>
          <div class="model-card__caption">
            <span>${escapeHtml(model.puesto || "Modelo")}</span>
            <h3>${escapeHtml(publicName(model.nombre))}</h3>
          </div>
        </article>
      `;
    })
    .join("");

  modelDeck.querySelectorAll(".model-card img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".model-card")?.classList.add("has-image-error");
    });
  });
  refreshDynamicIcons();
}

async function loadModels() {
  if (!modelDeck) return;

  try {
    const response = await fetch("/api/public/modelos");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const models = await response.json();
    renderModels(Array.isArray(models) ? models : []);
  } catch {
    if (modelCount) modelCount.textContent = "Perfiles no disponibles";
    renderModelState("No fue posible cargar los modelos. Intenta nuevamente más tarde.", "error");
  }
}

function renderBrandLogos() {
  if (!brandStrip) return;

  let logos = [];
  try {
    logos = JSON.parse(brandStrip.dataset.brandLogos || "[]");
  } catch {
    logos = [];
  }

  if (!Array.isArray(logos) || !logos.length) return;

  brandStrip.innerHTML = logos
    .map((logo) => {
      const source = typeof logo === "string" ? logo : logo.src;
      const name = typeof logo === "string" ? "Marca cliente" : logo.name || "Marca cliente";
      return `<img src="${escapeHtml(resolvePublicMediaUrl(source))}" alt="${escapeHtml(name)}" loading="lazy" />`;
    })
    .join("");
  brandStrip.classList.add("has-logos");
}

renderBrandLogos();
loadModels();
