import { useState, useEffect } from "react"
import { UserOp } from "./UserOp"
import { useWeb3Auth } from "@/state/web3auth.context"
import { humanSDK } from "@/sdk"

export const UserOps = () => {
  const [human, setHuman] = useState(null)
  const [userOps, setUserOps] = useState([])
  const { loadUserOps, loadHuman } = humanSDK
  const { user } = useWeb3Auth()

  const loadHumanData = async () => {
    const human = await loadHuman({ user })
    setHuman(human)
  }

  const loadUserOpsData = async () => {
    const userOps = await loadUserOps({ human, user })
    setUserOps(userOps)
  }

  useEffect(() => {
    loadUserOpsData()
    loadHumanData()
    const interval = setInterval(() => {
      loadHumanData()
      loadUserOpsData()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="box"
      style={{
        gridColumn: "3 / 5",
      }}
    >
      <div className="title">User Operations</div>
      <div className="data">
        {userOps?.length > 0 &&
          userOps.map((userOp, index) => (
            <UserOp key={index} userOp={userOp} />
          ))}
      </div>
    </div>
  )
}
