import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import googleLogo from '@/assets/logo/google.svg';

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
  }
`;

const commonStyles = {
    colors: {
        primaryBlue: '#4285F4',
        primaryBlueHover: '#3c7ae4',
        secondaryBlue: '#5b9aff',
        secondaryBlueHover: '#5292f7',
        disabledBlue: '#6fa0e6',
        white: '#ffffff',
        error: '#ff3333',
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        fontWeight: '500',
        fontSize: '14px',
        letterSpacing: '0.25px',
    },
    dimensions: {
        buttonHeight: '44px',
        buttonMaxWidth: '280px',
        iconSize: '18px',
        iconContainerSize: '36px',
        borderRadius: '24px',
    },
    spacing: {
        paddingRight: '24px',
        paddingLeft: '54px',
        iconLeft: '4px',
    },
    transitions: {
        default: 'all 0.3s ease',
        shine: 'transform 0.8s',
    },
    shadows: {
        button: '0 2px 8px rgba(66, 133, 244, 0.4)',
        buttonHover: '0 4px 12px rgba(66, 133, 244, 0.5)',
        buttonActive: '0 2px 4px rgba(66, 133, 244, 0.4)',
        icon: '0 1px 3px rgba(0, 0, 0, 0.12)',
    },
};

const GoogleButton = styled.button`
    background-color: ${commonStyles.colors.primaryBlue};
    background-image: linear-gradient(135deg, ${commonStyles.colors.primaryBlue}, ${commonStyles.colors.secondaryBlue});
    color: ${commonStyles.colors.white};
    text-transform: none;
    font-family: ${commonStyles.typography.fontFamily};
    font-weight: ${commonStyles.typography.fontWeight};
    font-size: ${commonStyles.typography.fontSize};
    letter-spacing: ${commonStyles.typography.letterSpacing};
    height: ${commonStyles.dimensions.buttonHeight};
    padding: 0 ${commonStyles.spacing.paddingRight} 0 ${commonStyles.spacing.paddingLeft};
    position: relative;
    border-radius: ${commonStyles.dimensions.borderRadius};
    box-shadow: ${commonStyles.shadows.button};
    transition: ${commonStyles.transitions.default};
    max-width: ${commonStyles.dimensions.buttonMaxWidth};
    width: 100%;
    overflow: hidden;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: ${commonStyles.colors.primaryBlueHover};
        background-image: linear-gradient(
            135deg,
            ${commonStyles.colors.primaryBlueHover},
            ${commonStyles.colors.secondaryBlueHover}
        );
        box-shadow: ${commonStyles.shadows.buttonHover};
        transform: translateY(-1px);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
        transform: translateX(-100%);
        transition: ${commonStyles.transitions.shine};
    }

    &:hover::before {
        transform: translateX(100%);
    }

    &:active {
        transform: translateY(1px);
        box-shadow: ${commonStyles.shadows.buttonActive};
    }

    &:disabled {
        background-color: ${commonStyles.colors.disabledBlue};
        background-image: linear-gradient(135deg, ${commonStyles.colors.disabledBlue}, #89b3ff);
        opacity: 0.8;
        box-shadow: none;
        color: ${commonStyles.colors.white};
        cursor: not-allowed;
    }
`;

const GoogleIconContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: ${commonStyles.spacing.iconLeft};
    top: 50%;
    transform: translateY(-50%);
    width: ${commonStyles.dimensions.iconContainerSize};
    height: ${commonStyles.dimensions.iconContainerSize};
    background-color: ${commonStyles.colors.white};
    border-radius: 50%;
    z-index: 2;
    box-shadow: ${commonStyles.shadows.icon};
    animation: ${pulseAnimation} 2s infinite;
`;

const GoogleLogo = styled.img`
    width: ${commonStyles.dimensions.iconSize};
    height: ${commonStyles.dimensions.iconSize};
`;

const ButtonWrapper = styled.div`
    width: 100%;
    max-width: 280px;
    position: relative;
    margin: 0 auto;
`;

const LoadingSpinner = styled.div`
    width: 18px;
    height: 18px;
    border: 2px solid #ffffff;
    border-top: 2px solid #4285f4;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

type GoogleLoginButtonProps = {
    onSuccess: (accessToken: string) => Promise<void>;
    onError: (error: any) => void;
};

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                await onSuccess(tokenResponse.access_token);
            } catch (error) {
                onError(error);
            } finally {
                setIsLoading(false);
            }
        },
        onError: (errorResponse) => {
            onError(errorResponse);
            setIsLoading(false);
        },
        flow: 'implicit',
    });

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.03 },
        tap: { scale: 0.98 },
    };

    return (
        <ButtonWrapper>
            <motion.div initial="initial" whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <GoogleButton
                    onClick={() => {
                        setIsLoading(true);
                        login();
                    }}
                    disabled={isLoading}
                >
                    <GoogleIconContainer>
                        {isLoading ? <LoadingSpinner /> : <GoogleLogo src={googleLogo} alt="Google Logo" />}
                    </GoogleIconContainer>
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                </GoogleButton>
            </motion.div>
        </ButtonWrapper>
    );
}
