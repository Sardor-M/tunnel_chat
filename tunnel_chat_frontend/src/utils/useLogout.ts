import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
    const navigate = useNavigate();

    const logout = () => {
        // Clear auth data from localStorage
        localStorage.removeItem('userToken');
        localStorage.removeItem('username');

        // Type-safe way to access a potentially non-existent property
        const windowWithWS = window as unknown as { wsConnection?: WebSocket };
        if (windowWithWS.wsConnection?.readyState === WebSocket.OPEN) {
            windowWithWS.wsConnection.close();
        }

        // Redirect to login page
        navigate('/login');
    };

    return logout;
};
