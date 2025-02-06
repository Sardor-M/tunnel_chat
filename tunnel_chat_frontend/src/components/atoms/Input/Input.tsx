import React from "react";
import styled from "styled-components";


const StyledDivContainer = styled.div`
  flex-direction: column;
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 13px;
  margin: 1px 0;
  border: 0.5px solid #b1bdc8;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(229, 229, 229, 0.1);
  outline: none;
  font-size: 13px;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    border-color: #3966fb;
    box-shadow: 0 0 5px rgba(57, 102, 251, 0.5);
  }
`;
const StyledErrorText = styled.p`
  display: block;
  color: red;
  font-size: 12px;
  margin-top: 3.5 px; // input tag tagiga show qiladi,
  text-align: left;
`;

const InputIconContainer = styled.div`
  position: absolute;
  /* margin: 10px; */
  padding: 12px 14px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  right: 10px;
  pointer-events: none; /* Makes the icon non-interactive 
  /* background-color: #f1f1f1;
  border-radius: 5px 0 0 5px;
  color: #b1bdc8; */
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  error?: string | boolean;
  icon?: React.ReactNode;
}

export default function Input({ id, icon, error, ...props }: InputProps) {
  const [showIcon, setShowIcon] = React.useState<boolean>(
    !props.value || props.value === ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowIcon(e.target.value === "" || e.target.value === undefined);
    if (props.onChange) {
      // call the onchange function
      props.onChange(e); 
    }
  };

  // input value ni visibilitiesni korsatadi qachonki value o'zgarsa
  React.useEffect(() => {
    setShowIcon(!props.value || props.value === "");
  }, [props.value]);

  return (
    <>
      <StyledDivContainer>
        <StyledInput id={id} {...props} onChange={handleChange} />
        {error && <StyledErrorText> {error}</StyledErrorText>}
        {icon && showIcon && <InputIconContainer>{icon}</InputIconContainer>}
      </StyledDivContainer>
    </>
  );
}