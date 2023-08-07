import { explorerLink } from "@/utils/address"

export const TrxTypeView = ({ trxData }) => {
  const truncateHash = (hash) => {
    if (!hash) return "----"
    return hash.slice(0, 10) + "..." + hash.slice(-8)
  }

  const { _id, preUserOpId, nonce, receipt, status, createdAt } = trxData

  return (
    <div className="proposal">
      <div className="block">
        <div className="keys">
          <div>ID</div>
          <div>Proposal ID</div>
          <div>Nonce</div>
          <div>Hash</div>
          <div>Status</div>
          <div>Date</div>
        </div>
        <div className="values">
          <div>{_id}</div>
          <div>{preUserOpId}</div>
          <div>{nonce}</div>
          {receipt?.transactionHash ? (
            <a
              style={{ color: "white" }}
              href={explorerLink({
                type: "tx",
                value: receipt?.transactionHash,
              })}
              target="_blank"
              rel="noreferrer"
            >
              {truncateHash(receipt?.transactionHash)}
            </a>
          ) : (
            <div>----</div>
          )}
          <div>{status}</div>
          <div>{createdAt.toString()}</div>
        </div>
      </div>
    </div>
  )
}
