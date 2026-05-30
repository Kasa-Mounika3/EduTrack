import { API_BASE_URL } from '../services/apiClient.js';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveAssetUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:')) return value;
  return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;
};
