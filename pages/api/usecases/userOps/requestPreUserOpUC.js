// requestPreUserOpUC.js

const { ethers } = require('ethers');
const getHumanByEmailUC = require('../humans/getHumanByEmailUC');
const checkExecuteCheckOwnerUC = require('../policies/checkExecuteCheckOwnerUC');
const assert = require('assert');
const contractsRepository = require('../../repositories/contracts');
const preUserOpsRepository = require('../../repositories/preUserOps');

export default async function handler(req, res) {
  const { user, chainId, projectId, address, method, params, value } = req.body;
  const preUserOp = await execute({
    user,
    chainId,
    projectId,
    address,
    method,
    params,
    value,
  });
  res.status(200).json({ preUserOp });
}

export async function execute({
  user,
  chainId,
  projectId,
  address,
  method = '',
  params = [],
  value = '0',
}) {
  try {
    const unstructuredParams = params.map((param) => {
      if (typeof param === 'object') {
        if (param.type === 'BigNumber') {
          return ethers.BigNumber.from(param.hex).toString();
        }
      }
      return param;
    });

    const stringValue = () => {
      if (typeof value === 'object') {
        if (value.type === 'BigNumber') {
          return ethers.BigNumber.from(value.hex).toString();
        }
      }
      return value;
    }

    const contract = await contractsRepository.getOne({
      address,
      chainId,
    });
    assert(contract, 'Contract not found');
    assert(contract.status !== 'LOCKED', 'Contract locked');

    const human = await getHumanByEmailUC.execute({ projectId, chainId, email: user.email });
    assert(human && human?.status === 'CONFIRMED', 'Human not found');

    const contractInterface = new ethers.utils.Interface(contract.abi);
    const data = contractInterface.encodeFunctionData(method, unstructuredParams);

    const isMasterRequired = !(await checkExecuteCheckOwnerUC.execute({
      chainId,
      address,
      method,
      params: unstructuredParams,
      value: stringValue(),
    }));

    let code2fa = null;
    if (isMasterRequired) {
      // create code and send email
      code2fa = '123456';
    }

    let result = await preUserOpsRepository.update({
      fields: {
        sender: human.address,
        humanId: human._id,
        projectId,
        chainId,
        method,
        params: unstructuredParams,
        user,
        target: contract.address,
        data,
        value: stringValue(),
        isMasterRequired,
        masterSignature: "0x",
        code2fa,
      },
    });

    if (!isMasterRequired) {
      result = await preUserOpsRepository.markAsSignable(result._id);
    }

    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}