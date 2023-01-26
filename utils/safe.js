const signTransaction = async ({
  tx,
  signer,
}) => {
  try {
    const domain = {
      chainId: tx.chainId,
      verifyingContract: tx.safe,
    };
    const types = {
      SafeTx: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "operation", type: "uint8" },
        { name: "safeTxGas", type: "uint256" },
        { name: "baseGas", type: "uint256" },
        { name: "gasPrice", type: "uint256" },
        { name: "gasToken", type: "address" },
        { name: "refundReceiver", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    };
    const message = {
      to: tx.to,
      value: tx.value,
      data: tx.data,
      operation: tx.operation,
      safeTxGas: tx.safeTxGas,
      baseGas: tx.baseGas,
      gasPrice: tx.gasPrice,
      gasToken: tx.gasToken,
      refundReceiver: tx.refundReceiver,
      nonce: tx.nonce,
    };
    const signature = await signer._signTypedData(domain, types, message);
    return signature;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export {
  signTransaction,
}