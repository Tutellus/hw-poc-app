import { useHuman } from "@/state/human.context";
import { truncateAddress } from "@/utils/address";
import { useState } from "react";

export const Human = () => {
  const { address, human, loadingDeployment, deployHuman } = useHuman();
  const [extendedAddress, setExtendedAddress] = useState(false);

  const isDeploying = loadingDeployment;
  const isReady = !loadingDeployment && human?.status === 'CONFIRMED';
  const isNotReady = !isDeploying && !isReady;

  return (
    <div className="box" style={{
      gridColumn: '2 / 4',
    }}>
      <div className="title">My human</div>
      <div className="data" onMouseEnter={
        () => setExtendedAddress(true)
      }
        onMouseLeave={
          () => setExtendedAddress(false)
        }
      >
        {address
          ? truncateAddress({
            address,
            extend: extendedAddress,
          })
          : 'No human connected'
        }
        {isReady && <div>Ready</div>}
        {isDeploying && <div>Deploying...</div>}
        {isNotReady && <button onClick={deployHuman}>Deploy</button>}
      </div>
    </div>
  )

}