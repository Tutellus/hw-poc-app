import { getOne as getUser, update as updateUser } from '../../repositories/users'

export default async function handler(req, res) {
  const { email } = req.body;
  const user = await execute({ email });
  res.status(200).json({ user })
}

export async function execute({ email }) {
  const user = await getUser({ email });
  if (!user) {
    const verifyCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const fields = { email, verifyCode };
    return updateUser({ fields });
  }
  return user;
}


