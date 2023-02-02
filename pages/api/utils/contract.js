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

// function checkIfProxy (bytecode) {
//   return bytecode.includes('360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');
// }

// function getConstructorParams

// TODO: verify contract implementation if proxy
export async function verifyContract ({
  provider,
  address,
  abi,
}) {
  const contract = new ethers.Contract(address, abi, provider);
  const storageImplementation = await provider.getStorageAt(address, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc');

  let implementationAddress = address;
  let isProxy = false;

  if (storageImplementation !== ethers.constants.HashZero) {
    implementationAddress = ethers.utils.hexDataSlice(storageImplementation, 12);
    isProxy = true;
  }

  const bytecode = await contract.provider.getCode(implementationAddress);

  if (bytecode === '0x') {
    return false;
  }

  let verified = true;

  for (const item of abi) {
    const functionName = getFunctionName(item);
    if (functionName) {

      const encodedFunctionName = contract.interface.getSighash(functionName).slice(2, 10);

      if (!bytecode.includes(encodedFunctionName)) {
        console.log('not verified', functionName)
        verified = false;
        break
      }

    }
  }

  return {
    verified,
    isProxy,
    implementationAddress,
  };

}