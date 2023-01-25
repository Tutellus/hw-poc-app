/* eslint-disable react-hooks/exhaustive-deps */
import { useSession } from "@/state/session.context";
import { useTransactions } from "@/state/transactions.context";
import { Transaction } from "./Transaction"

export const TransactionsList = () => {

  const { ownerSafeData } = useSession();
  const { loadingTransactions, transactions } = useTransactions();

  if (!ownerSafeData) return null;

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
          <div className="table-body">
            {transactions.map((tx, index) => <Transaction key={index} tx={tx} />)}
          </div>
        </table>
        : <div>No transactions yet</div>
    }
    </div>
  );
};

