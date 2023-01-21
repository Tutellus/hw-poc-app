import { get } from '../../repositories/txs';

export default async function handler(req, res) {
  const { pipeline } = req.body;
  const txs = await get(pipeline);
  res.status(200).json({ txs });
}