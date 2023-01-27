import { get } from '../../repositories/submitals';

export default async function handler(req, res) {
  const txs = await get();
  res.status(200).json({ txs });
}