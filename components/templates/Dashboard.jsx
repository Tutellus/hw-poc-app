import { useSession } from "@/state/session.context";
import { useTransactions } from "@/state/transactions.context";
import { truncateAddress } from "@/utils/address";
import { getExplorerUrl } from "@/utils/explorer";
import { TransactionsList } from "../modules/dashboard/transactions/TransactionsList";
import { Web3 } from "../modules/dashboard/web3/Web3";
import { Tokens } from "./Tokens";

export const Dashboard = () => {

  const { session, did, logOut, loadDid, loadingDid, assigningDid } = useSession();
  const { creatingTransaction, createTransaction } = useTransactions()

  return (
    <div className="dashboard">
      <div className="grid">
        {/* my email */}
        {session && <div className="box">
          <div className="title">My account</div>
          <div className="data">{session.email}</div>
        </div>}

        {/* my wallet */}
        <div className="box">
          <div className="title">My wallet</div>
          {assigningDid
            ? <div>Assigning wallet...</div>
            : loadingDid
              ? <div>Loading wallet...</div>
              : did
                ? <div
                    className="data"
                    onClick={() => window.open(getExplorerUrl(process.env.CHAIN_ID || 5, 'address', did.address), '_blank')}
                  >{truncateAddress(did.address)}</div>
                : <button onClick={() => loadDid()}>Connect</button>
            }
        </div>

        {/* your tokens */}
        <Tokens />

        {/* my external wallet */}
        <Web3/>
    
        {/* transactions list */}
        {did && <TransactionsList/>}
        
    </div>
  
    {/* logout */}
    <button style={{
      position: 'absolute',
      bottom: 1,
      right: 1,
      margin: '1rem',
    }} onClick={logOut}>Logout</button>

  </div>
  );
}
