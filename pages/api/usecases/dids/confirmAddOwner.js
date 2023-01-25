import { config } from '../../config.js'
import { ethers } from 'ethers'
import { update as updateTx } from '../../repositories/txs'
import { update as updateDID, getOne as getOneDID } from '../../repositories/dids'
import { getSafeData } from '../../utils/safe.js'
import { execute as createOwnerTransaction } from '../safe/createOwnerTransaction.js'
import { execute as executeOwnerTransaction } from '../safe/executeOwnerTransaction.js'

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

    const gas = await safeContract.estimateGas.addOwnerWithThreshold(
      did.externalWallet,
      currentThreshold
    );

    const tx = await updateTx({
      fields: {
        did: did._id,
        code2fa: code,
        originalData,
      },
    })

    await createOwnerTransaction({
      txId: tx._id,
      destination: safe,
      value: 0,
      data: originalData,
      gas,
    });

    await executeOwnerTransaction({
      txId: tx._id,
    });

    await updateDID({
      _id: did._id,
      externalWalletStatus: 'CONFIRMED',
    })

  } catch (error) {
    console.error(error)
    return {
      error: 'Error'
    }
  }
}