const signProposal = async ({
  proposal,
  signer,
}) => {
  try {
    const domain = {
      chainId: proposal.chainId,
      verifyingContract: proposal.safe,
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
      to: proposal.to,
      value: proposal.value,
      data: proposal.data,
      operation: proposal.operation,
      safeTxGas: proposal.safeTxGas,
      baseGas: proposal.baseGas,
      gasPrice: proposal.gasPrice,
      gasToken: proposal.gasToken,
      refundReceiver: proposal.refundReceiver,
      nonce: proposal.nonce,
    };
    const signature = await signer._signTypedData(domain, types, message);
    return signature;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export {
  signProposal,
}