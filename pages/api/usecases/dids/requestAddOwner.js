import { config } from '../../config.js'
import { ethers } from 'ethers'
import { update as updateDID, get as getOneDID } from '../../repositories/dids'
import { getSafeData } from '../../utils/safe.js'

export default async function handler(req, res) {
  const { message, signature, user } = req.body
  const response = await execute({ message, signature, user })
  res.status(200).json(response)
}

export async function execute({
  message,
  signature,
  user,
}) {
  
  // Check if the message is valid
  const address = ethers.utils.verifyMessage(message, signature)
  if (!ethers.utils.isAddress(address)) {
    return {
      error: 'Invalid signature'
    }
  }

  // Check if the DID exists
  const did = await getOneDID({ userId: user._id })
  if(!did) {
    return {
      error: 'DID not found'
    }
  }

  // Check if the address is already an owner
  const ownerSafeData = await getSafeData(config.chainId, did.ownerMS)
  const { owners } = ownerSafeData
  if (owners.includes(address)) {
    return {
      error: 'Address already owner'
    }
  }

  // Check if the address is valid
  const requestedOwners = did.requestedOwners || [];
  const requestedAddresses = requestedOwners.map(owner => owner.address.toLowerCase());
  if (!requestedAddresses.includes(address.toLowerCase())) {
    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    requestedOwners.push({
      address,
      code2fa,
    });
  } else {
    return {
      error: 'Address already requested'
    }
  }

  // Update the DID with the new requested owner
  await updateDID({
    id: did._id,
    fields: {
      requestedOwners,
    },
  });
  return did;
}