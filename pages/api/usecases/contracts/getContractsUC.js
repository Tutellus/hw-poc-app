const contractsRepository = require('../../repositories/contracts');

export default async function handler(_, res) {
  try {
    const response = await execute();
    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute() {
  try {
    const contracts = await contractsRepository.get();
    return contracts;
  } catch (error) {
    console.error(error)
    throw error;
  }
}