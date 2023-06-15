import { web3AuthSDK } from "@/sdk"
import { useWeb3Auth } from "@/state/web3auth.context"

export const Account = () => {
  const { user, logOut } = useWeb3Auth()

  return (
    <div className="box">
      <div className="title">My account</div>
      <div className="data">
        {user?.email || "No user"}
        <button onClick={logOut}>Logout</button>
      </div>
    </div>
  )
}
