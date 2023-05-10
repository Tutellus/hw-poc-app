import { useHuman } from "@/state/human.context";
import { truncateAddress } from "@/utils/address";

export const UserOps = () => {

  const { loadingUserOps, userOps } = useHuman();

  return (
    <div className="box" style={{
      gridColumn: '1 / 3',
    }}>
      <div className="title">User Operations</div>
      <div className="data">

        {loadingUserOps && <div> Loading User Operations... </div>}

        {userOps.length > 0 && (
          userOps.map((userOp, index) => (
            <div className="userOp" key={index}>
              <div>{userOp.nonce}</div>
              <a
                style={{ color: 'white' }}
                href={`https://mumbai.polygonscan.com/tx/${userOp.receipt?.transactionHash}`}
                target="_blank"
                rel="noreferrer"
              >{truncateAddress(userOp.receipt?.transactionHash)}</a>
            </div>
          ))
        )}

      </div>
    </div>
  )
}