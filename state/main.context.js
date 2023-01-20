import { useRouter } from "next/router";
import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";

const MainContext = createContext({
  session: null,
  setSession: () => {},
  logOut: () => {},
});

function MainContextProvider(props) {

  const ref = useRef(null);
  const [session, setSession] = useState(false);
  const router = useRouter();
  
  const logOut = () => {
    setSession(null);
    localStorage.removeItem('session');
  };

  useEffect(() => {
    if (!ref.current) {
      const session = localStorage.getItem('session');
      if (session) {
        setSession(JSON.parse(session));
      }
      ref.current = true;
    }
  }, [ref]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
      if (session?.status === 'VERIFIED') {
        router.push('/dashboard');
      }
      if (session?.status === 'PENDING') {
        router.push('/verify');
      }
    } else {
      router.push('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, ref]);

  const memoizedData = useMemo(
    () => ({
      session,
      setSession,
      logOut,
    }),
    [session, setSession]
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