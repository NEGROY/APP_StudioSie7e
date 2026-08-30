import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  createIcons,
  ImageOff,
  MessageCircle
} from "lucide";
import { resolvePublicMediaUrl } from "../config/media.js";

const promotionCount = document.querySelector("#promotionCount");
const promotionList = document.querySelector("#publicPromotionList");

const dynamicIcons = {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  ImageOff,
  MessageCircle
};

function refreshDynamicIcons() {
  createIcons({ icons: dynamicIcons });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Fecha por confirmar";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Fecha por confirmar";

  return new Intl.DateTimeFormat("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function reservationUrl(title) {
  const message = `Hola, me interesa la promoción "${title}". ¿Podrían compartirme disponibilidad y detalles?`;
  return `https://wa.me/50257479695?text=${encodeURIComponent(message)}`;
}

function renderState(message, type) {
  promotionList.setAttribute("aria-busy", "false");
  promotionList.innerHTML = `
    <div class="public-data-state public-data-state--${type}">
      <i data-lucide="${type === "empty" ? "badge-percent" : "image-off"}" aria-hidden="true"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  refreshDynamicIcons();
}

function renderPromotions(promotions) {
  promotionCount.textContent = `${promotions.length} ${promotions.length === 1 ? "promoción vigente" : "promociones vigentes"}`;

  if (!promotions.length) {
    renderState("No hay promociones vigentes en este momento.", "empty");
    return;
  }

  promotionList.setAttribute("aria-busy", "false");
  promotionList.innerHTML = promotions
    .map((promotion, index) => {
      const title = escapeHtml(promotion.titulo);
      const imageUrl = resolvePublicMediaUrl(promotion.imagen_url);
      const image = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="Banner de ${title}" loading="${index === 0 ? "eager" : "lazy"}" />`
        : `<span class="public-promotion-card__fallback" aria-hidden="true"><i data-lucide="badge-percent"></i></span>`;

      return `
        <article class="public-promotion-card reveal">
          <div class="public-promotion-card__media">${image}</div>
          <div class="public-promotion-card__content">
            <span class="public-promotion-card__index">Promoción ${String(index + 1).padStart(2, "0")}</span>
            <p class="public-promotion-card__dates">
              <i data-lucide="calendar-days" aria-hidden="true"></i>
              ${formatDate(promotion.fecha_inicio)} al ${formatDate(promotion.fecha_fin)}
            </p>
            <h3>${title}</h3>
            <p class="public-promotion-card__description">${escapeHtml(promotion.descripcion || "Consulta las condiciones directamente con Studio Siete.")}</p>
            <div class="public-promotion-card__footer">
              <span><i data-lucide="badge-percent" aria-hidden="true"></i> Vigente</span>
              <a class="action action--blue" href="${reservationUrl(promotion.titulo)}" target="_blank" rel="noreferrer">
                Consultar
                <i data-lucide="arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  promotionList.querySelectorAll(".public-promotion-card img").forEach((image) => {
    image.addEventListener("error", () => {
      const media = image.closest(".public-promotion-card__media");
      media.innerHTML = '<span class="public-promotion-card__fallback" aria-hidden="true"><i data-lucide="image-off"></i></span>';
      refreshDynamicIcons();
    });
  });

  refreshDynamicIcons();

  requestAnimationFrame(() => {
    promotionList.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  });
}

async function loadPromotions() {
  try {
    const response = await fetch("/api/public/promociones");
    if (!response.ok) throw new Error("Promotion request failed");

    const promotions = await response.json();
    renderPromotions(Array.isArray(promotions) ? promotions : []);
  } catch {
    promotionCount.textContent = "Agenda no disponible";
    renderState("No fue posible cargar las promociones. Intenta nuevamente más tarde.", "error");
  }
}

loadPromotions();
