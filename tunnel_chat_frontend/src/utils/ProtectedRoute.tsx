import { authService } from '@/services/authService';
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

type ProtectedRouteProps = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isValidating, setIsValidating] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            try {
                if (!authService.isLoggedIn()) {
                    navigate('/login', { replace: true });
                    return;
                }

                await authService.ensureValidToken();
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Authentication error:', error);
                navigate('/login', { replace: true });
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [navigate]);

    if (isValidating) {
        return <div>Verifying authentication...</div>;
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
