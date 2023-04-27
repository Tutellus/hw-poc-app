/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useWeb3Auth } from "./web3auth.context";

const HumanContext = createContext({
  address: null,
  human: null,
  loadingHuman: false,
  loadingAddress: false,
  loadingDeployment: false,
  deployHuman: () => {},
});

function HumanProvider(props) {
  const { user, externalAccount } = useWeb3Auth();

  const [address, setAddress] = useState(null);
  const [human, setHuman] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingHuman, setLoadingHuman] = useState(false);
  const [loadingDeployment, setLoadingDeployment] = useState(false);

  const loadHumanAddress = async () => {
    if (user) {
      setLoadingAddress(true)
      try {
        const response = await fetch('/api/usecases/humans/getHumanAddressUC', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user }),
        })
        const { address: innerAddress } = await response.json()
        setAddress(innerAddress)
      } catch (error) {
        console.error(error)
      }
      setLoadingAddress(false)
    }
  }

  const loadHuman = async () => {
    if (user) {
      setLoadingHuman(true)
      try {
        const response = await fetch('/api/usecases/humans/getHumanByUserUC', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user }),
        })
        const { human: innerHuman } = await response.json()
        setHuman(innerHuman)
      } catch (error) {
        console.error(error)
      }
      setLoadingHuman(false)
    }
  }

  const deployHuman = async () => {
    if (user && externalAccount) {
      setLoadingDeployment(true)
      try {
        const response = await fetch('/api/usecases/humans/deployHumanUC', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user, owner: externalAccount }),
        })
        await response.json()
      } catch (error) {
        console.error(error)
      }
      setLoadingDeployment(false)
      loadHuman();
    }
  }

  useEffect(() => {
    loadHumanAddress();
    loadHuman();
  }, [user]);

  const memoizedData = useMemo(
    () => ({
      address,
      human,
      loadingAddress,
      loadingHuman,
      loadingDeployment,
      deployHuman,
    }),
    [address, human, loadingAddress, loadingHuman, loadingDeployment]
  );

  return <HumanContext.Provider value={memoizedData} {...props} />;
}

function useHuman() {
  const context = useContext(HumanContext);
  if (context === undefined) {
    throw new Error(
      `useHuman must be used within a HumanProvider`
    );
  }
  return context;
}

export { HumanProvider, useHuman };