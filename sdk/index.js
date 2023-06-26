import { humanSDK } from "./humans.js"
import { policySDK } from "./policies.js"
import { proposalSDK } from "./proposals.js"
import { tokenSDK } from "./tokens.js"

export default class HumanWalletSDK {
  static build({ uri, projectId, accessToken, provider }) {
    return new HumanWalletSDK({ uri, projectId, accessToken, provider })
  }

  constructor({ uri, projectId, accessToken, provider }) {
    this._humanSDK = humanSDK
    this._proposalSDK = proposalSDK
    this._tokenSDK = tokenSDK
    this._policySDK = policySDK

    this._uri = uri
    this._projectId = projectId
    this._accessToken = accessToken
    this._provider = provider
  }

  updateAccessToken({ accessToken }) {
    this._accessToken = accessToken
  }

  async requestProposal({ title, calls, description }) {
    return this._proposalSDK.requestProposal({
      title,
      calls,
      description,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async confirmProposal({ proposalId, code }) {
    return this._proposalSDK.confirmProposal({
      proposalId,
      code,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async getHumanAddress() {
    return this._humanSDK.getHumanAddress({
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async getProposals() {
    return this._proposalSDK.getProposals({
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async checkContractAddress({ contractAddress }) {
    return this._policySDK.checkContractAddress({
      contractAddress,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async updateContractStatus({ contractAddress, status }) {
    return this._policySDK.updateContractStatus({
      contractAddress,
      status,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async checkContractData({ contractAddress, method, params }) {
    return this._policySDK.checkContractData({
      contractAddress,
      method,
      params,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async getContracts() {
    return this._contractSDK.getContracts({
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async getTokensBalance({ address, tokens }) {
    return this._tokenSDK.getTokensBalance({
      address,
      tokens,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async deployHuman() {
    return this._humanSDK.deployHuman({
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }
}
