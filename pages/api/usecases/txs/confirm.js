import { config } from '../../config';
import { getSafeData, push } from '../../utils/safe'
import { markAsExecuting, update as updateTx } from '../../repositories/txs';
import { execute as safeExecuteOwnerTransaction } from '../safe/executeOwnerTransaction';

export async function execute({ 
  tx,
  safe,
  signerAddress,
  signature,
}) {
  try {
    const { chainId } = config
    const signatures = tx.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }

    // Push the transaction to the Safe
    await push(chainId, safe, {
      ...tx,
      signature,
      sender: signerAddress,
    })

    await updateTx({
      id: tx._id,
      fields: {
        signatures,
      }
    })

    // Update the transaction
    const { threshold, nonce } = await getSafeData(chainId, safe)

    // Check if the transaction has enough signatures and try execute
    if (signatures.length >= threshold && nonce === tx.nonce) {
      await markAsExecuting(tx._id)

      safeExecuteOwnerTransaction({
        txId: tx._id,
      })
      
    } 
  } catch (error) {
    console.error(error)
    return {};
  }
}