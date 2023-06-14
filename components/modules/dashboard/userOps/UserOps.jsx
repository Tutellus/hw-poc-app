import { useHuman } from "@/state/human.context"
import { UserOp } from "./UserOp"

export const UserOps = () => {
  const { userOps } = useHuman()

  return (
    <div
      className="box"
      style={{
        gridColumn: "3 / 5",
      }}
    >
      <div className="title">User Operations</div>
      <div className="data">
        {userOps.length > 0 &&
          userOps.map((userOp, index) => (
            <UserOp key={index} userOp={userOp} />
          ))}
      </div>
    </div>
  )
}
