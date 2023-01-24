import { ethers } from "ethers";

const decodeTransactionData = (abi, data) => {
  try {
    const iface = new ethers.utils.Interface(abi);
    const decoded = iface.parseTransaction({ data });
    return decoded;
  } catch (error) {
    return {
      name: 'Unknown',
      args: [],
    };
  }
}

export {
  decodeTransactionData,
}