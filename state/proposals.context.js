/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useSafe } from "./safe.context";
import { useSession } from "./session.context";

const ProposalsContext = createContext({
  ownerProposals: [],
  masterProposals: [],
  consfirmingProposal: false,
  loadOwnerProposals: async () => {},
  loadMasterProposals: async () => {},
  confirmByCode: async () => {},
  confirmBySignature: async () => {},
  submit: async () => {},
});

function ProposalsProvider(props) {

  const { session } = useSession();
  const { ownerSafeData, masterSafeData } = useSafe();

  const [ownerProposals, setOwnerProposals] = useState([]);
  const [masterProposals, setMasterProposals] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [confirmingProposal, setConfirmingProposal] = useState(false);

  const [loadingOwnerProposals, setLoadingOwnerProposals] = useState(false);
  const [loadingMasterProposals, setLoadingMasterProposals] = useState(false);

  const loadProposals = async () => {
    await Promise.all([
      loadOwnerProposals(),
      loadMasterProposals(),
    ])
  }

  const loadOwnerProposals = async () => {
    if (ownerSafeData && !loadingOwnerProposals) {
      setLoadingOwnerProposals(true);
      setTimeout(async () => {
        const response = await fetch('/api/usecases/proposals/getBySafe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ safe: ownerSafeData.address }),
        })
        const { proposals: items } = await response.json()
        setOwnerProposals(items.reverse());
      }, 2000)
      setLoadingOwnerProposals(false);
    }
  }

  const loadMasterProposals = async () => {
    if (masterSafeData?.address && !loadingMasterProposals) {
      setLoadingMasterProposals(true);
      setTimeout(async () => {
        const response = await fetch('/api/usecases/proposals/getBySafe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ safe: masterSafeData.address }),
        })
        const { proposals: items } = await response.json()
        setMasterProposals(items.reverse());
      }, 2000)
      setLoadingMasterProposals(false);
    }
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
        user: session,
      }),
    })
    await loadProposals()
    setConfirmingProposal(false);
  }

  const confirmBySignature = async (tx, signature) => {
    // setConfirmingProposal(true);
    // await fetch('/api/usecases/txs/confirmBySignature', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     user: session,
    //     txId: tx._id,
    //     signature,
    //   }),
    // })
    // await loadProposals()
    // setConfirmingProposal(false);
  }

  const submit = async ({
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
    if (ownerSafeData) {
      loadOwnerProposals();
    }
  }, [ownerSafeData]);

  useEffect(() => {
    if (masterSafeData) {
      loadMasterProposals();
    }
  }, [masterSafeData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadOwnerProposals();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [ownerProposals]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadMasterProposals();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [masterProposals]);

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