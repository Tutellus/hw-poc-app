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
  
  async getGasPrice(provider) {
    const gasPrice = await provider.getGasPrice();
    return gasPrice * this.gasPriceMultiplier;
  }

  async getGasLimit(provider, transaction) {
    const gasLimit = await provider.estimateGas(transaction);
    return gasLimit * this.gasLimitMultiplier;
  }
}