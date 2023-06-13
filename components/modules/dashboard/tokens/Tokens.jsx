import { useState, useEffect } from "react"
import { useContract } from "@/state/contract.context"
import { ethers } from "ethers"
import { useWeb3Auth } from "@/state/web3auth.context"
import { contractSDK, humanSDK } from "@/sdk"

export const Tokens = () => {
  const { projectId, user, web3Provider } = useWeb3Auth()
  const { loadingContract, contract, balance } = useContract()

  // state
  const [address, setAddress] = useState(null)
  const [human, setHuman] = useState(null)

  const [minting, setMinting] = useState(false)
  const { updateContract } = contractSDK
  const {
    requestPreUserOp,
    signAndSubmitPreUserOp,
    loadHuman,
    loadHumanAddress,
  } = humanSDK

  const canMint = human?.status === "CONFIRMED"

  const loadHumanAddressData = async () => {
    const address = await loadHumanAddress({ user })
    setAddress(address)
  }

  const loadHumanData = async () => {
    const human = await loadHuman({ user })
    setHuman(human)
  }

  useEffect(() => {
    loadHumanAddressData({ user })
    loadHumanData({ user })
    const interval = setInterval(() => {
      loadHumanAddressData()
      loadHumanData({ user })
    }, 5000)
    return () => clearInterval(interval)
  }, [user])

  const requestMint = async () => {
    setMinting(true)

    // 1. creates preUserOp which evaluates if master signature is required
    const preUserOp = await requestPreUserOp({
      human,
      user,
      projectId,
      method: "mint",
      params: [address, ethers.utils.parseEther("5")],
      value: ethers.utils.parseEther("0"),
    })

    if (preUserOp.status === "SIGNABLE") {
      signAndSubmitPreUserOp({
        preUserOpId: preUserOp._id,
        web3Provider,
        user,
        human,
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
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {contract ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={!canMint}
                onClick={requestMint}
              >
                {minting ? "Processing..." : "Mint 5 tokens"}
              </button>
            </div>
          ) : (
            <button disabled={loadingContract} onClick={updateContract}>
              {loadingContract ? "Loading..." : "Load contract"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
