import { get } from '../../repositories/proposals';

export default async function handler(req, res) {
  const { safe } = req.body;
  const proposals = await execute({ safe });
  res.status(200).json({ proposals });
};

async function execute({ safe }) {
  try {
    const pipeline = [
      {
        $match: {
          safe,
        },
      },
    ];
    const proposals = await get(pipeline);
    return proposals;
  } catch (error) {
    console.error(error);
    return [];
  }
}