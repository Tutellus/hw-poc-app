import { useSession } from "@/state/session.context";
import { useState } from "react";
import { LoginForm } from "../modules/LoginForm"

export const Login = () => {
  const { logIn, loggingIn } = useSession();
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
