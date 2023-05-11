import { useWeb3Auth } from "@/state/web3auth.context";

export const Login = () => {
  const { logIn, logOut, loggingIn, user } = useWeb3Auth();
  return (
    <div className="login">
      <button
        type="submit"
        onClick={logIn}
        disabled={loggingIn || user}
      >{loggingIn ? 'Logging in...' : 'Log in'}</button>
      <button
        type="submit"
        onClick={logOut}
        disabled={!user}
      >{'Log Out'}</button>
    </div>
  )
}
