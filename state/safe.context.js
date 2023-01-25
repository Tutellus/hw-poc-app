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
  const { did } = useSession()

  const loadOwnerSafeData = async () => {
    if (did) {
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
  }

  const loadMasterSafeData = async () => {
    if (did) {
      const response = await fetch('/api/usecases/safe/getSafeData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          safe: did.masterMS
        }),
      })
      const { safeData } = await response.json()
      setOwnerSafeData(safeData)
    }
  }

  useEffect(() => {
    loadOwnerSafeData()
    loadMasterSafeData()
  }, [did])

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