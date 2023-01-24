import { useMainContext } from "@/state/main.context";
import { useState } from "react";
import { VerifyForm } from "../modules/VerifyForm";

export const Verify = () => {

  const { session, verifying, verifyUser, logOut } = useMainContext();
  const [code, setCode] = useState(session?.verifyCode || '');

  const codeChangeFn = (e) => {
    setCode(e.target.value)
  };

  return <div>
    <VerifyForm
      verifying={verifying}
      code={code}
      codeChangeFn={codeChangeFn}
      submitFn={() => verifyUser(code)}
    />
    <button style={{
      position: 'absolute',
      bottom: 1,
      right: 1,
      margin: '1rem',
    }} disabled={verifying} onClick={logOut}>Logout</button>
  </div> 
}
