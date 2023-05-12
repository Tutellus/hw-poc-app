import { useState } from "react"
import { useContract } from "@/state/contract.context";
import { useHuman } from "@/state/human.context";
import { ethers } from "ethers";
import { useWeb3Auth } from "@/state/web3auth.context";

export const Tokens = () => {

  const { projectId } = useWeb3Auth();
  const { loadingContract, contract, balance, updateContract } = useContract();
  const { address, human, requestPreUserOp, signAndSubmitPreUserOp } = useHuman();

  const [minting, setMinting] = useState(false)

  const canMint = human?.status === 'CONFIRMED'

  const requestMint = async () => {
    setMinting(true)
    // 1. creates preUserOp which evaluates if master signature is required
    const preUserOp = await requestPreUserOp({
      projectId,
      chainId: contract.chainId,
      address: contract.address,
      method: 'mint',
      params: [address, ethers.utils.parseEther('5')],
      value: ethers.utils.parseEther('0'),
    })

    if (preUserOp.status === 'SIGNABLE') {
      signAndSubmitPreUserOp({
        preUserOpId: preUserOp._id,
      })
    }

    setMinting(false)
  }

  return (
    <div className="box">
      <div className="title">Token Interaction</div>
      <div className="data">
        <div>My balance: {balance}</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {contract 
            ? <div style={{
                display: 'flex',
                gap: '8px',
            }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  disabled={!canMint}
                  onClick={requestMint}
                >
                  {minting ? 'Processing...' : 'Mint 5 tokens'}

                </button>
              </div>
            : <button
                disabled={loadingContract}
                onClick={updateContract}
              >
                {loadingContract ? 'Loading...' : 'Load contract'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}