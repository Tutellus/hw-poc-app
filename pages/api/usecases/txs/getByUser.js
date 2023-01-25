import { get as getTxs } from '../../repositories/txs';
import { getOne as getDID } from '../../repositories/dids';

export default async function handler(req, res) {
  const { user } = req.body;
  const txs = await execute({ user });
  res.status(200).json({ txs });
}

export async function execute({ user }) {
  const did = await getDID({ userId: user._id });
  if (!did) {
    return [];
  }
  const pipeline = [
    {
      $match: {
        did: did._id,
      },
    },
  ];
  const txs = await getTxs(pipeline);
  return txs;
}