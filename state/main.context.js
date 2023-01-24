/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";

const MainContext = createContext({
  verifying: false,
  loggingIn: false,
  assigningDid: false,
  loadingDid: false,
  loadingTransactions: false,
  transactions: [],
  session: null,
  did: null,
  loadDid: () => {},
  logIn: () => {},
  logOut: () => {},
  verifyUser: () => {},
  loadTransactions: () => {},
  redirect: () => {},
});

function MainContextProvider(props) {

  const [verifying, setVerifying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [assigningDid, setAssigningDid] = useState(false);
  const [loadingDid, setLoadingDid] = useState(false);
  const [session, setSession] = useState(null);
  const [did, setDid] = useState(null);
  const router = useRouter();
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const logIn = async (email) => {
    setLoggingIn(true)
    const response = await fetch('/api/usecases/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    const { user } = await response.json()
    setSession(user);
    setLoggingIn(false)
  }

  const assignDid = async () => {
    setAssigningDid(true);
    const response = await fetch('/api/usecases/dids/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: session._id }),
    })
    const { did: item } = await response.json()
    setDid(item);
    setAssigningDid(false);
  }

  const loadDid = async () => {
    setLoadingDid(true);
    const response = await fetch('/api/usecases/dids/getByUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: session }),
    })
    const { did } = await response.json()
    if (did) {
      setDid(did);
    } else {
      if (!assigningDid) {
        await assignDid();
      }
    }
    setLoadingDid(false);
  }

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
    setTransactions(items);
    setLoadingTransactions(false);
  }

  const logOut = () => {
    localStorage.removeItem('session');
    setSession(null);
    setDid(null);
    router.push('/');
    setTransactions([]);
  };

  const verifyUser = async (code) => {
    setVerifying(true)
    const response = await fetch('/api/usecases/users/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: session, code: session.verifyCode }), // hack
    })
    const { user } = await response.json()
    setSession(user);
    setVerifying(false)
  }

  const redirect = () => {
    if (session) {
      if (session?.status === 'VERIFIED') {
        router.push('/dashboard');
      }
      if (session?.status === 'PENDING') {
        router.push('/verify');
      }
    } else {
      router.push('/login');
    }
  }

  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
      if (!loadingDid) {
        loadDid();
      }
      redirect();
    }
  }, [session]);

  useEffect(() => {
    if (did) {
      loadTransactions();
    }
  }, [did]);

  useEffect(() => {
    const localSession = JSON.parse(localStorage.getItem('session'));
    if (localSession && !session) {
      setSession(localSession);
    }
  }, []);

  const memoizedData = useMemo(
    () => ({
      session,
      did,
      verifying,
      loggingIn,
      assigningDid,
      loadingDid,
      loadingTransactions,
      transactions,
      loadDid,
      logIn,
      logOut,
      verifyUser,
      loadTransactions,
      redirect,
    }),
    [session, did, assigningDid, loadingDid, loadingTransactions, transactions, loggingIn, verifying]
  );

  return <MainContext.Provider value={memoizedData} {...props} />;
}

function useMainContext() {
  const context = useContext(MainContext);
  if (context === undefined) {
    throw new Error(
      `useMainContext must be used within a MainContextProvider`
    );
  }
  return context;
}

export { MainContextProvider, useMainContext };