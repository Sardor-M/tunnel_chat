import styled from 'styled-components';
import React from 'react';

type PositionAlignments = 'left' | 'right' | 'full' | 'center';
type ButtonVariant = 'submit' | 'cancel' | 'danger' | 'success' | 'info' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

type ButtonProps = {
    children: React.ReactNode;
    position?: PositionAlignments;
    onClick?: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    style?: React.CSSProperties;
    type?: 'button' | 'submit' | 'reset';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    size?: ButtonSize;
    rounded?: boolean;
    fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const StyledButton = styled.button<{
    variant: ButtonVariant;
    position: PositionAlignments;
    size: ButtonSize;
    rounded: boolean;
    fullWidth: boolean;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    font-weight: 500;
    outline: none;

    ${({ size }) => {
        switch (size) {
            case 'small':
                return `
          padding: 6px 12px;
          font-size: 12px;
          height: 32px;
        `;
            case 'large':
                return `
          padding: 12px 24px;
          font-size: 16px;
          height: 48px;
        `;
            default: // medium
                return `
          padding: 10px 20px;
          font-size: 14px;
          height: 40px;
        `;
        }
    }};

    border-radius: ${({ rounded }) => (rounded ? '24px' : '6px')};

    ${({ position, fullWidth }) => {
        if (fullWidth) return 'width: 100%;';

        switch (position) {
            case 'left':
                return 'align-self: flex-start;';
            case 'right':
                return 'align-self: flex-end;';
            case 'center':
                return 'align-self: center;';
            case 'full':
                return 'width: 100%;';
            default:
                return '';
        }
    }};

    ${({ variant }) => {
        switch (variant) {
            case 'submit':
                return `
          background-color: #0078d7;
          color: white;
          &:hover:not(:disabled) {
            background-color: #0264B3;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 120, 215, 0.3);
          }
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
            case 'cancel':
                return `
          background-color: #f3f3f3;
          color: #333333;
          &:hover:not(:disabled) {
            background-color: #e8e8e8;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
            case 'danger':
                return `
          background-color: #dc3545;
          color: white;
          &:hover:not(:disabled) {
            background-color: #c82333;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          }
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
            case 'success':
                return `
          background-color: #28a745;
          color: white;
          &:hover:not(:disabled) {
            background-color: #218838;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
          }
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
            case 'info':
                return `
          background-color: #17a2b8;
          color: white;
          &:hover:not(:disabled) {
            background-color: #138496;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
          }
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
            case 'outline':
                return `
          background-color: transparent;
          color: #0078d7;
          border: 2px solid #0078d7;
          &:hover:not(:disabled) {
            background-color: #0078d7;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 120, 215, 0.3);
          }
          &:active:not(:disabled) {
            transform: translateY(1px);
          }
        `;
            case 'ghost':
                return `
          background-color: transparent;
          color: #0078d7;
          &:hover:not(:disabled) {
            background-color: rgba(0, 120, 215, 0.1);
          }
        `;
            default:
                return `
          background-color: #0078d7;
          color: white;
          &:hover:not(:disabled) {
            background-color: #0264B3;
          }
        `;
        }
    }};

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
`;

const IconWrapper = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

/**
 * Button - Atom Component
 * @param {React.ReactNode} children - Button text or elements
 */
export default function Button({
    children,
    icon,
    iconPosition = 'left',
    position = 'left',
    variant = 'submit',
    size = 'medium',
    rounded = false,
    fullWidth = false,
    ...props
}: ButtonProps) {
    return (
        <StyledButton
            variant={variant}
            position={position}
            size={size}
            rounded={rounded}
            fullWidth={fullWidth}
            {...props}
        >
            {icon && iconPosition === 'left' && <IconWrapper>{icon}</IconWrapper>}
            {children}
            {icon && iconPosition === 'right' && <IconWrapper>{icon}</IconWrapper>}
        </StyledButton>
    );
}
