import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import LoginForm from '@/components/Form/LoginForm';

/**
 * Login - Page Component
 * This component handles the login process for the application.
 * It checks if the user is already logged in and redirects them to the rooms page.
 */
export default function Login() {
    const [error, setError] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Ready to connect');
    const navigate = useNavigate();

    useEffect(() => {
        if (authService.isLoggedIn()) {
            navigate('/rooms');
        }
    }, [navigate]);

    const handleGoogleLogin = async (accessToken: string) => {
        setError('');
        setConnectionStatus('Authenticating with Google...');

        try {
            await authService.exchangeGoogleToken(accessToken);
            setConnectionStatus('Authentication successful');
            setTimeout(() => {
                navigate('/rooms');
            }, 1000);
        } catch (error: unknown) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                setError(error.message || 'Authentication failed');
            }
            setConnectionStatus('Authentication failed');
        }
    };

    return <LoginForm error={error} onGoogleLogin={handleGoogleLogin} connectionStatus={connectionStatus} />;
}
