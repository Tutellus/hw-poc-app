import { markAsVerified } from '../../repositories/users'

export default async function handler(req, res) {
  const { user, code } = req.body;
  const response = await execute({ user, code });
  res.status(200).json({ user: response });
}

export async function execute ({
  user,
  code,
}) {
  if (!user || user.status === 'VERIFIED') {
    return false;
  }
  if (user.verifyCode !== code) {
    return false;
  }

  user = await markAsVerified(user._id);
  return user;
}


