import { useMainContext } from "@/state/main.context";
import { useState } from "react";
import { VerifyForm } from "../modules/VerifyForm";

export const Verify = () => {
  const [verifying, setVerifying] = useState(false);
  const { session, setSession, logOut } = useMainContext();
  const [code, setCode] = useState("");

  const codeChangeFn = (e) => {
    setCode(e.target.value)
  };

  const submitFn = async () => {
    setVerifying(true)
    const response = await fetch('/api/usecases/users/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: session, code: session.verifyCode }), // hack
    })
    const { user } = await response.json()
    setSession(user);
    setVerifying(false)
  }

  return <div>
    <VerifyForm
      verifying={verifying}
      code={code}
      codeChangeFn={codeChangeFn}
      submitFn={submitFn}
    />
    <button disabled={verifying} onClick={logOut}>Logout</button>
  </div> 
}
