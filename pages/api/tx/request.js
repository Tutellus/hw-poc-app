import { config } from '../config'
import { ethers, constants, Contract, utils } from 'ethers'
import { create, push } from '../utils/safe'
import { wrapOwner } from '../utils/did';
import { get as getTxs, update as updateTx } from '../repositories/txs';

const TOKENADDRESS = '0xDf0cd3453B593DB224B020275ceF045f4B073cd0'
const TOKENABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
];

export default async function handler(req, res) {
  const { did } = req.body;
  const response = await request({ did });
  res.status(200).json(response)
}

async function request({
  did,
}) {
  try {
    const { chainId, rpcUrl, serverKey, ownerKeys } = config

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)
    const serverWallet = new ethers.Wallet(serverKey, provider)
    const owner0Wallet = new ethers.Wallet(ownerKeys[0], provider)

    const randomWallet = ethers.Wallet.createRandom()
    const randomAddress = randomWallet.address
  
    const tokenContract = new Contract(TOKENADDRESS, TOKENABI, serverWallet)
    const txCalldata = tokenContract.interface.encodeFunctionData('approve', [randomAddress, constants.MaxUint256])
    const gasEstimation = await tokenContract.estimateGas.approve(randomAddress, constants.MaxUint256)
  
    const wrappedCalldata = wrapOwner({
      destination: TOKENADDRESS,
      data: txCalldata,
      value: 0,
      gas: gasEstimation,
    })

    const data = {
      to: utils.getAddress(did.address),
      data: wrappedCalldata,
      value: 0,
      operation: 0,
    };
  
    const signedTx = await create(chainId, did.ownerMS, data, owner0Wallet)
    await push(chainId, did.ownerMS, signedTx)

    const txs = await getTxs() || [];
    const tx = txs.find(tx => tx.contractTransactionHash === signedTx.contractTransactionHash);

    if (tx) {
      const signatures = tx.signatures || [];
      if (!signatures.includes(signedTx.signature)) {
        signatures.push(signedTx.signature);
      }
      return await updateTx({
        id: tx._id,
        fields: {
          signatures,
        }
      })
    } else {
      const signatures = [signedTx.signature];
      return await updateTx({
        fields: {
          ...signedTx,
          signature: null,
          signatures,
          did: did._id,
        }
      })
    }
  } catch (error) {
    console.error(error)
    return {};
  }
}