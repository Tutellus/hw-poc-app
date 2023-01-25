import { useSession } from "@/state/session.context"

export const Account = () => {

  const { session } = useSession()

  if (!session) return null

  return (
    <div className="box">
      <div className="title">My account</div>
      <div className="data">{session.email}</div>
    </div>
  )
}