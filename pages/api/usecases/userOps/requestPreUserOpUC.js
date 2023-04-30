// requestPreUserOpUC.js

const { ethers } = require('ethers');
const getHumanByUserUC = require('../humans/getHumanByUserUC');
const checkExecuteCheckOwnerUC = require('../policies/checkExecuteCheckOwnerUC');
const assert = require('assert');
const contractsRepository = require('../../repositories/contracts');
const preUserOpsRepository = require('../../repositories/preUserOps');

export default async function handler(req, res) {
  const { user, contractId, method, params, value } = req.body;
  const preUserOp = await execute({
    user,
    contractId,
    method,
    params,
    value,
  });
  res.status(200).json({ preUserOp });
}

export async function execute({
  user,
  contractId,
  method = '',
  params = [],
  value = '0',
}) {
  try {
    const human = await getHumanByUserUC.execute({ user });
    assert(human, 'Human not found');

    const contract = await contractsRepository.getOne({ _id: contractId });
    assert(contract, 'Contract not found');
    assert(contract.status !== 'LOCKED', 'Contract locked');

    const contractInterface = new ethers.utils.Interface(contract.abi);
    const data = contractInterface.encodeFunctionData(method, params);

    const isMasterRequired = await checkExecuteCheckOwnerUC.execute({
      contractId: contract._id,
      method,
      params,
      value,
    });

    const preUserOp = await preUserOpsRepository.update({
      fields: {
        humanId: human._id,
        user: user,
        target: contract.address,
        data,
        value,
        isMasterRequired,
        masterSignature: "0x",
      },
    });

    return preUserOp;
  } catch (error) {
    console.error(error)
    throw error;
  }
}