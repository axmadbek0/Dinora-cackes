import { ENV } from '../config/env.config';

/**
 * Normalizes and formats dynamic image URLs across environments (Local, Production, TWA).
 * Converts relative backend paths (e.g. "/uploads/products/xyz.jpg") into absolute URLs
 * using the backend API origin.
 */
export const getImageUrl = (path?: string | null, fallback = '/logotip.png'): string => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return fallback;
  }

  const cleanPath = path.trim();

  // If already absolute URL (Cloudinary, S3, external CDN, or full http/https URL)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Base64 or blob URL (e.g. from local file picker preview)
  if (cleanPath.startsWith('data:') || cleanPath.startsWith('blob:')) {
    return cleanPath;
  }

  // Determine Backend Server Base Origin (strip /api/v1 or /api and trailing slash)
  const apiBaseUrl = (ENV.API_BASE_URL || (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000').trim();
  const serverOrigin = apiBaseUrl.replace(/\/api(\/v1)?\/?$/i, '').replace(/\/+$/, '');

  // Normalize path with leading slash
  let formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // If path was saved as /public/uploads/..., normalize to /uploads/...
  if (formattedPath.startsWith('/public/uploads/')) {
    formattedPath = formattedPath.replace('/public/uploads/', '/uploads/');
  }

  return `${serverOrigin}${formattedPath}`;
};
