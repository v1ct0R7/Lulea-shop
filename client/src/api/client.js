const TOKEN_KEY = 'lulea_admin_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Mbështjellës i fetch-it: shton token-in, kthen JSON dhe hedh gabime të lexueshme. */
export async function request(path, { method = 'GET', body, auth = false, formData } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: formData || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new Error('Nuk ka lidhje me serverin. Sigurohuni që serveri është i ndezur (npm run dev).');
  }
  if (res.status >= 502 || (res.status === 500 && !res.headers.get('content-type')?.includes('json'))) {
    throw new Error('Serveri nuk po përgjigjet. Nisni projektin me "npm run dev" nga folderi lulea.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) {
      tokenStore.clear();
      window.dispatchEvent(new Event('lulea:logout'));
    }
    const err = new Error(data.message || 'Ndodhi një gabim. Provoni përsëri.');
    err.status = res.status;
    throw err;
  }
  return data;
}
