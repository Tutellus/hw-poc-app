import { useHuman } from "@/state/human.context";
import { truncateAddress } from "@/utils/address";

export const Human = () => {
  const { address, human, loadingDeployment, deployHuman } = useHuman();

  const isDeploying = loadingDeployment;
  const isReady = human?.address;
  const isNotReady = !isDeploying && !isReady;

  return (
    <div className="box">
      <div className="title">My human</div>
      <div className="data">
        {address
          ? truncateAddress(address)
          : 'No human connected'
        }
        {}
        {isReady && <div>Ready</div>}
        {isDeploying && <div>Deploying...</div>}
        {isNotReady && <button onClick={deployHuman}>Deploy</button>}
      </div>
    </div>
  )

}