import { useSession } from "@/state/session.context"

export const Account = () => {

  const { session, logOut } = useSession()

  if (!session) return null

  return (
    <div className="box">
      <div className="title">My account</div>
      <div className="data">
        {session.email}
        <button onClick={logOut}>Logout</button>
      </div>
    </div>
  )
}