// handleUserOpsUC.js

const { ethers } = require('ethers');
const { config } = require('../../config');
const { abi: HumanEntryPointABI } = require('../../abi/HumanEntryPoint.json');
const executorInfra = require('../../infrastructure/executor');
const userOpsRepository = require('../../repositories/userOps');

export async function execute({ userOps }) {
  try {
    const { serverSigner, entryPoint, rpc } = config["0x13881"];

    const signer = new ethers.Wallet(serverSigner.kPriv, new ethers.providers.JsonRpcProvider(rpc)); 
    const entryPointContract = new ethers.Contract(entryPoint, HumanEntryPointABI, signer);

    const receipt = await executorInfra.execute({
      to: entryPoint,
      data: entryPointContract.interface.encodeFunctionData(
        'handleOps',
        [userOps, ethers.constants.AddressZero]
      ),
      value: 0,
      signer,
    });

    userOps.forEach(async (userOp) => {
      userOpsRepository.markAsExecuted({ id: userOp._id, receipt });
    });

    return receipt;
  } catch (error) {
    console.error(error)

    userOps.forEach(async (userOp) => {
      userOpsRepository.markAsFailed(userOp._id);
    });

    throw error;
  }
}