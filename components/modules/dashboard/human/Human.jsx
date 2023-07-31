import { useHuman } from "@/state/human.context"
import { truncateAddress } from "@/utils/address"
import { useState } from "react"

export const Human = () => {
  const { human } = useHuman()
  const [extendedAddress, setExtendedAddress] = useState(false)

  const { address } = human || {}
  const isDeploying = human?.status === "PENDING"
  const isReady = human?.status === "CONFIRMED"
  const isNotReady = !isDeploying && !isReady

  return (
    <div
      className="box"
      style={{
        gridColumn: "2 / 4",
      }}
    >
      <div className="title">My human</div>
      <div
        className="data"
        onMouseEnter={() => setExtendedAddress(true)}
        onMouseLeave={() => setExtendedAddress(false)}
      >
        {address
          ? truncateAddress({
              address,
              extend: extendedAddress,
            })
          : "No human connected"}
        {isReady && <div>Ready</div>}
        {isDeploying && <div>Deploying...</div>}
        {isNotReady && <div>Not ready yet...</div>}
      </div>
    </div>
  )
}
