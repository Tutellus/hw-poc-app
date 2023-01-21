import { useMainContext } from "@/state/main.context";
import { useState } from "react";
import { VerifyForm } from "../modules/VerifyForm";

export const Verify = () => {

  const { verifying, verifyUser, logOut } = useMainContext();
  const [code, setCode] = useState("");

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
    <button disabled={verifying} onClick={logOut}>Logout</button>
  </div> 
}
