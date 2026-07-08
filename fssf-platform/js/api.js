// Thin fetch wrapper. Always sends credentials so the fssf_token cookie
// (set by the backend after Discord login) goes along with every request.
const API_BASE = window.FSSF_CONFIG.API_BASE;

async function request(method, path, body, isFormData = false) {
  const opts = {
    method,
    credentials: 'include',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  let data = null;
  try { data = await res.json(); } catch (_) { /* empty body */ }

  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const api = {
  get: (path, params) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request('GET', `${path}${qs}`);
  },
  post: (path, body, isFormData) => request('POST', path, body, isFormData),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};
