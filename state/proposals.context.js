/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useWeb3Auth } from "./web3auth.context";

const ProposalsContext = createContext({
  ownerProposals: [],
  masterProposals: [],
  consfirmingProposal: false,
  submitting: false,
  loadOwnerProposals: async () => {},
  loadMasterProposals: async () => {},
  confirmByCode: async () => {},
  confirmBySignature: async () => {},
  submit: async () => {},
});

function ProposalsProvider(props) {

  const { user, proxy } = useWeb3Auth();

  const [ownerProposals, setOwnerProposals] = useState([]);
  const [masterProposals, setMasterProposals] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [confirmingProposal, setConfirmingProposal] = useState(false);

  const [loadingOwnerProposals, setLoadingOwnerProposals] = useState(false);
  const [loadingMasterProposals, setLoadingMasterProposals] = useState(false);

  const loadOwnerProposals = async () => {
    setLoadingOwnerProposals(true);
    if (proxy?.ownerSafe) {
      const response = await fetch('/api/usecases/proposals/getBySafe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ safe: proxy?.ownerSafe }),
      })
      const { proposals: items } = await response.json()
      if (proxy && user) {
        setOwnerProposals(items.reverse());
      }
    }
    setLoadingOwnerProposals(false);
  }

  const loadMasterProposals = async () => {
    setLoadingMasterProposals(true);
    if (proxy?.masterSafe) {
      const response = await fetch('/api/usecases/proposals/getBySafe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ safe: proxy?.masterSafe }),
      })
      const { proposals: items } = await response.json()
      if (proxy && user) {
        setMasterProposals(items.reverse());
      }
    }
    setLoadingMasterProposals(false);
  }

  const confirmByCode = async (proposal, code) => {
    setConfirmingProposal(true);
    await fetch('/api/usecases/proposals/confirmByCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proposalId: proposal._id,
        code,
        user: user,
      }),
    })
    setConfirmingProposal(false);
  }

  const confirmBySignature = async (proposal, signature) => {
    setConfirmingProposal(true);
    await fetch('/api/usecases/proposals/confirmBySignature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proposalId: proposal._id,
        signature,
        user: user,
      }),
    })
    setConfirmingProposal(false);
  }

  const submit = async ({
    chainId,
    contractId,
    projectId,
    method,
    params,
    value,
    user,
  }) => {
    setSubmitting(true);
    const result = await fetch('/api/usecases/submitals/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chainId,
        contractId,
        projectId,
        method,
        params,
        value,
        user,
      }),
    });
    await result.json();
    setSubmitting(false);
  }

  useEffect(() => {
    if (!proxy || !user) {
      setOwnerProposals([]);
      setMasterProposals([]);
    }
  }, [proxy, user]);

  useEffect(() => {
    if (!loadingOwnerProposals) {
      setTimeout(() => {
        loadOwnerProposals();
      }
      , 3000)
    }
  }, [proxy, ownerProposals]);

  useEffect(() => {
    if (!loadingMasterProposals) {
      setTimeout(() => {
        loadMasterProposals();
      }
      , 3000)
    }
  }, [proxy, masterProposals]);
  
  const memoizedData = useMemo(
    () => ({
      ownerProposals,
      masterProposals,
      confirmingProposal,
      submitting,
      loadOwnerProposals,
      loadMasterProposals,
      confirmByCode,
      confirmBySignature,
      submit,
    }),
    [ownerProposals, masterProposals, confirmingProposal, submitting]
  );

  return <ProposalsContext.Provider value={memoizedData} {...props} />;
}

function useProposals() {
  const context = useContext(ProposalsContext);
  if (context === undefined) {
    throw new Error(
      `useProposals must be used within a ProposalsProvider`
    );
  }
  return context;
}

export { ProposalsProvider, useProposals };