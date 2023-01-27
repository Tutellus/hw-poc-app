import { ethers } from "ethers";
import { config } from "../config";
import { Transaction } from "./Transaction";
import { GasCalculator } from "./GasCalculator";
import { getOne as getProject } from "../repositories/projects";

class ExecutableTransaction {
  constructor(transactionInstance) {
    const transaction = new Transaction(transactionInstance);
    this.from = transaction.from;
    this.to = transaction.to;
    this.data = transaction.data;
    this.value = transaction.value;
    this.gasPrice = transaction.gasPrice;
    this.gasLimit = transaction.gasLimit;
  }
}

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

  async execute(transactionInstance) {
    try {
      const transaction = new Transaction(transactionInstance);
      
      const { chainId, projectId } = transaction;

      const project = await getProject({ _id: projectId });

      const { rpc } = config[chainId];
      const { executorKey } = project;
      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const executor = new ethers.Wallet(executorKey, provider);

      transaction.from = executor.address; 

      const gasCalculator = new GasCalculator({
        gasLimitMultiplier: 1.2, // config var
        gasPriceMultiplier: 1.2, // config var
      });

      const [gasPrice, gasLimit] = await Promise.all([
        gasCalculator.getGasPrice(chainId),
        gasCalculator.getGasLimit(transaction),
      ]);

      if (!project) {
        throw new Error("Project not found");
      }

      await this.syncNonce(chainId, executor.address);

      transaction.nonce = this.getNonce(chainId, executor.address);
      transaction.gasPrice = gasPrice;
      transaction.gasLimit = gasLimit;

      this.addNonce(chainId, executor.address);

      const executableTransaction = new ExecutableTransaction(transaction);
      const tx = await executor.sendTransaction(executableTransaction);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error(error);
      throw error;
    }
    
  }
}