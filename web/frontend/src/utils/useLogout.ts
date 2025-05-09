import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        const windowWithWS = window as unknown as { wsConnection?: WebSocket };
        if (windowWithWS.wsConnection?.readyState === WebSocket.OPEN) {
            windowWithWS.wsConnection.close();
        }

        navigate('/login');
    };

    return logout;
};
