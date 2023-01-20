import axios from 'axios';
import { utils, constants, Contract } from 'ethers';
import { abi as GnosisSafeABI } from '../abi/GnosisSafe.json';

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
    if (error.response.data) {
      throw new Error(JSON.stringify(error.response.data));
    }
    return undefined;
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

async function push (chainId, safe, data) {
  const baseUrl = getUrl(chainId);
  const url = `${baseUrl}/safes/${safe}/multisig-transactions/`;
  const { data: result } = await query('POST', url, data);
  return result;
};

function sign (hash, signer) {
  return utils.joinSignature(signer._signingKey().signDigest(hash));
};

async function create (chainId, safe, data, signer) {
  const safeContract = new Contract(safe, GnosisSafeABI, signer);
  const { safeTxGas } = await estimateTx(chainId, safe, data);
  const nonce = await getNextNonce(chainId, safe);
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
    origin: 'POC',
  };
  const contractTransactionHash = await safeContract.getTransactionHash(
    txData.to,
    txData.value,
    txData.data,
    txData.operation,
    txData.safeTxGas,
    txData.baseGas,
    txData.gasPrice,
    txData.gasToken,
    txData.refundReceiver,
    txData.nonce,
  );
  const signature = sign(contractTransactionHash, signer);
  const result = {
    ...txData,
    contractTransactionHash,
    signature,
  };
  return result;
};

export {
  sign,
  create,
  push,
};