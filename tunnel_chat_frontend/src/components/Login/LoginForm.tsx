import styled from "styled-components";
import Input from "../atoms/Input/Input";
import { MdEmail, MdLock } from "react-icons/md";
import Button from "../atoms/Button/Button";

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background: black;
  color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
`;

interface LoginFormProps {
  email: string;
  password: string;
  error: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <FormContainer>
      <Title>Login</Title>
      <Form onSubmit={onSubmit}>
        <Input
          type="email"
          id="email"
          name="email"
          value={email}
          placeholder="Enter your email"
          onChange={onEmailChange}
          icon={<MdEmail />}
        />
        <Input
          type="password"
          id="password"
          name="password"
          value={password}
          placeholder="Enter your password"
          onChange={onPasswordChange}
          icon={<MdLock />}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button variant="submit">Login</Button>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;
