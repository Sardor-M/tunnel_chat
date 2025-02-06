import styled from "styled-components";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "submit" | "rest" | "add"; 
  disabled?: boolean;
}

const StyledButton = styled.button<{ variant?: string }>`
  padding: 10px 16px;
  border: none;
  padding: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  font-size: 14px;
  font-weight: bold;
  width: 100%;

  background: ${({ variant }) =>
    variant === "submit"
      ? "#666"
      : variant === "rest"
      ? "#FF3333"
      : "#3333FF"};
  color: white;

  &:hover {
    background: ${({ variant }) =>
      variant === "submit"
        ? "#555"
        : variant === "rest"
        ? "#CC0000"
        : "#2222FF"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "submit",
  disabled,
}) => {
  return (
    <StyledButton onClick={onClick} variant={variant} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

export default Button;
