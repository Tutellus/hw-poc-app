import { useMainContext } from "@/state/main.context";
import { useState } from "react";
import { LoginForm } from "../modules/LoginForm"

export const Login = () => {
  const { logIn, loggingIn } = useMainContext();
  const [email, setEmail] = useState("");

  const emailChangeFn = (e) => {
    setEmail(e.target.value)
  };

  return <LoginForm
    loggingIn={loggingIn}
    email={email}
    emailChangeFn={emailChangeFn}
    submitFn={() => logIn(email)}
  />
}
