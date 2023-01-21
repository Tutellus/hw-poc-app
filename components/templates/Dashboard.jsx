import { useMainContext } from "@/state/main.context";
import { getExplorerUrl } from "@/utils/explorer";

export const Dashboard = () => {
  const { session, did, logOut, assigningDid, transactions, loadingTransactions } = useMainContext();

  return <div>
    <h1>Dashboard</h1>
    {session && <div>{`Email: ${session.email}`}</div>}
    {did && <div>
      <h2>My DID</h2>
      <div>Connected</div>
      <a
        style={{
          color: 'cyan',
        }}
        href={getExplorerUrl(process.env.CHAIN_ID || 5, 'address', did?.address)}
        target="_blank"
        rel="noreferrer"
      >{did?.address}</a>
      <h2>Transactions</h2>
      {loadingTransactions && <div>Loading transactions...</div>}
      {!loadingTransactions && <div>
        {transactions?.length > 0
          ? transactions.map((tx) =>
          <div key={tx._id}>
            <a href={getExplorerUrl(process.env.CHAIN_ID || 5, 'tx', tx.txHash)} target="_blank" rel="noreferrer">{tx.contractTransactionHash}</a>
          </div>
          )
          : <div>No transactions yet</div>
        }
      </div>}
      <button>New transaction</button>
    </div>}
    {!did && <div>
      <h2>My DID</h2>
      <div>Connecting...</div>
    </div>}
    {assigningDid && <div>Assigning DID...</div>}
    <button onClick={logOut}>Logout</button>
  </div>
}
