import { useWeb3Auth } from "@/state/web3auth.context"
import { web3AuthSDK } from "@/sdk"

export const Login = () => {
  const { logIn, user, loggingIn } = useWeb3Auth()

  console.log({ logIn, user })

  return (
    <div className="login">
      <button type="submit" onClick={logIn} disabled={user}>
        {loggingIn ? "Logging in..." : "Log in"}
      </button>
    </div>
  )
}
