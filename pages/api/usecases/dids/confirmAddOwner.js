import { config } from '../../config.js'
import { ethers } from 'ethers'
import { getOne as getOneDID } from '../../repositories/dids'
import { create, getSafeData, sign, sortSignatures } from '../../utils/safe.js'
import { execute as executeTx } from '../safe/execute.js'
import GnosisSafe from '../../abi/GnosisSafe.json'

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
    const owner1Wallet = new ethers.Wallet(ownerKeys[1], provider)
    
    const safe = did.ownerMS
    const safeContract = new ethers.Contract(safe, GnosisSafe.abi, owner0Wallet);
    const safeData = await getSafeData(chainId, safe);
    const currentThreshold = safeData.threshold;

    const originalData = safeContract.interface.encodeFunctionData(
      'addOwnerWithThreshold',
      [
        did.externalWallet,
        currentThreshold
      ]
    );

    const tx = await create({
      chainId,
      safe,
      data: originalData,
      signer: owner0Wallet,
    });

    const { signature: signature0, contractTransactionHash } = sign({
      safe,
      chainId,
      ...tx,
      signer: owner0Wallet,
    })

    const { signature: signature1 } = sign({
      safe,
      chainId,
      ...tx,
      signer: owner1Wallet,
    })

    const signatures = sortSignatures([signature0.signature, signature1.signature], contractTransactionHash)

    await executeTx({
      safe,
      ...tx,
      signatures,
    })

  } catch (error) {
    console.error(error)
    return {
      error: 'Error'
    }
  }
}