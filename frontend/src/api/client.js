import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

const client = axios.create({
    baseURL: apiBaseUrl ? `${apiBaseUrl}/api/v1` : '/api/v1',
    // Render free web services can take tens of seconds to wake up.
    timeout: 70000,
    headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

client.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';
        const isAuthEndpoint = requestUrl.includes('/auth/request-otp') || requestUrl.includes('/auth/verify-otp');
        const onAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

        if (status === 401 && !isAuthEndpoint && !onAuthPage) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;
