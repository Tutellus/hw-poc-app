import { config } from '../../config'
import { ethers } from 'ethers'
import { create } from '../../utils/safe'
import { wrapOwner } from '../../utils/did';
import { getOne as getOneDID } from '../../repositories/dids';
import { update as updateTx, getOne as getOneTx, markAsCreated } from '../../repositories/txs';

export async function execute ({
  txId,
  destination,
  data,
  value,
  gas,
}) {

  const tx = await getOneTx({ _id: txId })

  if (!tx || tx.status !== 'CREATING') {
    return {
      error: 'Transaction not executable'
    }
  }
  
  const { chainId, rpcUrl, ownerKeys } = config

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)

  const {
    did: didId,
  } = tx;

  const did = await getOneDID({ _id: didId })

  if (!did) {
    return {
      error: 'DID not found'
    }
  }

  const {
    address: didAddress,
    ownerMS: safe,
  } = did;

  const wrappedCalldata = wrapOwner({
    destination,
    data,
    value,
    gas,
  })

  const txData = {
    to: didAddress,
    data: wrappedCalldata,
    value: 0,
    operation: 0,
  };

  const owner0Wallet = new ethers.Wallet(ownerKeys[0], provider)

  const result = await create({
    chainId,
    safe,
    data: txData,
    signer: owner0Wallet
  })

  const signatures = [result.signature];

  const fields = {
    ...result,
    signatures,
    chainId,
    safe,
  };

  await updateTx({
    id: txId,
    fields,
  });

  await markAsCreated(txId);
}