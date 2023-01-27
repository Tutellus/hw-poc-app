import { get as getProposals } from '../../repositories/proposals'

// Creates a new transaction assigning the correct nonce
export async function execute({
  
}) {
  try {
    const [nonce, txs] = await Promise.all([
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

  } catch (error) {
    console.error(error)
    throw error
  }
  
}
