// submitUserOpUC.js

const { ethers } = require('ethers');
const getHumanByAddressUC = require('../humans/getHumanByAddressUC');
const assert = require('assert');
const preUserOpsRepository = require('../../repositories/preUserOps');
const userOpsRepository = require('../../repositories/userOps');
const shared = require('./shared');
const { config } = require('../../config');

export default async function handler(req, res) {
  const { preUserOpId, signature, user } = req.body;
  const userOp = await execute({ preUserOpId, signature, user });
  res.status(200).json({ userOp });
}

export async function execute({ preUserOpId, signature, user }) {
  try {
    const preUserOp = await preUserOpsRepository.getOne({ _id: preUserOpId });
    const {
      humanId,
      target,
      data,
      value,
      isMasterRequired,
      masterSignature,
    } = preUserOp;
    
    // assert(userId === user._id, 'User not allowed');
    assert(!isMasterRequired || masterSignature !== '0x', 'Master signature required');

    const executeData = shared.getExecuteData({
      target,
      data,
      value,
      signature: masterSignature,
    });

    console.log('executeData', executeData);

    const human = await getHumanByAddressUC.execute({ address: humanId });
    console.log('human', human);
    assert(human, 'Human not found');

    const userOpData = shared.getEmptyUserOperation();
    userOpData.sender = human.address;
    userOpData.nonce = human.nonce;
    userOpData.callData = executeData;

    console.log('userOpData', userOpData);

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

    console.log('recoveredAddress', recoveredAddress);
    console.log('owner', owner);

    assert(recoveredAddress.toLowerCase() === owner.toLowerCase(), 'Invalid signature');

    const userOp = await userOpsRepository.update({
      fields: {
        ...userOpData,
        signature,
      }
    });

    return userOp;
  } catch (error) {
    console.error(error)
    throw error;
  }
}