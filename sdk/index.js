import { contractSDK } from "./contract"
import { humanSDK } from "./human"
import { config } from "./config"

export class HumanWalletSDK {
  static build({ projectID, accessToken, web3Provider }) {
    return new HumanWalletSDK({ projectID, accessToken, web3Provider })
  }

  constructor({ projectID, accessToken, web3Provider }) {
    this._contractSDK = contractSDK
    this._humanSDK = humanSDK
    this._config = config
    this._projectID = projectID
    this._accessToken = accessToken
    this._web3Provider = web3Provider
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
}
