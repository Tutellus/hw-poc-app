import { config } from '../../config'
import { ethers } from 'ethers'
import { create, push } from '../../utils/safe'
import { wrapOwner } from '../../utils/did';
import { update as updateTx } from '../../repositories/txs';

export default async function handler(req, res) {
  const { did, destination, data, value, gas } = req.body;
  const response = await execute({ did, destination, data, value, gas });
  res.status(200).json(response)
}

async function execute({
  did,
  destination,
  data,
  value,
  gas,
}) {
  try {
    const { chainId, rpcUrl, ownerKeys } = config

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)

    const {
      address: didAddress,
      ownerMS: safe
    } = did;

    const owner0Wallet = new ethers.Wallet(ownerKeys[0], provider)

    const wrappedCalldata = wrapOwner({
      destination,
      data,
      value,
      gas,
    })

    const txData = {
      to: didAddress,
      data: wrappedCalldata,
      value: 0,
      operation: 0,
    };
  
    const tx = await create(chainId, safe, txData, owner0Wallet)
    await push(chainId, safe, tx)

    const signatures = [tx.signature]

    const fields = {
      ...tx,
      did: did._id,
      signatures,
    };
    await updateTx({ fields })
    return { tx };
  } catch (error) {
    console.error(error)
    return error;
  }
}