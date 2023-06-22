import {
  GET_HUMAN_ADDRESS_QUERY,
  GET_HUMAN_BY_EMAIL_QUERY,
  GET_CONTRACTS_QUERY,
  CHECK_CONTRACT_ADDRESS_QUERY,
  CHECK_CONTRACT_DATA_QUERY,
  DEPLOY_HUMAN_MUTATION,
  REQUEST_PROPOSAL_MUTATION,
  GET_PROPOSALS_HASH_QUERY,
  authFetcher,
} from "./GQL"

export const GQLRepository = {
  getHumanAddress: async ({ projectId, accessToken }) => {
    const response = await authFetcher(
      GET_HUMAN_ADDRESS_QUERY,
      {
        input: {
          projectId,
        },
      },
      accessToken
    )
    return response
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
}
