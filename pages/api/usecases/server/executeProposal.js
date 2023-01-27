import { ethers } from 'ethers'
import { config } from '../../config'
import { get as getTxs } from '../../repositories/submitals'

export async function execute(execution) {
  try {
    const { rpc } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const serverWallet = new ethers.Wallet(serverKey, provider);

    const contractInstance = new ethers.Contract(contract, contract.interface, serverWallet);
    const [gasLimit, gasPrice, nonce, txs] = await Promise.all([
      contractInstance.estimateGas[method](...args, { value }),
      provider.getGasPrice(),
      provider.getTransactionCount(serverWallet.address),
      getTxs(),
    ]);

    const sortedByTransactionIndex = txs.sort((a, b) => a.transactionIndex - b.transactionIndex);
    const lastTransactionIndex = sortedByTransactionIndex[sortedByTransactionIndex.length - 1].transactionIndex;

    const transaction = {
      to: contract.address,
      value: value,
      data: contract.interface.encodeFunctionData(method, args),
      gasLimit: gasLimit.mul(1.2),
      gasPrice: gasPrice.mul(2),
      nonce: lastTransactionIndex > nonce ? lastTransactionIndex + 1 : nonce,
    }

    const unsignedTransaction = await serverWallet.populateTransaction(transaction);
    const signedTransaction = await serverWallet.sign(unsignedTransaction);
    const executeTx = await provider.sendTransaction(signedTransaction);

    const receipt = await executeTx.wait()
    return receipt
  } catch (error) {
    console.error(error)
    throw error
  }
  
}
