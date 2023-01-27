import { config } from '../../config'
import { ethers } from 'ethers'
import { create } from '../../utils/safe'
import { wrapOwner } from '../../utils/proxy';
import { getOne as getOneProxy } from '../../repositories/proxies';
import { update as updateTx, getOne as getOneTx, markAsCreated } from '../../repositories/submitals';

export async function execute ({
  tx,
  destination,
  data,
  value,
  gas,
}) {

  if (!tx || tx.status !== 'CREATING') {
    return {
      error: 'Transaction not executable'
    }
  }
  
  const { chainId, rpcUrl, ownerKeys } = config

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)

  const proxy = await getOneProxy({ _id: tx.proxy })

  if (!proxy) {
    return {
      error: 'Proxy not found'
    }
  }

  const {
    address: proxyAddress,
    ownerSafe: safe,
  } = proxy;

  const wrappedCalldata = wrapOwner({
    destination,
    data,
    value,
    gas,
  })

  const txData = {
    to: proxyAddress,
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
    id: tx._id,
    fields,
  });

  await markAsCreated(tx._id);
}