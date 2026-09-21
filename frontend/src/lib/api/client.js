/**
 * The single place the app talks to the API.
 *
 * In development requests go to `/api`, which Vite proxies to the backend, so
 * the session cookie is same-origin. In production VITE_API_URL points at the
 * deployed API and `credentials: 'include'` carries the cookie cross-site.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True when signing in (or back in) would fix the request. */
  get isAuthError() {
    return this.status === 401;
  }

  /** Field errors, keyed by field name, for attaching to form inputs. */
  get fieldErrors() {
    if (!Array.isArray(this.details)) return {};
    return this.details.reduce((acc, issue) => {
      if (issue?.field) acc[issue.field] = issue.message;
      return acc;
    }, {});
  }
}

const listeners = new Set();

/** Lets the auth provider react to a session that expired mid-session. */
export function onUnauthorized(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function buildQuery(params) {
  if (!params) return '';
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

async function request(path, { method = 'GET', body, params, signal, isFormData } = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      credentials: 'include',
      signal,
      ...(body !== undefined
        ? {
            headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
            body: isFormData ? body : JSON.stringify(body),
          }
        : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('We could not reach the store. Check your connection and try again.', {
      status: 0,
      code: 'NETWORK_ERROR',
    });
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new ApiError(payload?.error?.message ?? 'Something went wrong. Please try again.', {
      status: response.status,
      code: payload?.error?.code,
      details: payload?.error?.details,
    });

    if (error.status === 401) {
      for (const listener of listeners) listener();
    }

    throw error;
  }

  return payload;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  upload: (path, formData, options) =>
    request(path, { ...options, method: 'POST', body: formData, isFormData: true }),
};

export default api;
