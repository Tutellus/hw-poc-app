// submitUserOpUC.js

const { ethers } = require('ethers');
const getHumanByAddressUC = require('../humans/getHumanByAddressUC');
const assert = require('assert');
const preUserOpsRepository = require('../../repositories/preUserOps');
const userOpsRepository = require('../../repositories/userOps');
const shared = require('./shared');
const { config } = require('../../config');
const handleUserOpsUC = require('./handleUserOpsUC');
const estimateUserOpGasUC = require('./estimateUserOpGasUC');

export default async function handler(req, res) {
  const { preUserOpId, signature, user } = req.body;
  const userOp = await execute({ preUserOpId, signature, user });
  res.status(200).json({ userOp });
}

export async function execute({ preUserOpId, signature, user }) {
  try {
    const preUserOp = await preUserOpsRepository.getOne({ _id: preUserOpId });
    const {
      user: innerUser,
      chainId,
      sender,
      target,
      data,
      value,
      isMasterRequired,
      masterSignature,
    } = preUserOp;
    
    // assert(user === innerUser, 'User not allowed');
    assert(!isMasterRequired || masterSignature !== '0x', 'Master signature required');

    const executeData = shared.getExecuteData({
      target,
      data,
      value,
      signature: masterSignature,
    });

    const human = await getHumanByAddressUC.execute({ address: sender, chainId });
    assert(human && human.status === 'CONFIRMED', 'Human not found');

    const { entryPoint } = config[chainId];

    const userOpData = shared.getEmptyUserOperation();
    userOpData.humanId = human._id;
    userOpData.sender = human.address;
    userOpData.nonce = human.nonce;
    userOpData.callData = executeData;
    userOpData.user = user;
    userOpData.chainId = chainId;
    userOpData.preUserOpId = preUserOpId;
    userOpData.projectId = preUserOp.projectId;

    const hash = shared.getUserOpHash({
      userOpData,
      entryPoint,
      chainId,
    });

    // verify signature
    const { owner } = human;
    const recoveredAddress = ethers.utils.verifyMessage(hash, signature);

    assert(recoveredAddress.toLowerCase() === owner.toLowerCase(), 'Invalid signature');

    userOpData.signature = signature;
    userOpData.callGasLimit = await estimateUserOpGasUC.execute({ userOp: userOpData });

    const userOp = await userOpsRepository.update({
      fields: userOpData,
    });

    await preUserOpsRepository.markAsProcessed(preUserOpId);
    await preUserOpsRepository.update({
      id: preUserOpId,
      fields: {
        userOpId: userOp._id,
      },
    });

    handleUserOpsUC.execute({ userOps: [userOp] })

    return userOp;
  } catch (error) {
    console.error(error)
    throw error;
  }
}