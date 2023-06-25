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
} from "./GQL/index.js"

export const GQLRepository = {

  getHumanAddress: async ({ uri, projectId, accessToken }) => {
    // if (!accessToken) return
    const { getHumanAddress } = await authFetcher({
      uri,
      query: GET_HUMAN_ADDRESS_QUERY,
      accessToken,
      projectId,
    })
    return getHumanAddress
  },

  // TODO Deprecated Internal UC
  getHumanByEmail: async ({ uri, email, projectId, accessToken }) => {
    const { getHumanByEmail } = await authFetcher({
      uri,
      query: GET_HUMAN_BY_EMAIL_QUERY, 
      variables: {
        input: {
          email,
        }
      },
      accessToken,
      projectId,
    })
    return getHumanByEmail
  },

  getContracts: async ({ uri, projectId, accessToken }) => {
    const { getContracts } = await authFetcher({
      uri,
      query: GET_CONTRACTS_QUERY,
      accessToken,
      projectId,
    })
    return { getContracts }
  },

  checkContractAddress: async ({ uri, contractAddress, projectId, accessToken  }) => {
    const { checkContractAddress } = await authFetcher({
      uri,
      query: CHECK_CONTRACT_ADDRESS_QUERY,
      variables: {
        contractAddress,
      },
      accessToken,
      projectId,
    })
    return checkContractAddress
  },

  checkContractData: async ({ uri, contractAddress, method, params, projectId, accessToken }) => {
    const { checkContractData } = await authFetcher({
      uri,
      query: CHECK_CONTRACT_DATA_QUERY, 
      variables: {
        input: {
          contractAddress,
          method,
          params,
        }
      },
      accessToken,
      projectId,
    })

    return checkContractData
  },

  getTokensBalance: async ({ uri, address, tokens, projectId, accessToken }) => {
    const { getTokensBalance } = await authFetcher({
      uri,
      query: GET_TOKENS_BALANCE_QUERY,
      variables: {
        input: {
          address,
          tokens,
        },
      },
      accessToken,
      projectId,
    })
    return getTokensBalance
  },

  deployHuman: async ({ uri, owner, projectId, accessToken }) => {
    const { deployHuman } = await authFetcher({
      uri,
      query: DEPLOY_HUMAN_MUTATION,
      variables: {
        input: {
          owner,
        },
      },
      accessToken,
      projectId,
    })  
    return deployHuman
  },

  requestProposals: async ({
    uri, 
    title,
    description,
    calls,
    projectId, 
    accessToken 
  }) => {
    const { requestProposal } = await authFetcher({
      uri,
      query: REQUEST_PROPOSAL_MUTATION,
      variables: {
        input: {
          title,
          calls,
          description,
        },
      },
      accessToken,
      projectId,
    })
    return requestProposal
  },

  getProposalsHash: async ({ uri, proposalId, accessToken, projectId }) => {
    const { getProposalHash } = await authFetcher({
      uri,
      query: GET_PROPOSALS_HASH_QUERY,
      variables: {
        proposalId,
      },
      accessToken,
      projectId,
    })

    return getProposalHash
  },

  getProposals: async ({ uri, projectId, accessToken }) => {
    const { getProposals } = await authFetcher({
      uri,
      query: GET_PROPOSALS_QUERY,
      variables: {
        input: {
        },
      },
      accessToken,
      projectId,
    })

    return getProposals
  },

  processProposal: async ({ uri, proposalId, signature, accessToken, projectId }) => {
    const { processProposal } = await authFetcher({
      uri,
      query: PROCESS_PROPOSAL_MUTATION,
      variables: {
        input: {
          proposalId,
          signature,
        },
      },
      accessToken,
      projectId,
    })
    return processProposal
  },

  confirmProposal: async ({ uri, proposalId, code, accessToken, projectId }) => {
    const { confirmProposal } = await authFetcher({
      uri,
      query: CONFIRM_PROPOSAL_MUTATION,
      variables: {
        input: {
          proposalId,
          code,
        },
      },
      accessToken,
      projectId,
    })
    return confirmProposal
  },
}
