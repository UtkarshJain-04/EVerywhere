const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'chargenav_auth_token';
const USER_KEY = 'chargenav_user_profile';

export const authStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },
  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
  },
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data.message) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;

      if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/signup')) {
        authStorage.clear();
        window.dispatchEvent(new Event('chargenav-auth-change'));
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    throw new Error(
      error.message || 'Unable to connect to the ChargeNav server. Please verify your connection.'
    );
  }
}

export const api = {
  auth: {
    signup: async (userData) => {
      const data = await request('/auth/signup', {
        method: 'POST',
        body: userData,
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
        window.dispatchEvent(new Event('chargenav-auth-change'));
      }
      return data;
    },
    login: async (credentials) => {
      const data = await request('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      if (data.token) {
        authStorage.setToken(data.token);
        authStorage.setUser(data.user);
        window.dispatchEvent(new Event('chargenav-auth-change'));
      }
      return data;
    },
    getMe: async () => {
      return request('/auth/me', { method: 'GET' });
    },
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch {
        // Proceed with local cleanup regardless of network
      } finally {
        authStorage.clear();
        window.dispatchEvent(new Event('chargenav-auth-change'));
      }
    },
  },

  stations: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/stations${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    getById: (id) => {
      return request(`/stations/${id}`, { method: 'GET' });
    },
  },

  recommendations: {
    getForCoordinates: (query) => {
      return request('/recommendations', {
        method: 'POST',
        body: query,
      });
    },
    planRoute: (routeQuery) => {
      return request('/recommendations/route', {
        method: 'POST',
        body: routeQuery,
      });
    },
  },
};

export default api;
