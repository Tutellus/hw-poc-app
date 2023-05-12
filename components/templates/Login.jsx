import { useWeb3Auth } from "@/state/web3auth.context";

export const Login = () => {
  const { logIn, loading, loggingIn, user } = useWeb3Auth();
  return (
    <div className="login">
      <button
        type="submit"
        onClick={logIn}
        disabled={loading || loggingIn || user}
      >{loggingIn ? 'Logging in...' : 'Log in'}</button>
    </div>
  )
}
