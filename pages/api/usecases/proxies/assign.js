import { markAsAssigned, update as updateProxy, get as getProxies } from '../../repositories/proxies'
import { execute as createProxy } from './create';

export async function execute({
  userId,
  chainId,
  projectId,
}) {
  try {
    const pipeline = [
      {
        $match: {
          status: 'PENDING',
          chainId: parseInt(chainId, 10),
          projectId,
        },
      },
    ];
    const proxies = await getProxies(pipeline);
    let proxy = proxies[0];

    if (!proxy) {
      proxy = await createProxy({ chainId, projectId });
    }

    await updateProxy({
      id: proxy._id,
      fields: {
        userId,
      },
    });

    proxy = await markAsAssigned(proxy._id);
    
    // creates a new proxy
    createProxy({ chainId, projectId });
    return proxy;
  } catch (error) {
    console.error(error);
    throw error;
  }
}