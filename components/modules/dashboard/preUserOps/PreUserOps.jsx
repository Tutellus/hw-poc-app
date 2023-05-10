import { useHuman } from "@/state/human.context";
import { truncateAddress } from "@/utils/address";

export const PreUserOps = () => {

  const { loadingPreUserOps, preUserOps, confirmPreUserOp, getPreUserOpHash, signMessageFromOwner, submitUserOp } = useHuman();

  const confirmSignAndSubmitFn = async (preUserOp) => {
    try {
      const innerPreUserOp = await confirmPreUserOp({
        preUserOpId: preUserOp._id,
        code: preUserOp.code2fa,
      });
      const hash = await getPreUserOpHash({
        preUserOpId: innerPreUserOp._id,
      })
      const signature = await signMessageFromOwner(hash)
      const userOp = await submitUserOp({
        preUserOpId: innerPreUserOp._id,
        signature,
      })
      console.log({ userOp })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="box" style={{
      gridColumn: '1 / 3',
    }}>
      <div className="title">Proposals</div>
      <div className="data">

        {loadingPreUserOps && <div> Loading PreUserOps... </div>}

        {preUserOps.length > 0 && (
          preUserOps.map((preUserOp, index) => (
            <div className="proposal" key={index}>
              <div className="proposal-data">
                <div>{truncateAddress(preUserOp.target)}</div>
                <div>{preUserOp.method}</div>
                <div>{JSON.stringify(preUserOp.params)}</div>
              </div>
              {preUserOp.isMasterRequired && preUserOp.masterSignature === '0x' && 
                <button onClick={() => confirmSignAndSubmitFn(preUserOp)}
                > Verify </button>
              }
            </div>
          ))
        )}

      </div>
    </div>
  )
}