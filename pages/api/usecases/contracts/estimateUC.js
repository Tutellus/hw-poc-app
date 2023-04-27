import { ethers } from 'ethers';
import { config } from '../../config';

export async function execute({
  contract,
  from,
  method,
  params,
  value,
}) {
  try {
    const { rpc } = config[contract.chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const contractInstance = new ethers.Contract(contract.address, contract.abi, provider);
    const result = {
      to: contract.address,
      data: contractInstance.interface.encodeFunctionData(method, params),
      value,
      gas: await contractInstance.estimateGas[method](...params, { from }),
    }
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}