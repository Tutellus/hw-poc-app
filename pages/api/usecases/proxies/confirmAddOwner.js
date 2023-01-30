import { config } from '../../config.js'
import { ethers } from 'ethers'
import { getOne as getProxy, update as updateProxy } from '../../repositories/proxies'
// import { update as updateTx, markAsExecuted } from '../../repositories/submitals'
import { getOne as getProject } from '../../repositories/projects'
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
  proxyId,
  user,
}) {
  try {
    // Check if the Proxy exists
    const proxy = await getProxy({ _id: proxyId })
    if(!proxy) {
      throw new Error('Proxy not found')
    }

    // Check if the user is the owner of the Proxy
    if (proxy.userId !== user._id) {
      throw new Error('User not authorized')
    }

    // Check if the address is valid
    const canAddOwner = proxy.externalWallet.address && proxy.externalWallet.status === 'PENDING'
    if (!canAddOwner) {
      throw new Error('Invalid address')
    }

    // Check if the code is valid
    if (proxy.externalWallet.code2fa !== code) {
      throw new Error('Invalid code')
    }

    const project = await getProject({ _id: proxy.projectId });
    if (!project) {
      throw new Error('Project not found')
    }
    
    // Create tx
    // const { chainId, rpcUrl, ownerKeys } = config
    const { ownerKeys } = project;
    const { rpc } = config[proxy.chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const owner0Wallet = new ethers.Wallet(ownerKeys[0], provider);
    const owner1Wallet = new ethers.Wallet(ownerKeys[1], provider);
    
    const safe = proxy.ownerSafe
    const safeContract = new ethers.Contract(safe, GnosisSafe.abi, owner0Wallet);
    const { threshold } = await getSafeData(safe);

    const originalData = safeContract.interface.encodeFunctionData(
      'addOwnerWithThreshold',
      [
        proxy.externalWallet,
        threshold,
      ]
    );

    const data = {
      to: safe,
      value: 0,
      data: originalData,
      operation: 0,
    }

    // const tx = await create({
    //   chainId,
    //   safe,
    //   data,
    //   signer: owner0Wallet,
    // });

    // const { signature: signature0, contractTransactionHash } = sign({
    //   safe,
    //   chainId,
    //   ...tx,
    //   signer: owner0Wallet,
    // })

    // const { signature: signature1 } = sign({
    //   safe,
    //   chainId,
    //   ...tx,
    //   signer: owner1Wallet,
    // })

    // const signatures = [signature0, signature1];
    
    // const receipt = await executeTx({
    //   safe,
    //   ...tx,
    //   signatures: sortSignatures({
    //     signatures,
    //     contractTransactionHash,
    //   }),
    // })

    // await updateProxy({
    //   id: proxy._id,
    //   fields: {
    //     externalWalletStatus: 'CONFIRMED',
    //   }
    // })

    // const tx2 = await updateTx({
    //   fields: {
    //     proxy: proxy._id,
    //     ...tx,
    //     chainId,
    //     signatures,
    //     executionTxHash: receipt.transactionHash,
    //     safe,
    //   },
    // })

    // await markAsExecuted(tx2._id)

  } catch (error) {
    console.error(error)
    return {
      error: 'Error'
    }
  }
}