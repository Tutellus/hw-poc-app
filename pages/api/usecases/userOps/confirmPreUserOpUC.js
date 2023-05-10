// getPreUserOpHashUC.js

import { ethers } from 'ethers';

const assert = require('assert');
const preUserOpsRepository = require('../../repositories/preUserOps');
const shared = require('./shared');
const { config } = require('../../config');

export default async function handler(req, res) {
  const { preUserOpId, code, user } = req.body;
  const hash = await execute({ preUserOpId, code, user });
  res.status(200).json({ hash });  
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

    return masterSignature;
  } catch (error) {
    console.error(error)
    throw error;
  }
}