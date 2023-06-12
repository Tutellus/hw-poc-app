import { useWeb3Auth } from "@/state/web3auth.context"
import { web3AuthSDK } from "@/sdk"

export const Login = () => {
  const { logIn, user, isLoggingIn } = web3AuthSDK

  console.log({ logIn, user })

  return (
    <div className="login">
      <button type="submit" onClick={logIn} disabled={user}>
        {isLoggingIn ? "Logging in..." : "Log in"}
      </button>
    </div>
  )
}
