import {
  ArrowRight,
  AtSign,
  CarFront,
  createIcons,
  MapPin,
  MessageCircle,
  Send
} from "lucide";

createIcons({
  icons: {
    ArrowRight,
    AtSign,
    CarFront,
    MapPin,
    MessageCircle,
    Send
  }
});

const contactForm = document.querySelector("#contactForm");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();
  const whatsappMessage = [
    `Hola, soy ${name}.`,
    `Correo: ${email}`,
    "",
    message
  ].join("\n");

  window.open(
    `https://wa.me/50257479695?text=${encodeURIComponent(whatsappMessage)}`,
    "_blank",
    "noopener,noreferrer"
  );
});
