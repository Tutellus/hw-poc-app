import { get as getTxs } from '../repositories/txs';

export default async function handler(req, res) {
  const txs = await getTxs();
  res.status(200).json({ txs });
}