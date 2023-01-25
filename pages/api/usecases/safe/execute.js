import { ethers } from 'ethers'
import { config } from '../../config'

import GnosisSafe from '../../abi/GnosisSafe.json'

export async function execute({
  safe,
  to,
  value,
  data,
  operation,
  safeTxGas,
  baseGas,
  gasPrice,
  gasToken,
  refundReceiver,
  contractTransactionHash,
  signatures,
}) {
  try {
    const { serverKey, rpcUrl } = config
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const serverWallet = new ethers.Wallet(serverKey, provider)
    const safeContract = new ethers.Contract(safe, GnosisSafe.abi, serverWallet)
  
    const sortedSignatures = signatures.sort((a, b) => {
      const aAddress = ethers.utils.recoverAddress(contractTransactionHash, a)
      const bAddress = ethers.utils.recoverAddress(contractTransactionHash, b)
      return aAddress.localeCompare(bAddress)
    })
  
    const signaturesBytes = ethers.utils.solidityPack(
      sortedSignatures.map(() => 'bytes'),
      sortedSignatures
    );
      
    const executeTx = await safeContract.execTransaction(
      to,
      value,
      data,
      operation,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signaturesBytes
    );
  
    const receipt = await executeTx.wait()
  
    return receipt
  } catch (error) {
    con
  }
  
}
