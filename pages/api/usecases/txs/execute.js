import { config } from '../../config';
import { ethers } from 'ethers'
import { getSafeData } from '../../utils/safe'
import { getOne as getOneTx, markAsExecuted, update as updateTx } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';
import GnosisSafe from '../../abi/GnosisSafe.json'

export default async function handler(req, res) {
  const { txId, user } = req.body;
  const response = await execute({ txId, user });
  res.status(200).json(response)
}

export async function execute({
  txId,
  user,
}) {
  try {
    const tx = await getOneTx({ _id: txId })
    if (!tx || tx.status !== 'PENDING') {
      return {
        error: 'Transaction not executable'
      }
    }
    const did = await getOneDID({ _id: tx.did })
    if (!did) {
      return {
        error: 'DID not found'
      }
    }
    if (did.userId !== user._id) {
      return {
        error: 'Unauthorized'
      }
    }
    const { serverKey, rpcUrl, chainId } = config
    const { threshold } = await getSafeData(chainId, did.ownerMS)
    if (tx.signatures.length < threshold) {
      return {
        error: 'Not enough signatures'
      }
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const serverWallet = new ethers.Wallet(serverKey, provider)
    const safeContract = new ethers.Contract(did.ownerMS, GnosisSafe.abi, serverWallet)

    const sortedSignatures = tx.signatures.sort((a, b) => {
      const aAddress = ethers.utils.recoverAddress(tx.contractTransactionHash, a)
      const bAddress = ethers.utils.recoverAddress(tx.contractTransactionHash, b)
      return aAddress.localeCompare(bAddress)
    })

    const signaturesBytes = ethers.utils.solidityPack(
      sortedSignatures.map(() => 'bytes'),
      sortedSignatures
    );

    const executeTx = await safeContract.execTransaction(
      tx.to,
      tx.value,
      tx.data,
      tx.operation,
      tx.safeTxGas,
      tx.baseGas,
      tx.gasPrice,
      tx.gasToken || constants.AddressZero,
      tx.refundReceiver || constants.AddressZero,
      signaturesBytes
    );
    const receipt = await executeTx.wait()
    await updateTx({
      id: tx._id,
      fields: {
        executionTxHash: executeTx.hash,
        receipt,
      },
    })
    await markAsExecuted(txId)
    return true
  } catch (error) {
    console.error(error)
    return false;
  }
}