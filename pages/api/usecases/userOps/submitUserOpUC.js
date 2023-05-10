// submitUserOpUC.js

const { ethers } = require('ethers');
const getHumanByAddressUC = require('../humans/getHumanByAddressUC');
const assert = require('assert');
const preUserOpsRepository = require('../../repositories/preUserOps');
const userOpsRepository = require('../../repositories/userOps');
const shared = require('./shared');
const { config } = require('../../config');
const handleUserOpsUC = require('./handleUserOpsUC');

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
      humanId,
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

    const human = await getHumanByAddressUC.execute({ address: humanId });
    assert(human, 'Human not found');

    const userOpData = shared.getEmptyUserOperation();
    userOpData.sender = human.address;
    console.log('human.nonce', human.nonce)
    userOpData.nonce = human.nonce;
    userOpData.callData = executeData;

    const chainId = "0x13881";
    const { entryPoint } = config[chainId];

    const hash = shared.getUserOpHash({
      userOpData,
      entryPoint,
      chainId,
    });

    // verify signature
    const { owner } = human;
    const recoveredAddress = ethers.utils.verifyMessage(hash, signature);

    assert(recoveredAddress.toLowerCase() === owner.toLowerCase(), 'Invalid signature');

    const userOp = await userOpsRepository.update({
      fields: {
        ...userOpData,
        preUserOpId: preUserOp._id,
        humanId,
        user,
        signature,
      }
    });

    const receipt = await handleUserOpsUC.execute({ userOps: [userOp] })

    const userOpResult = await userOpsRepository.markAsExecuted({
      id: userOp._id,
      receipt,
    });

    return userOpResult;
  } catch (error) {
    console.error(error)
    throw error;
  }
}