import { getOne as getContract } from '../../repositories/contracts';

export default async function handler(req, res) {
  try {
    const { filter } = req.body;
    const contract = await execute({ filter });
    res.status(200).json({ contract })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ filter }) {
  try {
    const contract = await getContract(filter);
    return contract;
  } catch (error) {
    console.error(error)
    throw error;
  }
}