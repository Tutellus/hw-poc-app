import { config } from '../../config';
import { ethers } from 'ethers'
import { push, sign } from '../../utils/safe'
import { getOne as getOneTx } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';

export default async function handler(req, res) {
  const { id } = req.body;
  const response = await execute({ id });
  res.status(200).json(response)
}

async function execute({ id }) {
  try {
    const tx = await getOneTx({ _id: id })
    // exists? status === 'PENDING'?
    if (!tx || tx.status !== 'PENDING') {
      return {
        error: 'Transaction not confirmable'
      }
    }
    const did = await getOneDID({ _id: tx.did })
    if (!did) {
      return {
        error: 'DID not found'
      }
    }
    const { ownerKeys, chainId } = config
    const owner1Wallet = new ethers.Wallet(ownerKeys[1])  
    const signature = sign(tx.contractTransactionHash, owner1Wallet)
    const signatures = tx.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }
    await push(chainId, did.ownerMS, {
      ...tx,
      signature,
      signatures: undefined,
      did: undefined,
      _id: undefined,
      sender: owner1Wallet.address,
    })
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