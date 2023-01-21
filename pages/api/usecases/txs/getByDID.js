import { get } from '../../repositories/txs';

export default async function handler(req, res) {
  const { didId } = req.body;

  const pipeline = [
    {
      $match: {
        did: didId,
      },
    },
  ];

  const txs = await get(pipeline);
  res.status(200).json({ txs });
}