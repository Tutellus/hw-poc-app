import { config } from '../../config';
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx, markAsExecuting } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';
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

    // Check if did exists
    const did = await getOneDID({ _id: tx.did })
    if (!did) {
      return {
        error: 'DID not found'
      }
    }

    // Check if user is the owner of the DID
    if (did.userId !== user._id) {
      return {
        error: 'Unauthorized'
      }
    }

    // Check if tx is executable
    const { chainId } = config
    const { threshold } = await getSafeData(chainId, did.ownerMS)
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