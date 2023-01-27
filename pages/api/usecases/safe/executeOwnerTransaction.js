import { config } from '../../config';
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx, update as updateTx, markAsExecuted } from '../../repositories/submitals';
import { getOne as getOneProxy } from '../../repositories/proxies';
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

  // Check if proxy exists
  const proxy = await getOneProxy({ _id: tx.proxy })
  if (!proxy) {
    return {
      error: 'Proxy not found'
    }
  }

  // Check if tx is executable
  const { chainId } = config
  const { threshold } = await getSafeData(proxy.ownerSafe)
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
