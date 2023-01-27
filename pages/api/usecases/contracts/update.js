import { update as updateContract } from '../../repositories/contracts';

export default async function handler(req, res) {
  const { contractId, abi, address, chainId } = req.body;
  const response = await execute({ contractId, abi, address, chainId });
  res.status(200).json(response)
}

export async function execute({
  contractId,
  abi,
  address,
  chainId,
}) {
  try {
    const contract = await updateContract({
      id: contractId,
      fields: {
        abi,
        address,
        chainId,
      }
    });
    return contract;
  } catch (error) {
    console.error(error)
    throw error;
  }
}