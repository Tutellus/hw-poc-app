/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { useHuman } from "@/state/human.context"
import { ethers } from "ethers"
import Contract from "./Contract"

export const Tokens = () => {
  const { human, processingProposal, requestProposal, getTokensBalance } =
    useHuman()

  const [balance, setBalance] = useState("0")
  const [minting, setMinting] = useState(false)

  const canMint =
    human?.status === "CONFIRMED" && !minting && !processingProposal

  const requestMint = async () => {
    setMinting(true)
    const contractInterface = new ethers.utils.Interface(Contract.abi)
    const calldata = contractInterface.encodeFunctionData("mint", [
      human.address,
      ethers.utils.parseEther("5"),
    ])
    await requestProposal({
      title: "Mint 5 tokens",
      description: "We will mint 5 tokens for you",
      calls: [
        {
          target: Contract.address,
          method: "mint(address,uint256)",
          data: calldata,
          value: "0",
        },
      ],
    })
    setMinting(false)
  }

  const getTokenBalance = async () => {
    try {
      const response = await getTokensBalance([
        {
          token: Contract.address,
          type: "ERC20",
        },
      ])

      if (response) {
        const value = response.items.find(
          (item) => item.token === Contract.address
        ).bigNumber
        const innerBalance = ethers.utils.formatEther(value)
        setBalance(innerBalance)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getTokenBalance()
    const interval = setInterval(() => {
      getTokenBalance()
    }, 60000)
    return () => clearInterval(interval)
  }, [human])

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
        </div>
      </div>
    </div>
  )
}
