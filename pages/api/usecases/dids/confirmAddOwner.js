import { config } from '../../config.js'
import { ethers } from 'ethers'
import { update as updateTx } from '../../repositories/txs'
import { update as updateDID, getOne as getOneDID } from '../../repositories/dids'
import { createAddOwner, push } from '../../utils/safe.js'

export default async function handler(req, res) {
  const { code, user } = req.body
  const response = await execute({ code, user })
  res.status(200).json(response)
}

export async function execute({
  code,
  user,
}) {
  try {
    // Check if the DID exists
    const did = await getOneDID({ userId: user._id })
    if(!did) {
      return {
        error: 'DID not found'
      }
    }

    // Check if the address is valid
    const canAddOwner = did.externalWallet && did.externalWalletStatus === 'PENDING'
    if (!canAddOwner) {
      return {
        error: 'Invalid address'
      }
    }

    // Check if the code is valid
    if (did.externalWallet2fa !== code) {
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
    } = await createAddOwner(chainId, did.ownerMS, did.externalWallet, owner0Wallet)
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
    const response = await updateDID({
      id: did._id,
      fields: {
        externalWalletStatus: 'APPROVING'
      },
    });
    return response;

  } catch (error) {
    console.error(error)
    return {
      error: 'Error'
    }
  }
}