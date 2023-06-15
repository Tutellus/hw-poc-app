import { explorerLink, truncateAddress } from "@/utils/address"
import { ethers } from "ethers"

export const PreUserOp = ({
  preUserOp,
  canSign,
  confirmSignAndSubmitFn,
  signAndSubmitFn,
}) => {
  const renderParam = (param) => {
    if (ethers.utils.isAddress(param)) {
      return truncateAddress({
        address: param,
        stringify: true,
      })
    }
    return param
  }

  const renderParams = (params) => {
    if (!params) return ""
    return params.reduce((acc, param) => {
      if (acc === "") {
        return renderParam(param)
      }
      return `${acc}, ${renderParam(param)}`
    }, "")
  }

  const requiresConfirmation =
    preUserOp.isMasterRequired && preUserOp.masterSignature === "0x"
  const isSignable = !requiresConfirmation && preUserOp.status === "SIGNABLE"

  return (
    <div className="proposal">
      <div className="block">
        <div className="keys">
          <div>ID</div>
          <div>Contract</div>
          <div>Function</div>
          <div>Params</div>
          <div>Status</div>
          <div>Date</div>
        </div>
        <div className="values">
          <div>{preUserOp._id}</div>
          <a
            style={{ color: "white" }}
            href={explorerLink({ value: preUserOp.target, type: "address" })}
            target="_blank"
            rel="noreferrer"
          >
            {truncateAddress({
              address: preUserOp.target,
            })}
          </a>
          <div>{preUserOp.method}</div>
          <div>{renderParams(preUserOp.params)}</div>
          <div>{preUserOp.status}</div>
          <div>{preUserOp.createdAt}</div>
        </div>
      </div>

      {requiresConfirmation && (
        <div className="block">
          <input type="text" placeholder="2FA Code" value={preUserOp.code2fa} />
          <button onClick={() => confirmSignAndSubmitFn(preUserOp)}>
            {" "}
            Verify{" "}
          </button>
        </div>
      )}

      {isSignable && (
        <div className="block">
          <button
            disabled={!canSign}
            onClick={() =>
              signAndSubmitFn({
                preUserOpId: preUserOp._id,
              })
            }
          >
            {" "}
            Sign{" "}
          </button>
        </div>
      )}
    </div>
  )
}
