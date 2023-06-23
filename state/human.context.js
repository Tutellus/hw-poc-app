/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useUser } from "./user.context";
import { humanSDK } from "@/sdk";

const HumanContext = createContext({
  address: null,
  human: null,
  preUserOps: [],
  userOps: [],
  processing: false,
  loadingHuman: false,
  loadingAddress: false,
  loadingPreUserOps: false,
  loadingUserOps: false,
  loadingDeployment: false,
  signMessageFromOwner: async (message) => {},
  requestPreUserOp: async ({ contractId, method, params, value }) => {},
  getPreUserOpHash: async ({ preUserOpId }) => {},
  submitUserOp: async ({ preUserOpId, signature }) => {},
  confirmPreUserOp: async ({ preUserOpId, code }) => {},
  signAndSubmitPreUserOp: async ({ preUserOpId }) => {},
});

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

function HumanProvider(props) {
  const { user, externalAccount, web3Provider, accessToken } = useUser();
  const {
    requestPreUserOp,
    loadHumanAddress,
    loadUserOps,
    loadHuman,
    signAndSubmitPreUserOp,
    getPreUserOpHash,
    submitUserOp,
    signMessageFromOwner,
    confirmPreUserOp,
    deployHuman,
  } = humanSDK;

  // state
  const [address, setAddress] = useState(null);
  const [human, setHuman] = useState(null);
  const [preUserOps, setPreUserOps] = useState([]);
  const [userOps, setUserOps] = useState([]);

  // loadings
  const [processing, setProcessing] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingHuman, setLoadingHuman] = useState(false);
  const [loadingDeployment, setLoadingDeployment] = useState(false);
  const [loadingUserOps, setLoadingUserOps] = useState(false);

  const signMessageFromOwnerData = async ({ message }) => await signMessageFromOwner({ web3Provider, message });

  const loadHumanData = async () => {
    setLoadingHuman(true);
    const response = await loadHuman({ projectId, chainId, user });
    setHuman(response);
    setLoadingHuman(false);
  };

  const loadHumanAddressData = async () => {
    setLoadingAddress(true);
    const response = await loadHumanAddress({
      projectId,
      chainId,
      user,
      accessToken,
    });
    setAddress(response);
    setLoadingAddress(false);
  };

  const loadUserOpsData = async () => {
    setLoadingUserOps(true);
    const response = await loadUserOps({ projectId, chainId, human, user });
    setUserOps(response);
    setLoadingUserOps(false);
  };

  const getRequestPreUserOpData = async ({ projectId, title, calls, description, accessToken }) => {
    const response = await requestPreUserOp({
      projectId,
      title,
      calls,
      description,
      accessToken,
    });
    return response;
  };

  const signAndSubmitPreUserOpData = async ({ preUserOpId }) => {
    setProcessing(true);
    const response = await signAndSubmitPreUserOp({
      web3Provider,
      preUserOpId,
      user,
    });
    setProcessing(false);
    return response;
  };

  const submitUserOpData = async ({ preUserOpId, signature, user }) => {
    const response = await submitUserOp({
      preUserOpId,
      signature,
      user,
    });
    loadUserOpsData();
    return response;
  };

  const confirmPreUserOpData = async ({ preUserOpId, code }) => {
    const response = await confirmPreUserOp({
      preUserOpId,
      code,
      user,
    });
    return response;
  };

  const deployHumanData = async () => {
    setLoadingDeployment(true);
    const response = await deployHuman({
      projectId,
      chainId,
      user,
      externalAccount,
      accessToken,
    });

    setLoadingDeployment(false);
    setHuman(response);
    loadHumanData();
  };

  useEffect(() => {
    loadUserOpsData();
    const interval = setInterval(() => {
      loadUserOpsData();
    }, 5000);
    return () => clearInterval(interval);
  }, [human]);

  useEffect(() => {
    loadHumanAddressData();
    loadHumanData();
    const interval = setInterval(() => {
      loadHumanAddressData();
      loadHumanData();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const memoizedData = useMemo(
    () => ({
      address,
      human,
      preUserOps,
      userOps,
      processing,
      loadingAddress,
      loadingHuman,
      loadingDeployment,
      loadingUserOps,
      deployHuman: deployHumanData,
      signMessageFromOwner: signMessageFromOwnerData,
      requestPreUserOp: getRequestPreUserOpData,
      getPreUserOpHash,
      submitUserOp: submitUserOpData,
      confirmPreUserOp: confirmPreUserOpData,
      signAndSubmitPreUserOp: signAndSubmitPreUserOpData,
    }),
    [address, human, preUserOps, userOps, processing, loadingAddress, loadingHuman, loadingDeployment, loadingUserOps]
  );

  return <HumanContext.Provider value={memoizedData} {...props} />;
}

function useHuman() {
  const context = useContext(HumanContext);
  if (context === undefined) {
    throw new Error(`useHuman must be used within a HumanProvider`);
  }
  return context;
}

export { HumanProvider, useHuman };
