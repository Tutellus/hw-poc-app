// estimateUserOpGasUC.js
const { ethers } = require('ethers');
const assert = require('assert');
const { config } = require('../../config');

export default async function handler(req, res) {
  const { params, user } = req.body;
  const userOps = await execute({ params, user });
  res.status(200).json({ userOps });  
}

export async function execute({ userOp }) {
  try {
    const { rpc, entryPoint } = config['0x13881'];
    const { humanId, calldata } = userOp;
    assert(humanId, 'humanId is required');

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const result = await provider.estimateGas({
      from: entryPoint,
      to: humanId,
      data: calldata,
    });

    return result.toString();
  } catch (error) {
    console.error(error)
    throw error;
  }
}