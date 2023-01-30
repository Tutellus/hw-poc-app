import { ethers } from "ethers";
import { config } from "../config";
import { GasCalculator } from "./GasCalculator";

export class Executor {
  constructor() {
    this.nonces = {};
  }

  setNonce (chainId, address, nonce) {
    if (!this.nonces[chainId]) {
      this.nonces[chainId] = {};
    }
    this.nonces[chainId][address] = nonce;
  }

  getNonce (chainId, address) {
    if (!this.nonces[chainId]) {
      this.nonces[chainId] = {};
    }
    return this.nonces[chainId][address] || 0;
  }

  async getOnChainNonce (chainId, address) {
    const { rpc } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const onchainNonce = await provider.getTransactionCount(address);
    return onchainNonce;
  }

  async syncNonce (chainId, address) {
    const onchainNonce = await this.getOnChainNonce(chainId, address);
    const currentNonce = this.getNonce(chainId, address);
    if (onchainNonce > currentNonce) {
      this.setNonce(chainId, address, onchainNonce);
    }
  }

  addNonce (chainId, address) {
    const currentNonce = this.getNonce(chainId, address);
    this.setNonce(chainId, address, currentNonce + 1);
  }

  async execute({
    to,
    data,
    value = 0,
    signer,
  }) {
    try {

      const provider = signer.provider;
      const chainId = await provider.getNetwork().then((network) => network.chainId);
      const transaction = {
        from: signer.address,
        to,
        data,
        value,
        chainId,
      };

      const gasCalculator = new GasCalculator({
        gasLimitMultiplier: 2, // config var
        gasPriceMultiplier: 2, // config var
      });


      const [gasPrice, gasLimit] = await Promise.all([
        gasCalculator.getGasPrice(provider),
        gasCalculator.getGasLimit(provider, transaction),
      ]);

      await this.syncNonce(chainId, signer.address);

      transaction.nonce = this.getNonce(chainId, signer.address);
      transaction.gasPrice = gasPrice;
      transaction.gasLimit = gasLimit;

      this.addNonce(chainId, signer.address);

      const executableTransaction = {
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
        gasLimit: transaction.gasLimit,
        gasPrice: transaction.gasPrice,
        nonce: transaction.nonce,
      };

      const tx = await signer.sendTransaction(executableTransaction);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error(error);
      throw error;
    }
    
  }
}