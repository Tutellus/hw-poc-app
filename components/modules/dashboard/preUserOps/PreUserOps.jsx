import { useHuman } from "@/state/human.context"
import { PreUserOp } from "./PreUserOp"

export const PreUserOps = () => {
  const { preUserOps, processing, confirmPreUserOp, signAndSubmitPreUserOp } =
    useHuman()

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

  console.log({ preUserOps })

  return (
    <div
      className="box"
      style={{
        gridColumn: "1 / 5",
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
