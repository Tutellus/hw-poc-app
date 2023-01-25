import { config } from '../../config';
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx, update as updateTx, markAsExecuted } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';
import { execute as executeTx } from './execute';

export async function execute({
  txId,
}) {

  // Check if tx exists
  const tx = await getOneTx({ _id: txId })
  if (!tx) {
    return {
      error: 'Transaction not found'
    }
  }

  // Check if did exists
  const did = await getOneDID({ _id: tx.did })
  if (!did) {
    return {
      error: 'DID not found'
    }
  }

  // Check if tx is executable
  const { chainId } = config
  const { threshold } = await getSafeData(chainId, did.ownerMS)
  if (tx.signatures.length < threshold) {
    return {
      error: 'Transaction not executable'
    }
  }

  // Execute the transaction
  const receipt = await executeTx(tx);

  await updateTx({
    id: txId,
    fields: {
      executionTxHash: receipt.transactionHash,
      receipt,
    },
  })
  await markAsExecuted(txId)
}
