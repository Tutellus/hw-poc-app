import { config } from '../../config';
import { ethers } from 'ethers'
import { getOne as getOneTx } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';
import { execute as confirm } from './confirm';
import { sign } from '../../utils/safe';

export default async function handler(req, res) {
  const { txId, code, user } = req.body;
  const response = await execute({ txId, code, user });
  res.status(200).json(response)
}

async function execute({ txId, code, user }) {
  try {

    // Check if the transaction exists and if it is in a pending state
    const tx = await getOneTx({ _id: txId })
    if (!tx || tx.status !== 'CREATED') {
      return {
        error: 'Transaction not confirmable'
      }
    }

    // Check if the DID exists
    const did = await getOneDID({ _id: tx.did })
    if (!did) {
      return {
        error: 'DID not found'
      }
    }

    // Check if the user is the owner of the DID
    if (did.userId !== user._id) {
      return {
        error: 'Unauthorized'
      }
    }

    // Check if the code is valid
    if (tx.code2fa !== code) {
      return {
        error: 'Invalid code'
      }
    }

    // Signing
    const { ownerKeys } = config
    const owner1Wallet = new ethers.Wallet(ownerKeys[1]) 

    const { signature, contractTransactionHash } = sign({
      safe: did.ownerMS,
      ...tx,
      signer: owner1Wallet,
    })

    // Confirm the transaction
    await confirm({
      tx,
      signature,
      contractTransactionHash,
      safe: did.ownerMS,
    })
    return true
  } catch (error) {
    console.error(error)
    return false;
  }
}