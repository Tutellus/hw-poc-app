import { config } from '../../config';
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx, markAsExecuting } from '../../repositories/submitals';
import { getOne as getOneProxy } from '../../repositories/proxies';
import { execute as safeExecuteOwnerTransaction } from '../safe/executeOwnerTransaction'

export default async function handler(req, res) {
  const { txId, user } = req.body;
  const response = await execute({ txId, user });
  res.status(200).json(response)
}

export async function execute({
  txId,
  user,
}) {
  try {

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

    // Check if user is the owner of the Proxy
    if (proxy.userId !== user._id) {
      return {
        error: 'Unauthorized'
      }
    }

    // Check if tx is executable
    const { threshold } = await getSafeData(proxy.ownerSafe)
    if (tx.status !== 'CREATED' && tx.signatures.length < threshold) {
      return {
        error: 'Transaction not executable'
      }
    }

    await markAsExecuting(txId)

    safeExecuteOwnerTransaction({
      txId,
    })

    return true
  } catch (error) {
    console.error(error)
    return false;
  }
}