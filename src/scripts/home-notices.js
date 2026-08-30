import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  createIcons,
  ImageOff,
  Megaphone,
  X
} from "lucide";
import { resolvePublicMediaUrl } from "../config/media.js";

const announcementSection = document.querySelector("#homeAnnouncements");
const announcementGrid = document.querySelector("#homeAnnouncementGrid");
const announcementCount = document.querySelector("#announcementCount");
const promotionDialog = document.querySelector("#promotionDialog");
const promotionDialogMedia = document.querySelector("#promotionDialogMedia");
const promotionDialogDates = document.querySelector("#promotionDialogDates");
const promotionDialogTitle = document.querySelector("#promotionDialogTitle");
const promotionDialogDescription = document.querySelector("#promotionDialogDescription");

const dynamicIcons = {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  ImageOff,
  Megaphone,
  X
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
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-GT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function festivityKey(value) {
  return String(value || "general")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderAnnouncements(announcements) {
  if (!announcementSection || !announcementGrid || !announcements.length) return;

  announcementCount.textContent = `${announcements.length} ${announcements.length === 1 ? "anuncio vigente" : "anuncios vigentes"}`;
  announcementGrid.innerHTML = announcements
    .map((announcement) => {
      const imageUrl = resolvePublicMediaUrl(announcement.imagen_url);
      const dateEnd = formatDate(announcement.fecha_fin);
      const destination = announcement.promocion_id ? "/promociones" : "https://wa.me/50257479695";
      const externalAttributes = announcement.promocion_id ? "" : ' target="_blank" rel="noreferrer"';
      const image = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(announcement.titulo)}" loading="lazy" />`
        : '<span class="home-announcement-card__fallback" aria-hidden="true"><i data-lucide="megaphone"></i></span>';

      return `
        <article class="home-announcement-card reveal" data-festivity="${festivityKey(announcement.estilo_nombre)}">
          <div class="home-announcement-card__media">${image}</div>
          <div class="home-announcement-card__content">
            <span>${escapeHtml(announcement.estilo_nombre || "Studio Siete")}</span>
            <h3>${escapeHtml(announcement.titulo)}</h3>
            <p>${escapeHtml(announcement.descripcion || "Consulta los detalles directamente con el estudio.")}</p>
            <div>
              ${dateEnd ? `<time datetime="${escapeHtml(String(announcement.fecha_fin).slice(0, 10))}">Hasta ${dateEnd}</time>` : ""}
              <a href="${destination}"${externalAttributes} aria-label="Consultar ${escapeHtml(announcement.titulo)}">
                <i data-lucide="arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  announcementSection.hidden = false;
  refreshDynamicIcons();

  requestAnimationFrame(() => {
    announcementGrid.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  });
}

function closePromotionDialog() {
  if (promotionDialog?.open) promotionDialog.close();
}

function schedulePromotionDialog(promotion) {
  if (!promotionDialog || !promotion?.id) return;

  const storageKey = `studio7_promotion_seen_${promotion.id}_${String(promotion.fecha_fin || "active").slice(0, 10)}`;
  if (sessionStorage.getItem(storageKey) === "true") return;

  const imageUrl = resolvePublicMediaUrl(promotion.imagen_url);
  promotionDialogMedia.innerHTML = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="Banner de ${escapeHtml(promotion.titulo)}" />`
    : '<span class="promotion-dialog__fallback" aria-hidden="true"><i data-lucide="badge-percent"></i></span>';

  const dateStart = formatDate(promotion.fecha_inicio);
  const dateEnd = formatDate(promotion.fecha_fin);
  promotionDialogDates.textContent = dateStart && dateEnd ? `${dateStart} · ${dateEnd}` : "Disponibilidad limitada";
  promotionDialogTitle.textContent = promotion.titulo || "Promoción vigente";
  promotionDialogDescription.textContent = promotion.descripcion || "Consulta los detalles y disponibilidad con Studio Siete.";
  refreshDynamicIcons();

  const showDialog = () => {
    window.setTimeout(() => {
      if (promotionDialog.open) return;
      sessionStorage.setItem(storageKey, "true");
      promotionDialog.showModal();
    }, 700);
  };

  if (sessionStorage.getItem("studio7_intro_seen") === "true") {
    showDialog();
    return;
  }

  document.querySelector("#introButton")?.addEventListener("click", showDialog, { once: true });
}

promotionDialog?.querySelectorAll("[data-promotion-close]").forEach((button) => {
  button.addEventListener("click", closePromotionDialog);
});

promotionDialog?.addEventListener("click", (event) => {
  if (event.target === promotionDialog) closePromotionDialog();
});

async function loadHomeNotices() {
  const results = await Promise.allSettled([
    fetch("/api/public/anuncios"),
    fetch("/api/public/promociones")
  ]);

  const [announcementsResult, promotionsResult] = results;

  if (announcementsResult.status === "fulfilled" && announcementsResult.value.ok) {
    const announcements = await announcementsResult.value.json();
    renderAnnouncements(Array.isArray(announcements) ? announcements : []);
  }

  if (promotionsResult.status === "fulfilled" && promotionsResult.value.ok) {
    const promotions = await promotionsResult.value.json();
    if (Array.isArray(promotions) && promotions.length) schedulePromotionDialog(promotions[0]);
  }
}

loadHomeNotices();
