import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '';
const baseURL = rawBaseURL.replace(/\/+$/, '');
const PUBLIC_AUTH_PATHS = new Set(['/api/auth/login', '/api/auth/register']);

const axiosInstance = axios.create({
    baseURL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {};
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401 && !PUBLIC_AUTH_PATHS.has(error.config?.url || '')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth:unauthorized'));
                }
            }
            if (error.response.status === 500) {
                console.error('Server error occurred, please try again later.');
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout, please try again later.');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
