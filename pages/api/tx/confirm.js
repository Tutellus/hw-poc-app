import { config } from '../config';
import { ethers } from 'ethers'
import { push, sign } from '../utils/safe'
import { get as getTxs, update as updateTx } from '../repositories/txs';
import { get as getDIDs } from '../repositories/dids';

export default async function handler(req, res) {
  const { id } = req.body;
  const response = await confirm({ id });
  res.status(200).json(response)
}

async function confirm({
  id
}) {
  try {

    const txs = await getTxs() || [];
    const tx = txs.find(tx => tx._id === id);
    if (!tx) {
      return {
        error: 'Transaction not found'
      }
    }
    const { ownerKeys, chainId } = config
    const owner1Wallet = new ethers.Wallet(ownerKeys[1])  
    const signature = sign(tx.contractTransactionHash, owner1Wallet)
    const signatures = tx.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }
    const dids = await getDIDs()
    const did = dids.find(did => did._id === tx.did)
    if (!did) {
      return {
        error: 'DID not found'
      }
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