import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tgToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || "";

    if (status === 401) {
      // Let login/register failures surface to the form without a forced redirect
      if (
        reqUrl.includes("/auth/login") ||
        reqUrl.includes("/auth/register")
      ) {
        return Promise.reject(error);
      }

      // If this 401 was for an older Bearer than what's in storage, ignore global logout
      // (e.g. stale /auth/me in flight after a successful new login)
      const sent = error.config?.headers?.Authorization;
      const stored = localStorage.getItem("tgToken");
      if (sent && stored && sent !== `Bearer ${stored}`) {
        return Promise.reject(error);
      }

      localStorage.removeItem("tgToken");
      localStorage.removeItem("tgUser");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ========== AUTH ==========
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  googleAuth: (credential) => api.post("/auth/google", { credential }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put("/auth/change-password", data),
  getMe: () => api.get("/auth/me"),
};

// ========== PRODUCTS ==========
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: () => api.get("/products/featured"),
  getCategories: () => api.get("/products/categories"),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ========== ORDERS ==========
export const orderAPI = {
  create: (data) => api.post("/orders", data),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// ========== PAYMENT ==========
export const paymentAPI = {
  getBankDetails: () => api.get("/payment/bank-details"),
  initPaystack: (orderId) =>
    api.post("/payment/paystack/initialize", { orderId }),
  verifyPaystack: (reference) =>
    api.post("/payment/paystack/verify", { reference }),
  confirmBankTransfer: (data) =>
    api.post("/payment/bank-transfer/confirm", data),
  verifyPaypal: (data) => api.post("/payment/paypal/verify", data),
};

// ========== CART ==========
export const cartAPI = {
  validate: (items) => api.post("/cart/validate", { items }),
  getShippingCost: (subtotal) =>
    api.get("/cart/shipping-cost", { params: { subtotal } }),
};

// ========== USERS ==========
export const userAPI = {
  updateProfile: (data) => api.put("/users/profile", data),
  addAddress: (data) => api.post("/users/addresses", data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  toggleWishlist: (productId) => api.put(`/users/wishlist/${productId}`),
  getWishlist: () => api.get("/users/wishlist"),
};

export default api;
