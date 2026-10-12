const isProduction = Boolean((import.meta as any).env?.PROD);
const rawApiUrl = (import.meta as any).env?.VITE_API_URL;
const isLocalUrl = typeof rawApiUrl === 'string' && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(rawApiUrl);

const API_BASE = (isProduction || isLocalUrl || !rawApiUrl ? '/api' : rawApiUrl).replace(/\/$/, '');



type ApiResponse<T> = { success: boolean; data: T };
type Paginated<T> = { data: T[] };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const json = await response.json();
  if (!response.ok || json.success === false) {
    throw new Error(json.message || 'API request failed');
  }
  return json.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export async function listApi<T>(path: string) {
  const data = await api.get<T[] | Paginated<T>>(path);
  return Array.isArray(data) ? data : data.data;
}
