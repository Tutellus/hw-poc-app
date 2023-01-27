import { config } from '../../config';
import { ethers } from 'ethers'
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx } from '../../repositories/submitals';
import { getOne as getOneProxy } from '../../repositories/proxies';
import { execute as confirm } from './confirm';

export default async function handler(req, res) {
  const { txId, signature, user } = req.body;
  const response = await execute({ txId, signature, user });
  res.status(200).json(response)
}

async function execute({ txId, signature, user }) {
  try {

    // Check if the transaction exists and if it is in a pending state
    const tx = await getOneTx({ _id: txId })
    if (!tx || tx.status !== 'CREATED') {
      console.error('Transaction not found or not in a pending state')
      return {
        error: 'Transaction not confirmable'
      }
    }

    // Check if the Proxy exists
    const proxy = await getOneProxy({ _id: tx.proxy })
    if (!proxy) {
      console.error('Proxy not found')
      return {
        error: 'Proxy not found'
      }
    }

    // Check if the user is the owner of the Proxy
    if (proxy.userId !== user._id) {
      console.error('Unauthorized')
      return {
        error: 'Unauthorized'
      }
    }

    // Check if the signature is valid
    const sender = ethers.utils.recoverAddress(tx.contractTransactionHash, signature)
    const ownerSafeData = await getSafeData(proxy.ownerSafe)
    const lcOwners = ownerSafeData.owners.map(owner => owner.toLowerCase())
    if (!lcOwners.includes(sender.toLowerCase())) {
      return {
        error: 'Invalid signature'
      }
    }

    // Confirm the transaction
    await confirm({
      tx,
      signature,
      signerAddress: sender,
      safe: proxy.ownerSafe,
    })

  } catch (error) {
    console.error(error)
    return {};
  }
}