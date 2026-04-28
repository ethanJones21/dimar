const DEFAULT_IMAGE = process.env.NEXT_PUBLIC_DEFAULT_IMAGE || "https://placehold.co/400x400?text=Sin+imagen";
const DEFAULT_BANNER = process.env.NEXT_PUBLIC_DEFAULT_BANNER || "";
const DEFAULT_VIDEO = process.env.NEXT_PUBLIC_DEFAULT_VIDEO || "";

export function imgUrl(url?: string | null): string {
  return url && url.trim() !== "" ? url : DEFAULT_IMAGE;
}

export function bannerUrl(url?: string | null): string {
  return url && url.trim() !== "" ? url : DEFAULT_BANNER;
}

export function videoUrl(url?: string | null): string {
  return url && url.trim() !== "" ? url : DEFAULT_VIDEO;
}

export { DEFAULT_IMAGE, DEFAULT_BANNER, DEFAULT_VIDEO };
