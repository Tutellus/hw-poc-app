import { useSession } from "@/state/session.context";
import { truncateAddress } from "@/utils/address";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export const Web3 = () => {
  const { session, proxy, loadProxy } = useSession();
  const [{ wallet }, connect] = useConnectWallet();
  const [requestingWallet, setRequestingWallet] = useState(false)
  const [confirmingWallet, setConfirmingWallet] = useState(false)

  const [web3Address, setWeb3Address] = useState(null)
  const [externalWalletCode, setExternalWalletCode] = useState(null)

  const existsExternalWallet = proxy?.externalWallet?.address;
  const externalWallet = existsExternalWallet ? proxy?.externalWallet?.address : web3Address;
  const externalWalletIsPending = proxy?.externalWallet?.status === 'PENDING';
  
  const requestExternalWallet = async () => {
    if (web3Address) {
      setRequestingWallet(true)
      const web3provider = new ethers.providers.Web3Provider(wallet.provider)
      const signer = web3provider.getSigner()
      const message = `I am the owner of this account ${session.email} and this wallet ${web3Address} and I want to add this wallet to my shared wallet`
      const signature = await signer.signMessage(message);
      await fetch('/api/usecases/proxies/requestAddOwner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          signature,
          proxyId: proxy._id,
          user: session,
        }),
      });
      await loadProxy()
      setRequestingWallet(false)
    }
  }

  const confirmExternalWallet = async () => {
    setConfirmingWallet(true)
    await fetch('/api/usecases/proxies/confirmAddOwner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: externalWalletCode,
        user: session,
      }),
    })
    await loadProxy()
    setConfirmingWallet(false)
  }

  useEffect(() => {
    if (wallet) {
      const firstAddress = wallet?.accounts[0]?.address
      if (firstAddress) {
        setWeb3Address(firstAddress)
      }
    }
  }, [wallet])

  useEffect(() => {
    if (proxy) {
      setExternalWalletCode(proxy?.externalWallet?.code2fa)
    }
  }, [proxy])

  return (
    <div className="box">

      {/* title */}
      <div className="title">My external wallet</div>

      {/* data */}
      <div className="data">

        {/* if there is an external wallet on Proxy or connected show it */}
        {externalWallet && <div> {truncateAddress(externalWallet)}</div>}
        
        {/* if there is an external wallet pending */}
        {existsExternalWallet && externalWalletIsPending &&
          <div style={{
            display: 'flex',
            gap: '10px',
          }}>
            <input
              disabled={confirmingWallet}
              type="text"
              value={externalWalletCode}
              placeholder="Insert 2fa code"
              onChange={(e) => setExternalWalletCode(e.target.value)}
            ></input>
            <button 
              disabled={confirmingWallet}
              onClick={() => confirmExternalWallet() }
            >{confirmingWallet ? 'Confirming...' : 'Confirm'}</button>
          </div>
        }

        {/* if there is connected wallet but no external wallet on proxy */}
        {
          web3Address && !existsExternalWallet &&
          <button
            disabled={requestingWallet}
            onClick={() => requestExternalWallet()}
          >{requestingWallet ? 'Requesting...' : 'Request as owner'}</button>
        }

        {!externalWallet && <button onClick={() => connect()}>Connect</button> }

      </div>
    
    </div>
  );

}