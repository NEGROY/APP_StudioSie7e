export const IMAGEKIT_BASE_URL = "https://ik.imagekit.io/sociotek79/STUDIO7";

export function mediaUrl(path) {
  return `${IMAGEKIT_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
