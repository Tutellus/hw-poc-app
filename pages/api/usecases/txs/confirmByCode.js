import { config } from '../../config';
import { ethers } from 'ethers'
import { push, sign } from '../../utils/safe'
import { getOne as getOneTx, update as updateTx } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';

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

    // Check if the signature has already been used
    const { ownerKeys, chainId } = config
    const owner1Wallet = new ethers.Wallet(ownerKeys[1])  
    const signature = sign(tx.contractTransactionHash, owner1Wallet)
    const signatures = tx.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }

    // Push the transaction to the Safe
    await push(chainId, did.ownerMS, {
      ...tx,
      signature,
      signatures: undefined,
      did: undefined,
      _id: undefined,
      sender: owner1Wallet.address,
    })

    // Update the transaction
    return await updateTx({
      id: tx._id,
      fields: {
        signatures,
      }
    })
  } catch (error) {
    console.error(error)
    return {};
  }
}