import { useHuman } from "@/state/human.context"
import { TrxTypeView } from "./TrxTypeView"

export const TrxTypeViewerList = () => {
  const { userOps } = useHuman()

  return (
    <div className="box">
      <div className="title">User Operations</div>
      <div className="data">
        {userOps?.length > 0 &&
          userOps.map((userOp, index) => (
            <TrxTypeView key={index} trxData={userOp} />
          ))}
      </div>
    </div>
  )
}
