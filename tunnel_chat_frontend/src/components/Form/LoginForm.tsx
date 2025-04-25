import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleLoginButton from '@/components/Atoms/Button/GoogleSignIn';

type AuthForm = {
    error: string;
    onGoogleLogin: (accessToken: string) => void;
    connectionStatus: string;
};

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
    background: black;
    color: white;
    overflow: hidden;
    position: relative;
`;

const TitleText = styled.h2`
    background: linear-gradient(to right, #60a5fa, #2563eb);
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    font-family: monospace;
    letter-spacing: 0.1em;
    font-size: 2.2rem;
    text-align: center;
    margin: 0 0 40px 0;
`;

const StatusContainer = styled.div`
    position: absolute;
    bottom: 80px;
    left: 0;
    right: 0;
    text-align: center;
    color: rgb(180, 78, 90);
    font-family: monospace;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
`;

const ErrorMessageContainer = styled.div`
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    text-align: center;
    color: rgb(255, 0, 0);
    font-family: monospace;
    font-size: 1rem;
    letter-spacing: 0.05em;
`;

export default function LoginForm({ error, onGoogleLogin, connectionStatus }: AuthForm) {
    const handleGoogleLogin = async (accessToken: string) => {
        try {
            await onGoogleLogin(accessToken);
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
            },
        },
    };

    const statusVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.5,
                duration: 0.5,
            },
        },
    };

    return (
        <FormContainer>
            <AnimatePresence>
                <motion.div initial="hidden" animate="visible" variants={titleVariants}>
                    <TitleText>Login</TitleText>
                </motion.div>
            </AnimatePresence>
            <GoogleLoginButton
                onSuccess={handleGoogleLogin}
                onError={(error) => console.error('Google login error:', error)}
            />
            {error && <ErrorMessageContainer>{error}</ErrorMessageContainer>}
            <motion.div initial="hidden" animate="visible" variants={statusVariants}>
                <StatusContainer>{connectionStatus} • Encryption: AES-256</StatusContainer>
            </motion.div>
        </FormContainer>
    );
}
