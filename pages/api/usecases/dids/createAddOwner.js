import { config } from '../../config.js'
import { ethers } from 'ethers'
import { update as updateDID, get as getOneDID } from '../../repositories/dids'
import { createAddOwner, getSafeData, push } from '../../utils/safe.js'

export default async function handler(req, res) {
  const { address, code, user } = req.body
  const response = await execute({ address, code, user })
  res.status(200).json(response)
}

export async function execute({
  address,
  code,
  user,
}) {
  
  // Check if the DID exists
  const did = await getOneDID({ userId: user._id })
  if(!did) {
    return {
      error: 'DID not found'
    }
  }

  // Check if the address is valid
  const requestedOwners = did.requestedOwners || [];
  const owner = requestedOwners.find(owner => owner.address.toLowerCase() === address.toLowerCase());
  if (!owner) {
    return {
      error: 'Address not requested'
    }
  }

  // Check if the code is valid
  if (owner.code2fa !== code) {
    return {
      error: 'Invalid code'
    }
  }

  // Create tx
  const { chainId, rpcUrl, ownerKeys } = config
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)
  const owner0Wallet = new ethers.Wallet(ownerKeys[0], provider)
  const {
    result: tx,
    originalData,
  } = await createAddOwner(chainId, did.ownerMS, address, owner0Wallet)
  await push(chainId, did.ownerMS, tx)

  const signatures = [tx.signature]

  const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  const fields = {
    ...tx,
    did: did._id,
    signatures,
    originalData,
    code2fa,
  };

  await updateTx({ fields })

  // Remove the owner from the list of requested owners
  await updateDID({
    id: did._id,
    fields: {
      requestedOwners: requestedOwners.filter(owner => owner.address.toLowerCase() !== address.toLowerCase()),
    },
  });
  return did;
}