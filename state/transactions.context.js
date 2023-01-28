/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useSafe } from "./safe.context";
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

  const { session, proxy } = useSession();
  const { loadOwnerSafeData } = useSafe();
  const [transactions, setTransactions] = useState([]);
  const [executingTransaction, setExecutingTransaction] = useState(false);
  const [confirmingTransaction, setConfirmingTransaction] = useState(false);
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  const loadTransactions = async () => {
    if (session && proxy && !loadingTransactions) {
      setLoadingTransactions(true);
      setTimeout(async () => {
        const response = await fetch('/api/usecases/txs/getByUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: session }),
        })
        const { txs: items } = await response.json()
        setTransactions(items.reverse());
      }, 2000)
      setLoadingTransactions(false);
    }
  }

  const confirmByCode = async (tx, code) => {
    setConfirmingTransaction(true);
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
    await loadTransactions()
    setConfirmingTransaction(false);
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
    contractId,
    projectId,
    method,
    params,
    value,
    user,
  }) => {
    setCreatingTransaction(true);
    const result = await fetch('/api/usecases/submitals/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractId,
        projectId,
        method,
        params,
        value,
        user,
      }),
    });
    const { response } = await result.json();
    console.log(response);
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
    if (proxy && session) {
      loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [session, proxy]);

  useEffect(() => {
    loadOwnerSafeData();
  }, [transactions]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadTransactions();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
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