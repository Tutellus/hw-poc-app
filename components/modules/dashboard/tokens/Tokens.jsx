import { useState } from "react"
import { useContract } from "@/state/contract.context";
import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon";
import ExclamationTriangleIcon from "@heroicons/react/24/outline/ExclamationTriangleIcon";
import { useHuman } from "@/state/human.context";
import { ethers } from "ethers";

export const Tokens = () => {

  const { loadingContract, contract, balance, updateContract } = useContract();
  const { address, requestPreUserOp, requestPreUserOpHash, submitUserOp, signMessageFromOwner } = useHuman();

  const [minting, setMinting] = useState(false)

  const canMint = !minting;

  const requestMint = async () => {
    setMinting(true)
    // 1. creates preUserOp which evaluates if master signature is required
    const preUserOp = await requestPreUserOp({
      contractId: contract._id,
      method: 'mint',
      params: [address, ethers.utils.parseEther('5')],
      value: ethers.utils.parseEther('0'),
    })
    // 2. gets hash of preUserOp if is valid
    const hash = await requestPreUserOpHash({
      preUserOpId: preUserOp._id
    })
    // 3. signs hash with owner account (includes master signature if required)
    const signature = await signMessageFromOwner(hash)
    // 4. submits preUserOp with signature
    const userOp = await submitUserOp({
      preUserOpId: preUserOp._id,
      signature,
    })
    console.log({userOp})
    setMinting(false)
  }

  // const executeMintAndTransfer = async () => {
  //   setMinting(true)
  //   await mintAndTransfer()
  //   setMinting(false)
  // }

  return (
    <div className="box" style={{
      gridColumn: '1 / 3',
    }}>
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
                  {minting ? 'Processing...' : 'Mint'}
                  <ShieldCheckIcon style={{
                    marginLeft: '8px',
                    height: '20px',
                    width: '20px',
                  }} />
                  
                </button>
                {/* <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'red',
                  }}
                  disabled={!canMint}
                  onClick={executeMintAndTransfer}
                >
                  {minting ? 'Processing...' : 'Mint and transfer'}
                  <ExclamationTriangleIcon style={{
                    marginLeft: '8px',
                    height: '20px',
                    width: '20px',
                  }} />
                </button> */}
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