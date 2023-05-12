// getPreUserOpsUC.js
const preUserOpsRepository = require('../../repositories/preUserOps');

export default async function handler(req, res) {
  const { params, user } = req.body;
  const preUserOps = await execute({ params, user });
  res.status(200).json({ preUserOps });  
}

export async function execute({ params, user }) {
  try {
    const preUserOps = await preUserOpsRepository.getWithParams(params);
    return preUserOps;
  } catch (error) {
    console.error(error)
    throw error;
  }
}