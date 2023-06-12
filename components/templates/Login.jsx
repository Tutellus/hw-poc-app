import { useWeb3Auth } from "@/state/web3auth.context"
import { web3AuthSDK } from "@/sdk"

export const Login = () => {
  const { loading, loggingIn, user } = useWeb3Auth()
  const { logIn } = web3AuthSDK

  return (
    <div className="login">
      <button
        type="submit"
        onClick={logIn}
        disabled={loading || loggingIn || user}
      >
        {loggingIn ? "Logging in..." : "Log in"}
      </button>
    </div>
  )
}
