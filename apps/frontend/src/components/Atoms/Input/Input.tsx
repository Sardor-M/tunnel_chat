import React from 'react';
import styled from 'styled-components';

const StyledDivContainer = styled.div`
    flex-direction: column;
    position: relative;
    width: 100%;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 13px;
    margin: 1px 0;
    background: black;
    color: white;
    border: 1px solid #0077c2;
    border-radius: 8px;
    box-shadow: 0 0 5px rgba(229, 229, 229, 0.1);
    outline: none;
    font-size: 13px;
    transition:
        border-color 0.2s ease-in-out,
        box-shadow 0.2s ease-in-out;

    &:focus {
        outline: none;
        border-color: #00a8ff;
    }
`;

const StyledErrorText = styled.p`
    display: block;
    color: red;
    font-size: 12px;
    margin: 0;
    min-height: 18px;
    line-height: 1.2;
`;

const InputIconContainer = styled.div`
    position: absolute;
    padding: 12px 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    right: 10px;
    pointer-events: none;
    border-radius: 5px 0 0 5px;
    color: #b1bdc8;
`;

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    error?: string | boolean;
    icon?: React.ReactNode;
};

/**
 * Input component with optional icon and error message.
 */
export default function Input({ id, icon, error, ...props }: InputProps) {
    const [showIcon, setShowIcon] = React.useState<boolean>(!props.value || props.value === '');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowIcon(e.target.value === '' || e.target.value === undefined);
        if (props.onChange) {
            props.onChange(e);
        }
    };

    // input value ni visibilitiesni korsatadi qachonki value o'zgarsa
    React.useEffect(() => {
        setShowIcon(!props.value || props.value === '');
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
