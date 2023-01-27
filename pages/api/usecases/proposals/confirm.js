import { getSafeData } from '../../utils/safe'
import { markAsExecuting, update as updateTx } from '../../repositories/submitals';
import { execute as safeExecuteOwnerTransaction } from '../safe/executeOwnerTransaction';

export async function execute({ 
  tx,
  signature,
}) {
  try {
    const signatures = tx.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }

    const [, { threshold, nonce }] = await Promise.all([
      updateTx({
        id: tx._id,
        fields: {
          signatures,
        }
      }),
      getSafeData(tx.safe),
    ])

    // Check if the transaction has enough signatures and try execute
    if (signatures.length >= threshold && nonce === tx.nonce) {
      await markAsExecuting(tx._id)
      safeExecuteOwnerTransaction({ txId: tx._id })
    } 
  } catch (error) {
    console.error(error)
    return {};
  }
}