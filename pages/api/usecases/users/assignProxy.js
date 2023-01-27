import { config } from '../../config';
import { execute as assign } from '../proxies/assign';
import { getOne as getOneProject } from '../../repositories/projects';
import { getOne as getOneProxy } from '../../repositories/proxies';
import { getOne as getOneUser } from '../../repositories/users';

export default async function handler(req, res) {
  try {
    const { userId, chainId, projectId } = req.body;
    const response = await execute({ userId, chainId, projectId });
    res.status(200).json({ proxy: response });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute ({
  userId,
  projectId,
  chainId,
}) {
  try {

    const user = await getOneUser({ _id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    const configChain = config[chainId];

    if (!configChain) {
      throw new Error('Unsupported chain');
    }

    const project = await getOneProject({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }

    let proxy = await getOneProxy({ userId, chainId, projectId });

    if (proxy) {
      return proxy;
    }

    // assign a Proxy to the user if not exists
    proxy = await assign({ userId, chainId, projectId })

    return proxy;
  } catch (error) {
    console.error(error);
    throw error;
  }
}