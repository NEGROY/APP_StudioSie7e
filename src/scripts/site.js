import {
  ArrowRight,
  AtSign,
  Camera,
  createIcons,
  LockKeyhole,
  Menu,
  MessageCircle,
  Share2,
  X
} from "lucide";

createIcons({
  icons: {
    ArrowRight,
    AtSign,
    Camera,
    LockKeyhole,
    Menu,
    MessageCircle,
    Share2,
    X
  }
});

const body = document.body;
const intro = document.querySelector("#intro");
const introButton = document.querySelector("#introButton");
const navToggle = document.querySelector("[data-nav-toggle]");
const publicNav = document.querySelector("[data-public-nav]");

requestAnimationFrame(() => body.classList.add("page-ready"));

if (sessionStorage.getItem("studio7_intro_seen") === "true") {
  intro?.classList.add("is-dismissed");
}

introButton?.addEventListener("click", () => {
  intro?.classList.add("is-dismissed");
  sessionStorage.setItem("studio7_intro_seen", "true");
});

const closeNavigation = () => {
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Abrir navegación");
  publicNav?.classList.remove("is-open");
};

navToggle?.addEventListener("click", () => {
  const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(willOpen));
  navToggle.setAttribute("aria-label", willOpen ? "Cerrar navegación" : "Abrir navegación");
  publicNav?.classList.toggle("is-open", willOpen);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    ) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) {
      return;
    }

    event.preventDefault();
    closeNavigation();
    body.classList.add("page-leaving");
    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 360);
  });
});
