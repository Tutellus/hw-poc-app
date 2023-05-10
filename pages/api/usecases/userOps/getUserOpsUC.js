// getUserOpsUC.js
const userOpsRepository = require('../../repositories/userOps');

export default async function handler(req, res) {
  const { params, user } = req.body;
  const userOps = await execute({ params, user });
  res.status(200).json({ userOps });  
}

export async function execute({ params, user }) {
  try {
    const userOps = await userOpsRepository.getWithParams(params);
    return userOps;
  } catch (error) {
    console.error(error)
    throw error;
  }
}