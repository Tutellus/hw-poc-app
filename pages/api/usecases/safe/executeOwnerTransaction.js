import { ethers } from 'ethers'
import { config } from '../../config';
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx, update as updateTx, markAsExecuted } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';
import { execute as executeTx } from './execute';

import GnosisSafe from '../../abi/GnosisSafe.json'

export async function execute({
  txId,
}) {

  // Check if tx exists
  const tx = await getOneTx({ _id: txId })
  if (!tx) {
    return {
      error: 'Transaction not found'
    }
  }

  // Check if did exists
  const did = await getOneDID({ _id: tx.did })
  if (!did) {
    return {
      error: 'DID not found'
    }
  }

  // Check if tx is executable
  const { chainId } = config
  const { threshold } = await getSafeData(chainId, did.ownerMS)
  if (tx.signatures.length < threshold) {
    return {
      error: 'Transaction not executable'
    }
  }

  // Execute the transaction
  const receipt = await executeTx(tx);

  // const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  // const serverWallet = new ethers.Wallet(serverKey, provider)
  // const safeContract = new ethers.Contract(did.ownerMS, GnosisSafe.abi, serverWallet)

  // const sortedSignatures = tx.signatures.sort((a, b) => {
  //   const aAddress = ethers.utils.recoverAddress(tx.contractTransactionHash, a)
  //   const bAddress = ethers.utils.recoverAddress(tx.contractTransactionHash, b)
  //   return aAddress.localeCompare(bAddress)
  // })

  // const signaturesBytes = ethers.utils.solidityPack(
  //   sortedSignatures.map(() => 'bytes'),
  //   sortedSignatures
  // );

  // const executeTx = await safeContract.execTransaction(
  //   tx.to,
  //   tx.value,
  //   tx.data,
  //   tx.operation,
  //   tx.safeTxGas,
  //   tx.baseGas,
  //   tx.gasPrice,
  //   tx.gasToken || constants.AddressZero,
  //   tx.refundReceiver || constants.AddressZero,
  //   signaturesBytes
  // );
  // const receipt = await executeTx.wait()

  await updateTx({
    id: txId,
    fields: {
      executionTxHash: receipt.executionTxHash,
      receipt,
    },
  })
  await markAsExecuted(txId)
}
