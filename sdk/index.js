import { contractSDK } from "./contract.js"
import { humanSDK } from "./human.js"
import { proposalSDK } from "./proposal.js"

export default class HumanWalletSDK {
  static build({ uri, projectId, accessToken, provider }) {
    return new HumanWalletSDK({ uri, projectId, accessToken, provider })
  }

  constructor({ uri, projectId, accessToken, provider }) {
    this._contractSDK = contractSDK
    this._humanSDK = humanSDK
    this._proposalSDK = proposalSDK
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

  // async signAndSubmitProposal({ proposalId }) {
  //   return await this._humanSDK.signAndSubmitProposal({
  //     web3Provider: this._provider,
  //     proposalId,
  //     accessToken: this._accessToken,
  //   })
  // }

  // async signMessageFromOwner({ message }) {
  //   return await this._humanSDK.signMessageFromOwner({
  //     web3Provider: this._provider,
  //     message,
  //   })
  // }

  // async submitUserOp({ userOpId }) {
  //   return await this._humanSDK.submitUserOp({
  //     web3Provider: this._provider,
  //     userOpId,
  //     user: this._user,
  //   })
  // }

  async checkContractAddress({ contractAddress }) {
    return this._contractSDK.checkContractAddress({
      contractAddress,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async updateContractStatus({ contractAddress, status }) {
    return this._contractSDK.updateContractStatus({
      contractAddress,
      status,
      uri: this._uri,
      provider: this._provider,
      projectId: this._projectId,
      accessToken: this._accessToken,
    })
  }

  async checkContractData({ contractAddress, method, params }) {
    return this._contractSDK.checkContractData({
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
    return this._contractSDK.getTokensBalance({
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
