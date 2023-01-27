/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { useSession } from "./session.context";

const SafeContext = createContext({
  masterSafeData: null,
  ownerSafeData: null,
  loadOwnerSafeData: async () => {},
  loadMasterSafeData: async () => {},
});

function SafeProvider(props) {
  const [masterSafeData, setMasterSafeData] = useState(null);
  const [ownerSafeData, setOwnerSafeData] = useState(null);
  const { proxy } = useSession()

  const loadOwnerSafeData = async () => {
    if (proxy) {
      const response = await fetch('/api/usecases/safe/getSafeData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          safe: proxy.ownerSafe,
          chainId: proxy.chainId,
        }),
      })
      const { safeData } = await response.json()
      setOwnerSafeData(safeData)
    }
  }

  const loadMasterSafeData = async () => {
    if (proxy) {
      const response = await fetch('/api/usecases/safe/getSafeData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          safe: proxy.masterSafe,
          chainId: proxy.chainId,
        }),
      })
      const { safeData } = await response.json()
      setMasterSafeData(safeData)
    }
  }

  useEffect(() => {
    loadOwnerSafeData()
    loadMasterSafeData()
  }, [proxy])

  const memoizedData = useMemo(
    () => ({
      ownerSafeData,
      masterSafeData,
      loadOwnerSafeData,
      loadMasterSafeData,
    }),
    [ownerSafeData, masterSafeData]
  );

  return <SafeContext.Provider value={memoizedData} {...props} />;
}

function useSafe() {
  const context = useContext(SafeContext);
  if (context === undefined) {
    throw new Error(
      `useSafeContext must be used within a SafeContextProvider`
    );
  }
  return context;
}

export { SafeProvider, useSafe };