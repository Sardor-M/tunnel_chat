import styled from "styled-components";

type PositionAlignments = "left" | "right" | "full" | "center";

interface ButtonProps {
  children: React.ReactNode;
  position: PositionAlignments;
  onClick?: () => void;
  variant?: "submit" | "reset" | "add";
  disabled?: boolean;
}

const StyledButton = styled.button<{
  variant: string;
  position: PositionAlignments;
}>`
  padding: 10px 16px;
  border: none;
  padding: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  font-size: 14px;
  font-weight: bold;

  ${({ position }) => {
    switch (position) {
      case "left":
        return "align-self: flex-start;";
      case "right":
        return "align-self: flex-end;";
      case "center":
        return "display: block; margin-left: auto; margin-right: auto;";
      case "full":
        return "width: 100%";
      default:
        return "width: 100%";
    }
  }}

  background: ${({ variant }) =>
    variant === "submit" ? "#61ADFF" : variant === "reset" ? "#FF3333" : "#3333FF"};
  color: white;

  &:hover {
    background: ${({ variant }) =>
      variant === "submit"
        ? "#0582CA"
        : variant === "reset"
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
  position = "full",
  onClick,
  variant = "submit",
  disabled,
}) => {
  return (
    <StyledButton
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      position={position}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
