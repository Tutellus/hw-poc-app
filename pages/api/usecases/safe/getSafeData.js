import { getSafeData } from '../../utils/safe'

export default async function handler(req, res) {
  const { safe } = req.body;
  const safeData = await execute({ safe });
  res.status(200).json({ safeData })
}

export async function execute ({ safe }) {
  const safeData = await getSafeData(safe);
  return safeData;
}