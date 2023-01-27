import { get as getTxs } from '../../repositories/submitals';
import { getOne as getProxy } from '../../repositories/proxies';

export default async function handler(req, res) {
  const { user } = req.body;
  const txs = await execute({ user });
  res.status(200).json({ txs });
}

export async function execute({ user }) {
  const proxy = await getProxy({ userId: user._id });
  if (!proxy) {
    return [];
  }
  const pipeline = [
    {
      $match: {
        proxy: proxy._id,
      },
    },
  ];
  const txs = await getTxs(pipeline);
  return txs;
}