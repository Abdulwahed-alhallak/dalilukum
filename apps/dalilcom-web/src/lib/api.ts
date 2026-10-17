const isProduction = Boolean((import.meta as any).env?.PROD);
const rawApiUrl = (import.meta as any).env?.VITE_API_URL;
const isLocalUrl = typeof rawApiUrl === 'string' && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(rawApiUrl);

const API_BASE = (isProduction || isLocalUrl || !rawApiUrl ? '/api' : rawApiUrl).replace(/\/$/, '');

type Paginated<T> = { data: T[] };

const inflightGet = new Map<string, Promise<any>>();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  if (typeof AbortController === 'undefined') {
    return fetch(url, options);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function executeRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;
  const method = (options.method || 'GET').toUpperCase();
  const maxAttempts = method === 'GET' ? 3 : 2;
  let lastError: Error = new Error('تعذر الاتصال بالخادم');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          ...options,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        },
        method === 'GET' ? 14000 : 22000,
      );

      const text = await response.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!json) {
        if (response.status >= 500 && attempt < maxAttempts - 1) {
          await sleep(300 * (attempt + 1));
          continue;
        }
        throw new Error(`تعذر قراءة استجابة الخادم (${response.status})`);
      }

      if (!response.ok || json.success === false) {
        if (response.status >= 502 && response.status <= 504 && attempt < maxAttempts - 1) {
          await sleep(300 * (attempt + 1));
          continue;
        }
        throw new Error(json.message || 'فشل تنفيذ الطلب على الخادم');
      }

      return json.data as T;
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err?.message || 'فشل الاتصال بالخادم'));
      if (attempt < maxAttempts - 1) {
        await sleep(300 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  if (method === 'GET') {
    const existing = inflightGet.get(path);
    if (existing) {
      return existing as Promise<T>;
    }
    const promise = executeRequest<T>(path, options).finally(() => {
      inflightGet.delete(path);
    });
    inflightGet.set(path, promise);
    return promise;
  }
  return executeRequest<T>(path, options);
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
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as Paginated<T>).data)) return (data as Paginated<T>).data;
  return [];
}
