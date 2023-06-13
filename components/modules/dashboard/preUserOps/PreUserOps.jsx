import { useState, useEffect } from "react"
import { useHuman } from "@/state/human.context"
import { useWeb3Auth } from "@/state/web3auth.context"
import { PreUserOp } from "./PreUserOp"
import { humanSDK } from "@/sdk"

export const PreUserOps = () => {
  const [human, setHuman] = useState(null)
  const [preUserOps, setPreUserOps] = useState([])

  const { processing, confirmPreUserOp } = useHuman()
  const { user } = useWeb3Auth()

  const { signAndSubmitPreUserOp, loadPreUserOps, loadHuman } = humanSDK

  const loadHumanData = async () => {
    const human = await loadHuman({ user })
    setHuman(human)
  }

  const loadPreUserOpsData = async () => {
    const preUserOps = await loadPreUserOps({ human, user })
    setPreUserOps(preUserOps)
  }

  useEffect(() => {
    loadPreUserOpsData()
    const interval = setInterval(() => {
      loadPreUserOpsData()
    }, 5000)
    return () => clearInterval(interval)
  }, [human])

  useEffect(() => {
    loadHumanData({ user })
    const interval = setInterval(() => {
      loadHumanData({ user })
    }, 5000)
    return () => clearInterval(interval)
  }, [user])

  const confirmSignAndSubmitFn = async (preUserOp) => {
    try {
      const innerPreUserOp = await confirmPreUserOp({
        preUserOpId: preUserOp._id,
        code: preUserOp.code2fa,
      })
      await signAndSubmitPreUserOp({
        preUserOpId: innerPreUserOp._id,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      className="box"
      style={{
        gridColumn: "1 / 3",
      }}
    >
      <div className="title">Proposals</div>
      <div className="data">
        {preUserOps?.length > 0 &&
          preUserOps.map((preUserOp, index) => (
            <PreUserOp
              key={index}
              preUserOp={preUserOp}
              canSign={!processing}
              confirmSignAndSubmitFn={confirmSignAndSubmitFn}
              signAndSubmitFn={signAndSubmitPreUserOp}
            />
          ))}
      </div>
    </div>
  )
}
