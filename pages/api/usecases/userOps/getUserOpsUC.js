// getUserOpsUC.js
const assert = require('assert');
const userOpsRepository = require('../../repositories/userOps');
const subgraphServices = require('../../gateway/subgraph/services');

export default async function handler(req, res) {
  const { params, user } = req.body;
  const userOps = await execute({ params, user });
  res.status(200).json({ userOps });  
}

export async function execute({ params, user }) {
  try {
    const userOps = await userOpsRepository.getWithParams(params);

    const { humanId } = params.where || {};
    assert(humanId, 'humanId is required');

    const nonces = userOps.map((userOp) => userOp.nonce);
    const whereFilter = {
      nonce_in: nonces,
      human: humanId?.toLowerCase(),
    };

    const [executions, userOperationReverteds] = await Promise.all([
      subgraphServices.getExecutions({ where: whereFilter }),
      subgraphServices.getUserOperationReverteds({ where: whereFilter }),
    ]);

    const result = userOps.map((userOp) => {
      const execution = executions.find((execution) => execution.nonce === userOp.nonce);
      const userOperationReverted = userOperationReverteds.find((userOperationReverted) => userOperationReverted.nonce === userOp.nonce);

      if (execution) {
        return {
          ...userOp,
          status: 'CONFIRMED',
        };
      }

      if (userOperationReverted) {
        return {
          ...userOp,
          status: 'REVERTED',
        };
      }

      return {
        ...userOp,
      };
    });

    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}