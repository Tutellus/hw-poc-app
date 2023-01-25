import { config } from '../../config.js'
import { ethers } from 'ethers'
import { markAsExecuting, update as updateTx } from '../../repositories/txs'
import { update as updateDID, getOne as getOneDID } from '../../repositories/dids'
import { create, getSafeData, push, sign } from '../../utils/safe.js'
import { execute as executeOwnerTransaction } from '../safe/executeOwnerTransaction.js'

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

    // Create tx confirming
    const tx = await updateTx({
      fields: {
        did: did._id,
        code2fa: code,
        originalData,
      },
    });

    const data = {
      to: safe,
      data: originalData,
      value: 0,
      operation: 0,
    };

    const result = await create(chainId, safe, data, owner0Wallet)
    await push(chainId, safe, result)

    const signature2 = sign(result.contractTransactionHash, owner1Wallet)

    await push(chainId, did.ownerMS, {
      ...result,
      signature: signature2,
      // signatures: undefined,
      // did: undefined,
      // _id: undefined,
      sender: owner1Wallet.address,
    });

    const signatures = [result.signature, signature2];

    // Create tx confirming
    await updateTx({
      id: tx._id,
      fields: {
        ...result,
        signatures,
      },
    });

    // Mark tx as executing
    await markAsExecuting(tx._id)

    // Execute tx
    await executeOwnerTransaction({
      txId: tx._id,
    });

    // Update DID
    await updateDID({
      id: did._id,
      fields: {
        externalWalletStatus: 'CONFIRMED',
      },
    })

  } catch (error) {
    console.error(error)
    return {
      error: 'Error'
    }
  }
}