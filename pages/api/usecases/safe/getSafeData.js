import { getSafeData } from '../../utils/safe'

export default async function handler(req, res) {
  const { safe, chainId } = req.body;
  const safeData = await execute({ safe, chainId });
  res.status(200).json({ safeData })
}

export async function execute ({ safe, chainId }) {
  const safeData = await getSafeData({ safe, chainId });
  return safeData;
}