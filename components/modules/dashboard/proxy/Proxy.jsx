import { useWeb3Auth } from "@/state/web3auth.context";
import { truncateAddress } from "@/utils/address";
import { getExplorerUrl } from "@/utils/explorer";

export const Proxy = () => {

  const { assigningProxy, proxy, loadingProxy, loadProxy } = useWeb3Auth()

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
                onClick={() => window.open(getExplorerUrl(proxy.chainId, 'address', proxy.address), '_blank')}
              >{truncateAddress(proxy.address)}</div>
            : <button disabled={loadingProxy} onClick={() => loadProxy()}>Connect</button>
        }
    </div>
  )

}