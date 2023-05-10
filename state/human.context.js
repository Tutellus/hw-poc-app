/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useWeb3Auth } from "./web3auth.context";

const HumanContext = createContext({
  address: null,
  human: null,
  preUserOps: [],
  userOps: [],
  loadingHuman: false,
  loadingAddress: false,
  loadingPreUserOps: false,
  loadingUserOps: false,
  loadingDeployment: false,
  deployHuman: async () => {},
  signMessageFromOwner: async (message) => {},
  requestPreUserOp: async ({
    contractId,
    method,
    params,
    value,
  }) => {}, 
  getPreUserOpHash: async ({
    preUserOpId,
  }) => {},
  submitUserOp: async ({
    preUserOpId,
    signature,
  }) => {},
  confirmPreUserOp: async({
    preUserOpId,
    code,
  }) => {}
});

function HumanProvider(props) {
  const { user, externalAccount, web3Provider } = useWeb3Auth();

  // state
  const [address, setAddress] = useState(null);
  const [human, setHuman] = useState(null);
  const [preUserOps, setPreUserOps] = useState([]);
  const [userOps, setUserOps] = useState([]);

  // loadings
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingHuman, setLoadingHuman] = useState(false);
  const [loadingDeployment, setLoadingDeployment] = useState(false);
  const [loadingPreUserOps, setLoadingPreUserOps] = useState(false);
  const [loadingUserOps, setLoadingUserOps] = useState(false);

  const signMessageFromOwner = async (message) => await web3Provider.getSigner().signMessage(message);

  const requestPreUserOp = async ({
    contractId,
    method,
    params,
    value,
  }) => {
    const response = await fetch('/api/usecases/userOps/requestPreUserOpUC', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractId,
        method,
        params,
        value,
        user,
      }),
    })
    const { preUserOp } = await response.json()
    loadPreUserOps();
    return preUserOp
  }

  const getPreUserOpHash = async ({
    preUserOpId,
  }) => {
    const response = await fetch('/api/usecases/userOps/getPreUserOpHashUC', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preUserOpId,
        user,
      }),
    })
    const { hash } = await response.json()
    return hash
  }

  const confirmPreUserOp = async ({
    preUserOpId,
    code,
  }) => {
    const response = await fetch('/api/usecases/userOps/confirmPreUserOpUC', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preUserOpId,
        code,
        user,
      }),
    })
    const { preUserOp } = await response.json()
    console.log({ preUserOp })
    loadPreUserOps();
    return preUserOp
  }

  const submitUserOp = async ({
    preUserOpId,
    signature,
  }) => {
    const response = await fetch('/api/usecases/userOps/submitUserOpUC', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preUserOpId,
        signature,
        user,
      }),
    })
    const { userOp } = await response.json()
    return userOp
  }

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

  const loadPreUserOps = async () => {
    if (address) {
      setLoadingPreUserOps(true)
      try {
        const response = await fetch('/api/usecases/userOps/getPreUserOpsUC', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            params: {
              first: 1000,
              where: {
                humanId: address,
              },
            },
            user
          }),
        })
        const { preUserOps: innerPreUserOps } = await response.json()
        setPreUserOps(innerPreUserOps)
      } catch (error) {
        console.error(error)
      }
      setLoadingPreUserOps(false)
    }
  }

  const loadUserOps = async () => {
    if (address) {
      setLoadingUserOps(true)
      try {
        const response = await fetch('/api/usecases/userOps/getUserOpsUC', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            params: {
              first: 1000,
              where: {
                humanId: address,
              },
            },
            user
          }),
        })
        const { userOps: innerUserOps } = await response.json()
        setUserOps(innerUserOps)
      } catch (error) {
        console.error(error)
      }
      setLoadingUserOps(false)
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

  useEffect(() => {
    loadPreUserOps();
    loadUserOps();
  }, [address]);

  const memoizedData = useMemo(
    () => ({
      address,
      human,
      preUserOps,
      userOps,
      loadingAddress,
      loadingHuman,
      loadingDeployment,
      loadingPreUserOps,
      loadingUserOps,
      deployHuman,
      signMessageFromOwner,
      requestPreUserOp,
      getPreUserOpHash,
      submitUserOp,
      confirmPreUserOp,
    }),
    [address, human, preUserOps, userOps, loadingAddress, loadingHuman, loadingDeployment, loadingPreUserOps, loadingUserOps]
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