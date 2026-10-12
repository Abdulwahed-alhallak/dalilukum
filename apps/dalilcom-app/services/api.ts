type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string>;
}

type ApiError = { message: string; details?: unknown };
type Paginated<T> = { data: T[] };

const productionBaseUrl = 'https://dalilukum.sy/api';
const envBaseUrl = process.env.EXPO_PUBLIC_API_URL || productionBaseUrl;
const isDevRuntime = typeof __DEV__ !== 'undefined' && __DEV__;
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(envBaseUrl);
const baseUrl = (isLocalApiUrl && !isDevRuntime ? productionBaseUrl : envBaseUrl).replace(/\/$/, '');


export const apiBaseUrl = baseUrl;

export function normalizeAssetUrl(url?: string) {
  if (!url) return '';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  return url.replace(/^http:\/\/(127\.0\.0\.1|localhost):(8000|7000)/i, origin);
}

async function request<T>(
  endpoint: string,
  { method = 'GET', body, params }: RequestOptions = {},
): Promise<T> {
  let url = `${baseUrl}${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) qs.set(key, value);
    });
    const query = qs.toString();
    if (query) url += `?${query}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!json) {
    throw { message: `تعذر قراءة استجابة الخادم (${res.status})`, details: { url, status: res.status } } satisfies ApiError;
  }
  if (!res.ok || json.success === false) {
    const error: ApiError = { message: json.message || 'فشل الاتصال بالخادم', details: json };
    throw error;
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) => request<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  uploadFile: async <T>(path: string, fieldName: string, file: { uri: string; name: string; type: string }): Promise<T> => {
    const formData = new FormData();
    formData.append(fieldName, { uri: file.uri, name: file.name, type: file.type } as any);
    return request<T>(path, { method: 'POST', body: formData });
  },
};

export async function listApi<T>(path: string, params?: Record<string, string>) {
  const data = await api.get<T[] | Paginated<T>>(path, params);
  return Array.isArray(data) ? data : data.data;
}

export type { ApiError };
