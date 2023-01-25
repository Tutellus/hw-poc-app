import { config } from '../../config'
import { ethers } from 'ethers'
import { create, push } from '../../utils/safe'
import { wrapOwner } from '../../utils/did';
import { update as updateTx } from '../../repositories/txs';
import { execute as executeGetByUser } from '../../usecases/dids/getByUser.js'

export default async function handler(req, res) {
  const { user, destination, data, value, gas } = req.body;
  const response = await execute({ user, destination, data, value, gas });
  res.status(200).json(response)
}

async function execute({
  user,
  destination,
  data,
  value,
  gas,
}) {
  try {
    const did = await executeGetByUser({ user })

    if (!did) {
      res.status(404).json({ error: 'DID not found' });
      return;
    }

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

    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const fields = {
      ...tx,
      did: did._id,
      signatures,
      originalData: data,
      code2fa,
      chainId,
    };
    await updateTx({ fields })
    return { tx };
  } catch (error) {
    console.error(error)
    return error;
  }
}