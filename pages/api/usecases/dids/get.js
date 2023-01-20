import { get } from '../../repositories/dids';

export default async function handler(req, res) {
  const dids = await get();
  res.status(200).json({ dids });
}