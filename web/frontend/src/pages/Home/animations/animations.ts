import { keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(0.5deg); }
  75% { transform: translateY(3px) rotate(-0.5deg); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(63, 135, 219, 0.1); }
  50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(63, 135, 219, 0.3); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(63, 135, 219, 0.1); }
`;

export const subtleGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.2); }
  50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.4); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.2); }
`;

export const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

export const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
  }
`;
