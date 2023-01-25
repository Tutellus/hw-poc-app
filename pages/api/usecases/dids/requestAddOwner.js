import { config } from '../../config.js'
import { ethers } from 'ethers'
import { update as updateDID, getOne as getOneDID } from '../../repositories/dids'
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
  try {
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

    if (did.externalWallet) {
      return {
        error: 'DID already has an external wallet'
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

    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    // Update the DID with the new requested owner
    const response = await updateDID({
      id: did._id,
      fields: {
        externalWallet: address,
        externalWalletSignature: signature,
        externalWalletStatus: 'PENDING',
        externalWallet2fa: code2fa,
      },
    });
    return response;
  } catch (error) {
    console.error(error)
    return {
      error: 'Error requesting owner'
    }
  }
}