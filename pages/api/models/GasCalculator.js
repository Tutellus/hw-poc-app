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
    return parseInt(gasPrice.toNumber() * this.gasPriceMultiplier, 10);
  }

  async getGasLimit(provider, transaction) {
    const gasLimit = await provider.estimateGas(transaction);
    return parseInt(gasLimit.toNumber() * this.gasLimitMultiplier, 10);
  }
}