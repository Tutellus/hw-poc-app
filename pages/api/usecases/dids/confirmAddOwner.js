import { config } from '../../config.js'
import { ethers } from 'ethers'
import { getOne as getOneDID, update as updateDID } from '../../repositories/dids'
import { update as updateTx, markAsExecuting, markAsExecuted } from '../../repositories/txs'
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
    const safeData = await getSafeData(safe);
    const currentThreshold = safeData.threshold;

    const originalData = safeContract.interface.encodeFunctionData(
      'addOwnerWithThreshold',
      [
        did.externalWallet,
        currentThreshold
      ]
    );

    const data = {
      to: safe,
      value: 0,
      data: originalData,
      operation: 0,
    }

    const tx = await create({
      chainId,
      safe,
      data,
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

    const signatures = [signature0, signature1];
    
    const receipt = await executeTx({
      safe,
      ...tx,
      signatures: sortSignatures({
        signatures,
        contractTransactionHash,
      }),
    })

    await updateDID({
      id: did._id,
      fields: {
        externalWalletStatus: 'CONFIRMED',
      }
    })

    const tx2 = await updateTx({
      fields: {
        did: did._id,
        ...tx,
        chainId,
        signatures,
        executionTxHash: receipt.transactionHash,
        safe,
      },
    })

    await markAsExecuted(tx2._id)

  } catch (error) {
    console.error(error)
    return {
      error: 'Error'
    }
  }
}