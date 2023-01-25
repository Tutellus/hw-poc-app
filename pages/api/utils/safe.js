import axios from 'axios';
import { utils, constants, Contract, Signer, ethers } from 'ethers';
import GnosisSafe from '../abi/GnosisSafe.json';

// ///////////////////////////////////////////////////////////////
// PRIVATE METHODS
// ///////////////////////////////////////////////////////////////

const query = async (method, url, data) => {
  try {
    return await axios({
      url,
      method,
      data,
    });
  } catch (error) {
    console.error('ERROR - QUERY:', error);
    return {};
  }
};

const getNetworkKey = (chainId) => {
  switch (chainId) {
    case 1:
      return '';
    case 4:
      return 'rinkeby.';
    case 5:
      return 'goerli.';
    case 137:
      return 'polygon.';
    case 56:
      return 'bsc.';
    case 100:
      return 'xdai.';
    case 73799:
      return 'volta.';
    default:
      return undefined;
  }
};

const getUrl = (chainId) => `https://safe-transaction.${getNetworkKey(chainId)}gnosis.io/api/v1`;

const getTransactions = async (chainId, safe) => {
  const baseUrl = getUrl(chainId);
  const url = `${baseUrl}/safes/${safe}/multisig-transactions`;
  const { data: result } = await query('GET', url);
  return {
    transactions: result.results,
  };
};

const estimateTx = async (chainId, safe, data) => {
  const baseUrl = getUrl(chainId);
  const url = `${baseUrl}/safes/${safe}/multisig-transactions/estimations/`;
  const response = await query('POST', url, data);
  return response.data;
};

const getNextNonce = async (chainId, safe) => {
  const { transactions } = await getTransactions(chainId, safe);
  return transactions?.length > 0
    ? (transactions[0].nonce || 0) + 1
    : 0;
};

// ///////////////////////////////////////////////////////////////
// PUBLIC METHODS
// ///////////////////////////////////////////////////////////////

async function getSafeData (chainId, safe) {
  const baseUrl = getUrl(chainId);
  const url = `${baseUrl}/safes/${safe}`;
  const { data: result } = await query('GET', url);
  return result;
};

async function push (chainId, safe, data) {
  const baseUrl = getUrl(chainId);
  const url = `${baseUrl}/safes/${safe}/multisig-transactions/`;
  const { data: result } = await query('POST', url, data);
  return result;
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
}

async function create ({
  chainId,
  safe,
  data,
  signer,
  nonce,
}) {

  if (!nonce) {
    nonce = await getNextNonce(chainId, safe);
  }

  const { safeTxGas } = await estimateTx(chainId, safe, data);

  const txData = {
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
    ...txData,
    signer,
  });
  const result = {
    ...txData,
    contractTransactionHash,
    signature,
  };
  return result;
};

function sortSignatures ({ signatures, contractTransactionHash }) {
  const sortedSignatures = signatures.sort((a, b) => {
    const aAddress = ethers.utils.recoverAddress(contractTransactionHash, a)
    const bAddress = ethers.utils.recoverAddress(contractTransactionHash, b)
    return aAddress.localeCompare(bAddress)
  })
  return sortedSignatures;
}

export {
  getSafeData,
  sign,
  create,
  push,
  sortSignatures,
};