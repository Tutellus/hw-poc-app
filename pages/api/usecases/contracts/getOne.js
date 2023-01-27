import { getOne as getOneContract } from '../../repositories/contracts';

export default async function handler(req, res) {
  try {
    const { contractId } = req.body;
    const response = await execute({ contractId });
    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ contractId }) {
  try {
    const contract = await getOneContract({ _id: contractId });
    if (!contract) {
      throw new Error('Contract not found');
    }
    return contract;
  } catch (error) {
    console.error(error)
    throw error;
  }
}