/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { HumanWalletSDK } from "@tutellus/humanwalletsdk";
import { useSession } from "next-auth/react";
// import { useMagicLink } from "./magicLink.context";
import { useWeb3Auth } from "./web3auth.context";

const HumanContext = createContext({
  humanSDK: null,
  human: null,
  proposals: [],
  loadingHuman: false,
  loadingProposals: false,
  requestProposal: async () => {},
  confirmProposal: async () => {},
  getTokensBalance: async () => {},
});

const uri = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

function HumanProvider(props) {

  const { web3Provider } = useWeb3Auth();
  const { data: session } = useSession();
  const { accessToken, user } = session || {};

  const [humanSDK, setHumanSDK] = useState(null);
  const [human, setHuman] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loadingHuman, setLoadingHuman] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const loadHuman = async () => {
    setLoadingHuman(true);
    const response = await humanSDK.getHuman();
    setHuman(response);
    setLoadingHuman(false);
  };

  const loadProposals = async () => {
    if (!human) return;
    setLoadingProposals(true);
    const response = await humanSDK.getProposals();
    setProposals(response);
    setLoadingProposals(false);
  };

  const requestProposal = async ({ title, description, calls }) => {
    const response = await humanSDK.requestProposal({
      title,
      calls,
      description,
    });
    return response;
  };

  const confirmProposal = async ({ proposalId, code }) => {
    try {
      const proposal = await humanSDK.confirmProposal({ proposalId, code });
      return proposal;
    } catch (error) {
      console.error('Invalid proposal confirmation', error);
    }
  };

  const getTokensBalance = async (tokens) => {
    try {
      const balances = await humanSDK.getTokensBalance({
        tokens: tokens.map(({ token, type, ids }) => ({
          token,
          type,
          ids,
        })),
        address: human.address,
      });
      return balances;
    } catch (error) {
      console.error('Invalid tokens balance request', error);
    }
  };

  useEffect(() => {
    if (web3Provider && accessToken) {
      const humanSDK = HumanWalletSDK.build({
        uri,
        projectId,
        accessToken,
        provider: web3Provider,
      });

      setHumanSDK(humanSDK);
    }
  }, [web3Provider, accessToken]);

  useEffect(() => {
    if (!humanSDK) return;
    loadProposals();
    const interval = setInterval(() => {
      loadProposals();
    }, 5000);
    return () => clearInterval(interval);
  }, [human]);

  useEffect(() => {
    if (!humanSDK) return;
    loadHuman();
    const interval = setInterval(() => {
      loadHuman();
    }, 5000);
    return () => clearInterval(interval);
  }, [user, humanSDK]);

  const memoizedData = useMemo(
    () => ({
      humanSDK,
      human,
      proposals,
      loadingHuman,
      loadingProposals,
      requestProposal,
      confirmProposal,
      getTokensBalance,
    }),
    [humanSDK, human, proposals, loadingHuman, loadingProposals]
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
