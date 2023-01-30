import { ethers } from 'ethers';

function getFunctionName (item) {
  switch (typeof item) {
    case 'string':
      if (item.includes('function')) {
        return item.split(' ')[1].split('(')[0];
      }
      return null;
    case 'object':
      if (item.type === 'function') {
        return item.name;
      }
      return null;
    default:
      return null;
  }
}


// TODO: verify contract implementation if proxy
export async function verifyContract ({
  provider,
  address,
  abi,
}) {
  const contract = new ethers.Contract(address, abi, provider);
  const bytecode = await contract.provider.getCode(address);
  if (bytecode === '0x') {
    return false;
  }

  let verified = true;

  for (const item of abi) {
    const functionName = getFunctionName(item);
    if (functionName) {
      // const encodedFunctionName = contract.interface.encodeFunctionData(functionName);
      const encodedFunctionName = contract.interface.getSighash(functionName).slice(2, 10);
      if (!bytecode.includes(encodedFunctionName)) {
        verified = false;
        break
      }
    }
  }

  return verified;

}