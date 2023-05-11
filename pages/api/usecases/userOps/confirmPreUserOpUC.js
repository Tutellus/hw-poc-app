// confirmPreUserOpUC.js

const { ethers } = require('ethers');
const assert = require('assert');
const preUserOpsRepository = require('../../repositories/preUserOps');
const shared = require('./shared');
const { config } = require('../../config');

export default async function handler(req, res) {
  const { preUserOpId, code, user } = req.body;
  const preUserOp = await execute({ preUserOpId, code, user });
  res.status(200).json({ preUserOp });  
}

export async function execute({ preUserOpId, code, user }) {
  try {
    const preUserOp = await preUserOpsRepository.getOne({ _id: preUserOpId });
    const {
      user: innerUser,
      code2fa,
      humanId,
      target,
      data,
      value,
    } = preUserOp;

    assert(code === code2fa, 'Invalid code');

    const { serverSigner } = config['0x13881'];

    const masterSigner = new ethers.Wallet(serverSigner.kPriv);
    const masterSignature = await shared.masterSign({
      humanAddress: humanId,
      target,
      data,
      value,
      masterSigner,
    });

    await preUserOpsRepository.update({ id: preUserOpId, fields: {
      masterSignature,
    }});

    const result = await preUserOpsRepository.markAsSignable(preUserOpId);
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}