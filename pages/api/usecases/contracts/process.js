import { ethers } from 'ethers';
import { config } from '../../config';

export async function execute({
  contract,
  proxyAddress,
  method,
  params,
}) {
  try {
    const { rpc } = config[contract.chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const contractInstance = new ethers.Contract(contract.address, contract.abi, provider);
    const result = {
      to: contract.address,
      data: contractInstance.interface.encodeFunctionData(method, params),
      gas: await contractInstance.estimateGas[method](...params, { from: proxyAddress }),
    }
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}