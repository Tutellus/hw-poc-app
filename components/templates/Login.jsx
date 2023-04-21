import { useWeb3Auth } from "@/state/web3auth.context";

export const Login = () => {
  const { logIn, logOut, web3Auth, loggingIn } = useWeb3Auth();
  return (
    <div className="login">
      <button
        type="submit"
        onClick={logIn}
        disabled={loggingIn}
      >{loggingIn ? 'Logging in...' : 'Log in'}</button>
      <button
        type="submit"
        onClick={logOut}
        disabled={!web3Auth}
      >{'Log Out'}</button>
    </div>
  )
}
