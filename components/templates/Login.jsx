import { useMainContext } from "@/state/main.context";
import { useState } from "react";
import { LoginForm } from "../modules/LoginForm"

export const Login = () => {
  const [loggingIn, setLoggingIn] = useState(false);
  const { setSession } = useMainContext();
  const [email, setEmail] = useState("");

  const emailChangeFn = (e) => {
    setEmail(e.target.value)
  };

  const submitFn = async () => {
    setLoggingIn(true)
    const response = await fetch('/api/usecases/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    const { user } = await response.json()
    setSession(user);
    setLoggingIn(false)
  }

  return <LoginForm
    loggingIn={loggingIn}
    email={email}
    emailChangeFn={emailChangeFn}
    submitFn={submitFn}
  />
}
