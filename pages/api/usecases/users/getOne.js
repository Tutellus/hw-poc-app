import { getOne } from '../../repositories/users';

export default async function handler(req, res) {
  const user = await getOne({ email: req.body.email });
  res.status(200).json({ user });
}