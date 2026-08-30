import {
  Aperture,
  ArrowRight,
  BadgePercent,
  Camera,
  CakeSlice,
  CalendarDays,
  Clapperboard,
  createIcons,
  ImageOff,
  MessageCircle,
  Sparkles
} from "lucide";
import { resolvePublicMediaUrl } from "../config/media.js";

const serviceCatalog = document.querySelector("#publicServiceCatalog");
const serviceCount = document.querySelector("#serviceCount");
const promotionGrid = document.querySelector("#servicePromotionGrid");

const dynamicIcons = {
  Aperture,
  ArrowRight,
  BadgePercent,
  Camera,
  CakeSlice,
  CalendarDays,
  Clapperboard,
  ImageOff,
  MessageCircle,
  Sparkles
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatQuetzales(value) {
  const amount = Number(value || 0);
  return `Q ${new Intl.NumberFormat("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)}`;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

function iconForService(name) {
  const normalizedName = String(name || "").toLocaleLowerCase("es");
  if (normalizedName.includes("reel")) return "clapperboard";
  if (normalizedName.includes("alquiler") || normalizedName.includes("estudio")) return "aperture";
  if (normalizedName.includes("evento")) return "calendar-days";
  if (normalizedName.includes("xv")) return "sparkles";
  if (normalizedName.includes("cumple")) return "cake-slice";
  return "aperture";
}

function refreshDynamicIcons() {
  createIcons({ icons: dynamicIcons });
}

function renderDataState(container, message, type = "empty") {
  if (!container) return;
  container.setAttribute("aria-busy", "false");
  container.innerHTML = `
    <div class="public-data-state public-data-state--${type}">
      <i data-lucide="${type === "promotion" ? "badge-percent" : "image-off"}" aria-hidden="true"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
  refreshDynamicIcons();
}

function renderServices(services) {
  if (!serviceCatalog || !serviceCount) return;

  if (!services.length) {
    serviceCount.textContent = "0 servicios activos";
    renderDataState(serviceCatalog, "No hay servicios activos disponibles en este momento.");
    return;
  }

  serviceCount.textContent = `${services.length} ${services.length === 1 ? "servicio activo" : "servicios activos"}`;
  serviceCatalog.setAttribute("aria-busy", "false");
  serviceCatalog.innerHTML = services
    .map((service, index) => {
      const features = Array.isArray(service.caracteristicas) ? service.caracteristicas : [];
      const featureList = features.length
        ? `
          <div class="public-service-card__features">
            <span>Opciones disponibles</span>
            <ul>
              ${features
                .map(
                  (feature) => `
                    <li>
                      <span>${escapeHtml(feature.nombre)}</span>
                      <strong>+ ${formatQuetzales(feature.precio)}</strong>
                    </li>
                  `
                )
                .join("")}
            </ul>
          </div>
        `
        : "";

      return `
        <article class="public-service-card">
          <div class="public-service-card__top">
            <span class="public-service-card__index">${String(index + 1).padStart(2, "0")}</span>
            <span class="public-service-card__icon" aria-hidden="true"><i data-lucide="${iconForService(service.nombre)}"></i></span>
          </div>
          <div class="public-service-card__body">
            <h3>${escapeHtml(service.nombre)}</h3>
            <p>${escapeHtml(service.descripcion || "Consulta el alcance de este servicio.")}</p>
          </div>
          ${featureList}
          <div class="public-service-card__price">
            <span>Desde</span>
            <strong>${formatQuetzales(service.precio)}</strong>
          </div>
        </article>
      `;
    })
    .join("");
  refreshDynamicIcons();
}

function renderPromotions(promotions) {
  if (!promotionGrid) return;

  if (!promotions.length) {
    renderDataState(promotionGrid, "No hay promociones vigentes en este momento.", "promotion");
    return;
  }

  promotionGrid.setAttribute("aria-busy", "false");
  promotionGrid.innerHTML = promotions
    .map((promotion) => {
      const imageUrl = resolvePublicMediaUrl(promotion.imagen_url);
      const image = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="Banner de ${escapeHtml(promotion.titulo)}" loading="lazy" />`
        : `<span class="service-promotion-card__fallback" aria-hidden="true"><i data-lucide="badge-percent"></i></span>`;

      return `
        <article class="service-promotion-card">
          <div class="service-promotion-card__media">${image}</div>
          <div class="service-promotion-card__content">
            <span>${formatDate(promotion.fecha_inicio)} · ${formatDate(promotion.fecha_fin)}</span>
            <h3>${escapeHtml(promotion.titulo)}</h3>
            <p>${escapeHtml(promotion.descripcion || "Consulta los detalles con el estudio.")}</p>
            <a href="/promociones">Ver promoción</a>
          </div>
        </article>
      `;
    })
    .join("");

  promotionGrid.querySelectorAll(".service-promotion-card img").forEach((image) => {
    image.addEventListener("error", () => {
      image.closest(".service-promotion-card__media").innerHTML =
        '<span class="service-promotion-card__fallback" aria-hidden="true"><i data-lucide="badge-percent"></i></span>';
      refreshDynamicIcons();
    });
  });
  refreshDynamicIcons();
}

async function loadPublicData() {
  const requests = await Promise.allSettled([
    fetch("/api/public/servicios"),
    fetch("/api/public/promociones")
  ]);

  const [servicesResult, promotionsResult] = requests;

  if (servicesResult.status === "fulfilled" && servicesResult.value.ok) {
    const services = await servicesResult.value.json();
    renderServices(Array.isArray(services) ? services : []);
  } else {
    if (serviceCount) serviceCount.textContent = "Catálogo no disponible";
    renderDataState(serviceCatalog, "No fue posible cargar los servicios. Intenta nuevamente más tarde.", "error");
  }

  if (promotionsResult.status === "fulfilled" && promotionsResult.value.ok) {
    const promotions = await promotionsResult.value.json();
    renderPromotions(Array.isArray(promotions) ? promotions : []);
  } else {
    renderDataState(promotionGrid, "No fue posible cargar las promociones vigentes.", "promotion");
  }
}

loadPublicData();
