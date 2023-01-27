import { ethers } from "ethers";
import { config } from "../config";

export class GasCalculator {

  gasLimitMultiplier;
  gasPriceMultiplier;

  constructor({ gasLimitMultiplier, gasPriceMultiplier }) {
    this.gasLimitMultiplier = gasLimitMultiplier;
    this.gasPriceMultiplier = gasPriceMultiplier;
  }

  updateGasLimitMultiplier(gasLimitMultiplier) {
    this.gasLimitMultiplier = gasLimitMultiplier;
  }

  updateGasPriceMultiplier(gasPriceMultiplier) {
    this.gasPriceMultiplier = gasPriceMultiplier;
  }

  getProvider (chainId) {
    const { rpc } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    return provider;
  }
  
  async getGasPrice(chainId) {
    const provider = this.getProvider(chainId);
    const gasPrice = await provider.getGasPrice();
    return gasPrice * this.gasPriceMultiplier;
  }

  async getGasLimit(transaction) {
    const provider = this.getProvider(transaction.chainId);
    const gasLimit = await provider.estimateGas(transaction);
    return gasLimit * this.gasLimitMultiplier;
  }
}