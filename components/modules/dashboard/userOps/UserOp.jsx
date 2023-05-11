import { explorerLink } from "@/utils/address";

export const UserOp = ({
  userOp,
}) => {

  const truncateHash = (hash) => {
    if (!hash) return ''
    return hash.slice(0, 10) + '...' + hash.slice(-8)
  }

  return (
    <div className="proposal">
      <div className="block">
        <div className="keys">
          <div>ID</div>
          <div>Proposal ID</div>
          <div>Nonce</div>
          <div>Hash</div>
          <div>Status</div>
        </div>
        <div className="values">
          <div>{userOp._id}</div>
          <div>{userOp.preUserOpId}</div>
          <div>{userOp.nonce}</div>
          <a
            style={{ color: 'white' }}
            href={explorerLink({
              type: 'tx',
              value: userOp.receipt?.transactionHash,
            })}
            target="_blank"
            rel="noreferrer"
          >{truncateHash(userOp.receipt?.transactionHash)}</a>
          <div>{userOp.status}</div>
        </div>
      </div>
  </div>
  )
}