import { ethers } from 'ethers'
import { update as updateProxy, getOne as getProxy } from '../../repositories/proxies'
import { getSafeData } from '../../utils/safe.js'

export default async function handler(req, res) {
  const { message, signature, user, proxyId } = req.body
  const response = await execute({ message, signature, user, proxyId })
  res.status(200).json(response)
}

export async function execute({
  message,
  signature,
  proxyId,
  user,
}) {
  try {
    // Check if the message is valid
    const address = ethers.utils.verifyMessage(message, signature)
    if (!ethers.utils.isAddress(address)) {
      throw new Error('Invalid signature')
    }

    // Check if the Proxy exists
    const proxy = await getProxy({ _id: proxyId })
    if(!proxy) {
      throw new Error('Proxy not found')
    }

    // Check if the user is the owner of the Proxy
    if (proxy.userId !== user._id) {
      throw new Error('User not authorized')
    }

    if (proxy.externalWallet) {
      throw new Error('Proxy already has an external wallet')
    }

    // Check if the address is already an owner
    const ownerSafeData = await getSafeData({
      safe: proxy.ownerSafe,
      chainId: proxy.chainId,
    })
    const { owners } = ownerSafeData
    if (owners.includes(address)) {
      throw new Error('Address already an owner')
    }

    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    // Update the Proxy with the new requested owner
    const response = await updateProxy({
      id: proxy._id,
      fields: {
        externalWallet: {
          address,
          message,
          signature,
          code2fa,
          status: 'PENDING',
        },
      },
    });
    return response;
  } catch (error) {
    console.error(error)
    throw error;
  }
}