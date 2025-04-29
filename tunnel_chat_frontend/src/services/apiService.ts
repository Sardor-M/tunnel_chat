import { authService } from './authService';

const API_URL = 'http://localhost:8080/api';

export const apiService = {
    fetchWithAuth: async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
        try {
            const token = await authService.ensureValidToken();

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            };

            return fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    get: async (endpoint: string) => {
        const response = await apiService.fetchWithAuth(endpoint);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    },

    post: async (endpoint: string, data: any) => {
        const response = await apiService.fetchWithAuth(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    },
};
