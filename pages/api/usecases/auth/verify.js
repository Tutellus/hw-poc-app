import { markAsAssigning } from '../../repositories/users'
import { execute as assign } from '../proxies/assign';

export default async function handler(req, res) {
  const { user, code } = req.body;
  const response = await execute({ user, code });
  res.status(200).json({ user: response });
}

export async function execute ({
  user,
  code,
}) {
  try {
    if (!user || user.status === 'VERIFIED') {
      throw new Error('User not found or already verified');
    }
    if (user.verifyCode !== code) {
      return new Error('Invalid verification code')
    }

    // mark user as assigning
    await markAsAssigning(user._id);

    // assign a Proxy to the user
    await assign({ user })

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}