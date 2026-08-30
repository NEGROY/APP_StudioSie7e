export const IMAGEKIT_BASE_URL = "https://ik.imagekit.io/sociotek79/STUDIO7";

export function mediaUrl(path) {
  return `${IMAGEKIT_BASE_URL}/${path.replace(/^\/+/, "")}`;
}

export function resolvePublicMediaUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const imagePath = imageUrl
    .replace(/^\/?assets\/media\//i, "")
    .replace(/^sets\//i, "set/");
  return mediaUrl(imagePath);
}
