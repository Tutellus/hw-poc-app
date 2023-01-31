import { getOne as getUser } from '../../repositories/users';

export default async function handler(req, res) {
  const user = await getUser({ email: req.body.email });
  res.status(200).json({ user });
}