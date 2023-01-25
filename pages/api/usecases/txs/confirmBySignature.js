import { config } from '../../config';
import { ethers } from 'ethers'
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';
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

    // Check if the DID exists
    const did = await getOneDID({ _id: tx.did })
    if (!did) {
      console.error('DID not found')
      return {
        error: 'DID not found'
      }
    }

    // Check if the user is the owner of the DID
    if (did.userId !== user._id) {
      console.error('Unauthorized')
      return {
        error: 'Unauthorized'
      }
    }

    // Check if the signature is valid
    const sender = ethers.utils.recoverAddress(tx.contractTransactionHash, signature)
    const { chainId } = config
    const ownerSafeData = await getSafeData(chainId, did.ownerMS)
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
      safe: did.ownerMS,
    })

  } catch (error) {
    console.error(error)
    return {};
  }
}