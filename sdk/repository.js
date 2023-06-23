import {
  GET_HUMAN_ADDRESS_QUERY,
  GET_HUMAN_BY_EMAIL_QUERY,
  GET_CONTRACTS_QUERY,
  CHECK_CONTRACT_ADDRESS_QUERY,
  CHECK_CONTRACT_DATA_QUERY,
  DEPLOY_HUMAN_MUTATION,
  REQUEST_PROPOSAL_MUTATION,
  GET_PROPOSALS_HASH_QUERY,
  GET_PROPOSALS_QUERY,
  GET_TOKENS_BALANCE_QUERY,
  PROCESS_PROPOSAL_MUTATION,
  authFetcher,
} from "./GQL"

export const GQLRepository = {
  getHumanAddress: async ({ projectId, accessToken }) => {
    if (!accessToken) return
    const { getHumanAddress } = await authFetcher(
      GET_HUMAN_ADDRESS_QUERY,
      {
        input: {
          projectId,
        },
      },
      accessToken
    )

    return getHumanAddress
  },

  getHumanByEmail: async ({ projectId, email }) => {
    const response = await authFetcher(GET_HUMAN_BY_EMAIL_QUERY, {
      input: {
        projectId,
        email,
      },
    })
    return response
  },

  getContracts: async () => {
    const { getContracts } = await authFetcher(GET_CONTRACTS_QUERY, {})
    return getContracts?.items[0]
  },

  checkContractAddress: async ({ address }) => {
    if (!address) return
    const { checkContractAddress } = await authFetcher(
      CHECK_CONTRACT_ADDRESS_QUERY,
      {
        contractAddress: address,
      }
    )
    return checkContractAddress?.result
  },

  checkContractData: async ({ address, method, params }) => {
    const { checkContractData } = await authFetcher(CHECK_CONTRACT_DATA_QUERY, {
      input: {
        contractAddress: address,
        method,
        params,
      },
    })
    return checkContractData.result
  },

  getTokensBalance: async ({ address, tokens }) => {
    const { getTokensBalance } = await authFetcher(
      GET_TOKENS_BALANCE_QUERY,
      {
        input: {
          address,
          tokens,
        },
      },
      null
    )
    return getTokensBalance.items
  },

  deployHuman: async ({ projectId, owner, accessToken }) => {
    console.log("DEPLOY HUMAN", { projectId, owner })

    const { deployHuman } = await authFetcher(
      DEPLOY_HUMAN_MUTATION,
      {
        input: {
          projectId,
          owner,
        },
      },
      accessToken
    )
    return deployHuman
  },

  requestProposals: async ({
    projectId,
    title,
    calls,
    description,
    accessToken,
  }) => {
    const { requestProposal } = await authFetcher(
      REQUEST_PROPOSAL_MUTATION,
      {
        input: {
          projectId,
          title,
          calls,
          description,
        },
      },
      accessToken
    )
    return requestProposal
  },

  getProposalsHash: async ({ proposalId, accessToken }) => {
    const { getProposalHash } = await authFetcher(
      GET_PROPOSALS_HASH_QUERY,
      {
        proposalId,
      },
      accessToken
    )

    return getProposalHash
  },

  getProposals: async ({ projectId, accessToken }) => {
    const { getProposals } = await authFetcher(
      GET_PROPOSALS_QUERY,
      {
        input: {
          projectId,
        },
      },
      accessToken
    )

    return getProposals.items
  },

  processProposal: async ({ proposalId, signature, accessToken }) => {
    const { processProposal } = await authFetcher(
      PROCESS_PROPOSAL_MUTATION,
      {
        input: {
          proposalId,
          signature,
        },
      },
      accessToken
    )
    return processProposal
  },
}
