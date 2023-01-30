import { utils, constants, ethers } from 'ethers';
import { config } from '../config';
import { get as getProposals } from '../repositories/proposals';
import GnosisSafe from '../abi/GnosisSafe.json';

async function estimateGas ({
  chainId,
  safe,
  to,
  value,
  data,
}) {

  const { rpc } = config[chainId];

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const safeTxGas = await provider.estimateGas({
    to,
    value,
    data,
    from: safe,
  });

  return safeTxGas;
};

async function getNextNonce (safe) {
  const pipeline = [
    { $match: {
      safe,
      status: 'EXECUTED',
    } },
  ]
  const proposals = await getProposals(pipeline) || [];
  return proposals.length
};

async function getSafeData ({ safe, chainId }) {
  const { rpc } = config[chainId];
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const safeContract = new ethers.Contract(safe, GnosisSafe.abi, provider);
  const [owners, thresholdBN, nonceBN, nextNonce] = await Promise.all([
    safeContract.getOwners(),
    safeContract.getThreshold(),
    safeContract.nonce(),
    getNextNonce(safe),
  ])

  const threshold = thresholdBN.toNumber();
  const nonce = nonceBN.toNumber();

  const result = {
    address: safe,
    owners,
    threshold,
    nonce,
    nextNonce,
  }
  return result;
};

async function create ({
  chainId,
  safe,
  data,
  signer,
  nonce,
}) {

  if (!nonce) {
    nonce = await getNextNonce(safe);
  }

  const safeTxGas = await estimateGas({
    chainId,
    safe,
    ...data,
  });

  const wrappedData = {
    ...data,
    safe,
    safeTxGas,
    gasPrice: 0,
    baseGas: 0,
    gasToken: constants.AddressZero,
    refundReceiver: constants.AddressZero,
    nonce,
    sender: signer.address,
    origin: 'Shared Wallet Concept',
  };

  const { signature, contractTransactionHash } = sign({
    safe,
    chainId,
    ...wrappedData,
    signer,
  });

  const result = {
    ...wrappedData,
    contractTransactionHash,
    signature,
  };

  return result;
};

function sortSignatures ({
  signatures,
  contractTransactionHash
}) {
  const sortedSignatures = signatures.sort((a, b) => {
    const aAddress = ethers.utils.recoverAddress(contractTransactionHash, a)
    const bAddress = ethers.utils.recoverAddress(contractTransactionHash, b)
    return aAddress.localeCompare(bAddress)
  })
  return sortedSignatures;
};

function sign ({
  safe,
  chainId,
  to,
  value,
  data,
  operation,
  safeTxGas,
  baseGas,
  gasPrice,
  gasToken,
  refundReceiver,
  nonce,
  signer,
}) {
  try {
    const domain = {
      chainId,
      verifyingContract: safe,
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
      to,
      value,
      data,
      operation,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      nonce,
    };

    const contractTransactionHash = utils._TypedDataEncoder.hash(domain, types, message);
    return {
      signature: utils.joinSignature(signer._signingKey().signDigest(contractTransactionHash)),
      contractTransactionHash,
    } 
  } catch (error) {
    console.error(error);
    return null;
  }
};

export {
  getSafeData,
  sign,
  create,
  sortSignatures,
};