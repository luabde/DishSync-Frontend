import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Update in .env for production
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Automatic logout on token expiration or unauthorized attempt
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;
