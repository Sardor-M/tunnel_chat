import { useState } from "react";
import LoginForm from "../components/Login/LoginForm";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    console.log("Logging in with:", { email, password });
  };

  return (
    <LoginForm
      email={email}
      password={password}
      error={error}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleLogin}
    />
  );
}
