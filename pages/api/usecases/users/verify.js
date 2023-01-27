import { markAsVerified } from '../../repositories/users'

export default async function handler(req, res) {
  try {
    const { user, code, chainId, projectId } = req.body;
    const response = await execute({ user, code, chainId, projectId });
    res.status(200).json({ user: response });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute ({
  user,
  code,
}) {
  try {
    if (!user || user.status === 'VERIFIED') {
      throw new Error('User not found');
    }
    if (user.verifyCode !== code) {
      return new Error('Invalid verification code')
    }
    user = await markAsVerified(user._id);
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}