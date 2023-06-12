import { web3AuthSDK } from "@/sdk"

export const Account = () => {
  const { user, logOut } = web3AuthSDK

  console.log({ user })

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
