import { useSession } from "@/state/session.context"
import { truncateAddress } from "@/utils/address";
import { getExplorerUrl } from "@/utils/explorer";

export const Wallet = () => {

  const { did, assigningDid, loadingDid, loadDid } = useSession()

  return (
    <div className="box">
      <div className="title">My wallet</div>
      {assigningDid
        ? <div>Assigning wallet...</div>
          : did
            ? <div
                style={{
                  cursor: 'pointer',
                }}
                className="data"
                onClick={() => window.open(getExplorerUrl(process.env.CHAIN_ID || 5, 'address', did.address), '_blank')}
              >{truncateAddress(did.address)}</div>
            : <button disabled={loadingDid} onClick={() => loadDid()}>Connect</button>
        }
    </div>
  )

}