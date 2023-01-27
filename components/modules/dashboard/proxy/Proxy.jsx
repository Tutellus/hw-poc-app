import { useSession } from "@/state/session.context"
import { truncateAddress } from "@/utils/address";
import { getExplorerUrl } from "@/utils/explorer";

export const Proxy = () => {

  const { assigningProxy, proxy, loadingProxy, loadProxy } = useSession()

  return (
    <div className="box">
      <div className="title">My wallet</div>
      {assigningProxy
        ? <div>Assigning wallet...</div>
          : proxy
            ? <div
                style={{
                  cursor: 'pointer',
                }}
                className="data"
                onClick={() => window.open(getExplorerUrl(process.env.CHAIN_ID || 5, 'address', proxy.address), '_blank')}
              >{truncateAddress(proxy.address)}</div>
            : <button disabled={loadingProxy} onClick={() => loadProxy()}>Connect</button>
        }
    </div>
  )

}