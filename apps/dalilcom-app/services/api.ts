type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string>;
  timeoutMs?: number;
}

type ApiError = { message: string; details?: unknown };
type Paginated<T> = { data: T[] };

const FALLBACK_ENDPOINTS = [
  'https://dalilukum.sy/api',
  'http://dalilukum.sy/api',
  'http://179.236.255.47/api',
];

const productionBaseUrl = FALLBACK_ENDPOINTS[0];
const envBaseUrl = (process.env.EXPO_PUBLIC_API_URL || productionBaseUrl).trim().replace(/\/$/, '');
const isDevRuntime = typeof __DEV__ !== 'undefined' && __DEV__;
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(envBaseUrl);
const primaryBaseUrl = (isLocalApiUrl && !isDevRuntime ? productionBaseUrl : envBaseUrl).replace(/\/$/, '');

const endpointPool = Array.from(new Set([primaryBaseUrl, ...FALLBACK_ENDPOINTS]));
let activeBaseUrl = primaryBaseUrl;

export const apiBaseUrl = primaryBaseUrl;

export function normalizeAssetUrl(url?: string) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (trimmed.includes('photo-1621007947382-bb3c3994e3fd')) {
    return 'https://dalilukum.sy/images/ads/local_ad_a9655fd3f1d2.jpg';
  }
  const origin = activeBaseUrl.replace(/\/api\/?$/, '') || 'https://dalilukum.sy';
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`;
  }
  return trimmed.replace(/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i, origin);
}

const inflightGetRequests = new Map<string, Promise<any>>();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  if (typeof AbortController === 'undefined') {
    return fetch(url, init);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function executeRequest<T>(
  endpoint: string,
  { method = 'GET', body, params, timeoutMs }: RequestOptions = {},
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let queryString = '';
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        qs.set(key, String(value));
      }
    });
    const q = qs.toString();
    if (q) queryString = `?${q}`;
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const serializedBody = isFormData ? (body as any) : body !== undefined ? JSON.stringify(body) : undefined;
  const effectiveTimeout = timeoutMs ?? (method === 'GET' ? 9500 : 18000);

  const isIdempotent =
    method === 'GET' ||
    method === 'PUT' ||
    method === 'DELETE' ||
    cleanEndpoint === '/auth/login' ||
    cleanEndpoint === '/favorites' ||
    cleanEndpoint === '/notifications/read-all' ||
    (cleanEndpoint === '/ads' && Boolean(body && typeof body === 'object' && 'id' in (body as any)));

  const orderedBases = isIdempotent
    ? [activeBaseUrl, ...endpointPool.filter(b => b !== activeBaseUrl)]
    : [activeBaseUrl];

  let lastError: ApiError = { message: 'تعذر الاتصال بالخادم، يرجى التحقق من الإنترنت والمحاولة مرة أخرى' };

  for (let i = 0; i < orderedBases.length; i++) {
    const candidateBase = orderedBases[i];
    const url = `${candidateBase}${cleanEndpoint}${queryString}`;

    try {
      const res = await fetchWithTimeout(
        url,
        {
          method,
          headers,
          body: serializedBody,
        },
        effectiveTimeout,
      );

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!json) {
        if (res.status >= 500 && i < orderedBases.length - 1) {
          await sleep(250);
          continue;
        }
        throw {
          message: `تعذر قراءة استجابة الخادم (${res.status})`,
          details: { url, status: res.status },
        } satisfies ApiError;
      }

      if (!res.ok || json.success === false) {
        if (res.status >= 502 && res.status <= 504 && i < orderedBases.length - 1) {
          await sleep(250);
          continue;
        }
        throw {
          message: json.message || 'فشل تنفيذ الطلب على الخادم',
          details: json,
        } satisfies ApiError;
      }

      activeBaseUrl = candidateBase;
      return json.data as T;
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err && 'details' in err) {
        lastError = err as ApiError;
        // 4xx validation/auth errors came from a live server, do not retry on other endpoints
        const status = (err as any)?.details?.status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          throw lastError;
        }
        if ((err as any)?.details?.success === false) {
          throw lastError;
        }
      } else {
        lastError = {
          message: 'ضعف أو انقطاع في الاتصال بالشبكة، يرجى المحاولة مرة أخرى',
          details: { url, raw: String(err?.message || err) },
        };
      }

      if (i < orderedBases.length - 1) {
        await sleep(300);
      }
    }
  }

  throw lastError;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET';
  if (method === 'GET') {
    const qs = options.params ? JSON.stringify(options.params) : '';
    const key = `${endpoint}?${qs}`;
    const existing = inflightGetRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }
    const promise = executeRequest<T>(endpoint, options).finally(() => {
      inflightGetRequests.delete(key);
    });
    inflightGetRequests.set(key, promise);
    return promise;
  }
  return executeRequest<T>(endpoint, options);
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) => request<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  uploadFile: async <T>(path: string, fieldName: string, file: { uri: string; name: string; type: string }): Promise<T> => {
    const formData = new FormData();
    formData.append(fieldName, { uri: file.uri, name: file.name, type: file.type } as any);
    return request<T>(path, { method: 'POST', body: formData, timeoutMs: 30000 });
  },
};

export async function listApi<T>(path: string, params?: Record<string, string>) {
  const data = await api.get<T[] | Paginated<T>>(path, params);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as Paginated<T>).data)) return (data as Paginated<T>).data;
  return [];
}

export type { ApiError };

