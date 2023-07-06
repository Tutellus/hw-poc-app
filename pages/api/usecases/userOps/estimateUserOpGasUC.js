// estimateUserOpGasUC.js
const { ethers } = require('ethers');
const assert = require('assert');
const { config } = require('../../config');
const preUserOpsRepository = require('../../repositories/preUserOps');

export default async function handler(req, res) {
  const { params, user } = req.body;
  const userOps = await execute({ params, user });
  res.status(200).json({ userOps });  
}

export async function execute({ userOp }) {
  try {
    const { sender, calldata, preUserOpId, chainId } = userOp;
    assert(sender, 'humanId is required');
    assert(preUserOpId, 'preUserOpId is required');
    assert(chainId, 'chainId is required');
    
    const { rpc, entryPoint } = config[chainId];
    assert(rpc, 'rpc is required');
    assert(entryPoint, 'entryPoint is required');
    
    const preUserOp = await preUserOpsRepository.getOne({ _id: preUserOpId });
    assert(preUserOp, 'preUserOp not found');
    const { target, data, value } = preUserOp;

    const provider = new ethers.providers.JsonRpcProvider(rpc);

    const userOpGas = await provider.estimateGas({
      from: sender,
      to: target,
      data,
      value,
    });
    
    const executeGas = await provider.estimateGas({
      from: entryPoint,
      to: sender,
      data: calldata,
    });

    const result = userOpGas.add(executeGas);
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}