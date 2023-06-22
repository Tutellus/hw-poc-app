import { contractSDK } from "./contract"
import { humanSDK } from "./human"
import { config } from "./config"

export class HumanWalletSDK {
  static build({ projectID, accessToken, provider, user }) {
    return new HumanWalletSDK({ projectID, accessToken, provider, user })
  }

  constructor({ projectID, accessToken, provider, user }) {
    this._contractSDK = contractSDK
    this._humanSDK = humanSDK
    this._config = config
    this._projectID = projectID
    this._accessToken = accessToken
    this._provider = provider
    this._user = user
  }

  async loadHuman() {
    return await this._humanSDK.loadHuman({
      projectId: this._projectID,
      chainId: this._config.CHAIN_ID,
      user: this._user,
    })
  }

  async loadHumanAddress() {
    return await this._humanSDK.loadHumanAddress({
      projectId: this._projectID,
      chainId: this._config.CHAIN_ID,
      user: this._user,
      accessToken: this._accessToken,
    })
  }

  async loadUserOps() {
    return await this._humanSDK.loadUserOps({
      projectId: this._projectID,
      chainId: this._config.CHAIN_ID,
      human: this._human,
      user: this._user,
    })
  }

  async requestPreUserOp({ title, calls, description }) {
    return await this._humanSDK.requestPreUserOp({
      projectId: this._projectID,
      title,
      calls,
      description,
      accessToken: this._accessToken,
    })
  }

  async signAndSubmitPreUserOp({ preUserOpId }) {
    return await this._humanSDK.signAndSubmitPreUserOp({
      web3Provider: this._provider,
      preUserOpId,
      user: this._user,
    })
  }

  async signMessageFromOwner({ message }) {
    return await this._humanSDK.signMessageFromOwner({
      web3Provider: this._provider,
      message,
    })
  }

  async submitUserOp({ userOpId }) {
    return await this._humanSDK.submitUserOp({
      web3Provider: this._provider,
      userOpId,
      user: this._user,
    })
  }

  async checkContractAddress() {
    return await this._contractSDK.checkContractAddress({
      address: this._config.CONTRACT.address,
    })
  }

  async checkContractData() {
    return await this._contractSDK.checkContractData({
      address: this._config.CONTRACT.address,
    })
  }

  async getTokensBalance({ address, tokens }) {
    return await this._contractSDK.getTokensBalance({
      address,
      tokens,
    })
  }
}
