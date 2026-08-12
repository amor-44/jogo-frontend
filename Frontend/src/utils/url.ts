const rawUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5001/api/v1';

const BASE_ORIGIN = rawUrl
  .replace(/\/api\/v1\/?$/, '')
  .replaceAll('[', '')
  .replaceAll(']', '')
  .trim();

export const getFullImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_ORIGIN}${cleanUrl}`;
};
