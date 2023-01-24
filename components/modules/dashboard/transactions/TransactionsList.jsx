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
        ? <div className="transactions">
          {transactions.map((tx, index) => <Transaction
            key={index}
            tx={tx}
            ownerSafeData={ownerSafeData}
            confirmFn={confirmFn}
            executeFn={executeFn}
          />)}</div>
        : <div>No transactions yet</div>
    }
    </div>
  );
};

