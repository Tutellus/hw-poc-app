/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";

const SessionContext = createContext({
  verifying: false,
  loggingIn: false,
  assigningDid: false,
  loadingDid: false,
  session: null,
  did: null,
  ownerSafeData: null,
  loadDid: async () => {},
  logIn: async () => {},
  logOut: async () => {},
  verifyUser: async () => {},
  redirect: async () => {},
});

function SessionProvider(props) {
  const [verifying, setVerifying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [assigningDid, setAssigningDid] = useState(false);
  const [loadingDid, setLoadingDid] = useState(false);
  const [session, setSession] = useState(null);
  const [ownerSafeData, setOwnerSafeData] = useState(null);
  const [did, setDid] = useState(null);
  const router = useRouter();

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

  const getOwnerSafeData = async () => {
    const response = await fetch('/api/usecases/safe/getSafeData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        safe: did.ownerMS
      }),
    })
    const { safeData } = await response.json()
    setOwnerSafeData(safeData)
  }

  const logOut = () => {
    localStorage.removeItem('session');
    setSession(null);
    setDid(null);
    router.push('/');
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
      getOwnerSafeData();
    }
  }, [did])

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
      ownerSafeData,
      loadDid,
      logIn,
      logOut,
      verifyUser,
      redirect,
    }),
    [session, did, assigningDid, loadingDid, loggingIn, verifying, ownerSafeData]
  );

  return <SessionContext.Provider value={memoizedData} {...props} />;
}

function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error(
      `useSessionContext must be used within a SessionContextProvider`
    );
  }
  return context;
}

export { SessionProvider, useSession };