import { get } from '../../repositories/users';

export default async function handler(req, res) {
  const users = await get();
  res.status(200).json({ users });
}