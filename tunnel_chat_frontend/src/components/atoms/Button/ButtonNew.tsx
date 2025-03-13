import React from 'react';
import styled, { css } from 'styled-components';

type ButtonPosition = 'left' | 'right' | 'center';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'add';
  position?: ButtonPosition;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const ButtonWrapper = styled.button<{
  variant: string;
  $position: ButtonPosition;
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  border: none;
  outline: none;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background: #2563eb;
          color: #fff;
          &:hover {
            background: #1d4ed8;
          }
        `;
      case 'secondary':
        return css`
          background: #e5e7eb;
          color: #1f2937;
          &:hover {
            background: #d1d5db;
          }
        `;
      case 'add':
        return css`
          background: #0ff;
          color: #000;
          &:hover {
            background: #00cccc;
          }
        `;
      default:
        return css`
          background: #2563eb;
          color: #fff;
          &:hover {
            background: #1d4ed8;
          }
        `;
    }
  }}
  
  ${props => props.disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background: ${props.variant === 'primary' ? '#2563eb' : 
                   props.variant === 'secondary' ? '#e5e7eb' :
                   props.variant === 'add' ? '#0ff' : '#2563eb'};
    }
  `}
  
  /* Position styles */
  ${props => {
    switch (props.$position) {
      case 'left':
        return css`
          position: absolute;
          bottom: 40px;
          left: 40px;
        `;
      case 'right':
        return css`
          position: absolute;
          bottom: 40px;
          right: 40px;
        `;
      case 'center':
        return css`
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
        `;
      default:
        return '';
    }
  }}
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  position,
  children,
  onClick,
  disabled,
  type = 'button',
  ...props
}) => {
  return (
    <ButtonWrapper
      variant={variant}
      $position={position || 'left'}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </ButtonWrapper>
  );
};

export default Button;