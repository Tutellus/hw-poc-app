import { getOne as getDID } from '../../repositories/dids';

export default async function handler(req, res) {
  const { user } = req.body;
  const did = await execute({ user });
  res.status(200).json({ did });
}

export async function execute({ user }) {
  const did = await getDID({ userId: user._id });
  return did;
}