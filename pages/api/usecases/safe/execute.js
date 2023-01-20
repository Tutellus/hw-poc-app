import { config } from '../../config';
import { ethers } from 'ethers'
import { abi as GnosisSafeABI } from '../../abi/GnosisSafe.json'

export default async function handler(req, res) {
  const { safe, tx } = req.body;
  const response = await execute({ safe, tx });
  res.status(200).json(response)
}

export async function execute({ safe, tx }) {
  try {
    const { serverKey, rpcUrl } = config

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const serverWallet = new ethers.Wallet(serverKey, provider)
    const safeContract = new ethers.Contract(safe, GnosisSafeABI, serverWallet)

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
    
    return {
      executeTx,
      receipt,
    };
  } catch (error) {
    console.error(error)
    return false;
  }
}