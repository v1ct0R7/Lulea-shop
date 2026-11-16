import { request } from './client';

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null));
  return s.toString() ? `?${s}` : '';
};

export const api = {
  // Publike
  getSettings: () => request('/settings'),
  getCustomOptions: () => request('/custom-options'),
  getCategories: () => request('/categories'),
  getCategory: (slug) => request(`/categories/${slug}`),
  getProducts: (params) => request(`/products${qs(params)}`),
  getProduct: (slug) => request(`/products/${slug}`),
  createOrder: (order) => request('/orders', { method: 'POST', body: order }),

  // Admin
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me', { auth: true }),

  createCategory: (data) => request('/categories', { method: 'POST', body: data, auth: true }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE', auth: true }),

  createProduct: (data) => request('/products', { method: 'POST', body: data, auth: true }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),

  getOrders: (params) => request(`/orders${qs(params)}`, { auth: true }),
  getOrderStats: () => request('/orders/stats', { auth: true }),
  updateOrder: (id, data) => request(`/orders/${id}`, { method: 'PATCH', body: data, auth: true }),
  blockOrderPhone: (id, reason) => request(`/orders/${id}/block`, { method: 'POST', body: { reason }, auth: true }),
  getBlocked: () => request('/orders/blocked', { auth: true }),
  unblockPhone: (phone) => request(`/orders/blocked/${phone}`, { method: 'DELETE', auth: true }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE', auth: true }),

  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/uploads', { method: 'POST', formData: fd, auth: true });
  },
};
