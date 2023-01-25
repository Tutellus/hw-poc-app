/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useSession } from "./session.context";

const TransactionsContext = createContext({
  transactions: [],
  creatingTransaction: false,
  confirmingTransaction: false,
  executingTransaction: false,
  loadingTransactions: false,
  loadTransactions: async () => {},
  confirmByCode: async () => {},
  confirmBySignature: async () => {},
  createTransaction: async () => {},
  executeTransaction: async () => {},
});

function TransactionsProvider(props) {

  const { session, did, loadOwnerSafeData } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [executingTransaction, setExecutingTransaction] = useState(false);
  const [confirmingTransaction, setConfirmingTransaction] = useState(false);
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  const loadTransactions = async () => {
    setLoadingTransactions(true);
    const response = await fetch('/api/usecases/txs/getByUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: session }),
    })
    const { txs: items } = await response.json()
    setTransactions(items.reverse());
    setLoadingTransactions(false);
  }

  const confirmByCode = async (tx, code) => {
    await fetch('/api/usecases/txs/confirmByCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: session,
        txId: tx._id,
        code,
      }),
    })
    loadTransactions()
  }

  const confirmBySignature = async (tx, signature) => {
    setConfirmingTransaction(true);
    await fetch('/api/usecases/txs/confirmBySignature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: session,
        txId: tx._id,
        signature,
      }),
    })
    await loadTransactions()
    setConfirmingTransaction(false);
  }

  const createTransaction = async ({
    contract,
    method,
    args,
    value,
  }) => {
    setCreatingTransaction(true);
    const data = contract.interface.encodeFunctionData(method, args);
    const gas = await contract.estimateGas.mint(...args);
    await fetch('/api/usecases/txs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: session,
        destination: contract.address,
        data,
        value,
        gas,
      }),
    })
    await loadTransactions()
    setCreatingTransaction(false);
  }

  const executeTransaction = async (tx) => {
    setExecutingTransaction(true);
    await fetch('/api/usecases/txs/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: session,
        txId: tx._id,
      }),
    })
    await loadTransactions()
    setExecutingTransaction(false);
  }

  useEffect(() => {
    if (session && did) {
      loadTransactions();
    }
  }, [did]);

  useEffect(() => {
    loadOwnerSafeData();
  }, [transactions]);

  const memoizedData = useMemo(
    () => ({
      transactions,
      loadingTransactions,
      creatingTransaction,
      confirmingTransaction,
      executingTransaction,
      loadTransactions,
      confirmByCode,
      confirmBySignature,
      createTransaction,
      executeTransaction,
    }),
    [transactions, loadingTransactions, creatingTransaction, executingTransaction, confirmingTransaction]
  );

  return <TransactionsContext.Provider value={memoizedData} {...props} />;
}

function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      `useTransactions must be used within a TransactionsProvider`
    );
  }
  return context;
}

export { TransactionsProvider, useTransactions };