import { useSession, signOut } from "next-auth/react"

export const Account = () => {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className="box">
      <div className="title">My account</div>
      <div className="data">
        {user?.email || "No user"}
        <button onClick={() => signOut()}>Logout</button>
      </div>
    </div>
  )
}
