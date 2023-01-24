import { Transaction } from "./Transaction"

export const TransactionsList = ({
  ownerSafeData,
  transactions,
  loadingTransactions,
  confirmFn,
  executeFn,
}) => {
  return (
  <div className="box"
    style={{
      gridColumn: '1 / 3',
    }} 
  >
    <div className="title">Transactions</div>
    {loadingTransactions
      ? <div>Loading transactions...</div>
      :  ownerSafeData && transactions?.length > 0
        ? <table>
          <thead>
              <th>#</th>
              <th>Status</th>
              <th>Confirmations</th>
              <th>Actions</th>
          </thead>
          <tbody>
            {transactions.map((tx, index) => <Transaction
              key={index}
              tx={tx}
              ownerSafeData={ownerSafeData}
              confirmFn={confirmFn}
              executeFn={executeFn}
            />)}
          </tbody>
        </table>
        : <div>No transactions yet</div>
    }
    </div>
  );
};

