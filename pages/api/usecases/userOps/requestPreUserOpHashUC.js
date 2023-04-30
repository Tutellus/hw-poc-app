// requestPreUserOpHashUC.js

const getHumanByAddressUC = require('../humans/getHumanByAddressUC');
const assert = require('assert');
const preUserOpsRepository = require('../../repositories/preUserOps');
const shared = require('./shared');
const { config } = require('../../config');

export default async function handler(req, res) {
  const { preUserOpId } = req.body;
  const hash = await execute({ preUserOpId });
  res.status(200).json({ hash });  
}

export async function execute({ preUserOpId, user }) {
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
    return hash;
  } catch (error) {
    console.error(error)
    throw error;
  }
}