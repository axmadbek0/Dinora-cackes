import { ENV } from '../config/env.config';

/**
 * Normalizes and formats dynamic image URLs across environments (Local, Production, TWA).
 * Converts relative backend paths (e.g. "/uploads/products/xyz.jpg") into absolute URLs
 * using the backend API origin.
 *
 * Also handles legacy DB entries where the full http://localhost:5000 URL was mistakenly
 * stored — these are dynamically rewritten to the production domain at runtime.
 */
export const getImageUrl = (path?: string | null, fallback = '/logotip.png'): string => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return fallback;
  }

  const cleanPath = path.trim();

  // Base64 or blob URL (e.g. from local file picker preview)
  if (cleanPath.startsWith('data:') || cleanPath.startsWith('blob:')) {
    return cleanPath;
  }

  // Determine Backend Server Base Origin (strip /api/v1 or /api and trailing slash)
  const apiBaseUrl = (ENV.API_BASE_URL || (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000').trim();
  const serverOrigin = apiBaseUrl.replace(/\/api(\/v1)?\/?$/i, '').replace(/\/+$/, '');

  // If already absolute URL (Cloudinary, S3, external CDN, or full http/https URL)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    // Replace legacy localhost DB references dynamically with the current server origin
    if (cleanPath.includes('localhost:5000') || cleanPath.includes('127.0.0.1:5000')) {
      const relativePart = cleanPath.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
      return `${serverOrigin}${relativePart}`;
    }
    return cleanPath;
  }

  // Normalize path with leading slash
  let formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // If path was saved as /public/uploads/..., normalize to /uploads/...
  if (formattedPath.startsWith('/public/uploads/')) {
    formattedPath = formattedPath.replace('/public/uploads/', '/uploads/');
  }

  return `${serverOrigin}${formattedPath}`;
};
