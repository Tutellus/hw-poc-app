import { update as updateTx } from '../../repositories/submitals';
import { getOne as getOneProxy } from '../../repositories/proxies';
import { execute as safeCreateOwnerTransaction } from '../../usecases/safe/createOwnerTransaction';

export default async function handler(req, res) {
  const { user, destination, data, value, gas } = req.body;
  const response = await execute({ user, destination, data, value, gas });
  res.status(200).json(response)
}

export async function execute({
  user,
  destination,
  data,
  value,
  gas,
}) {
  try {
    const proxy = await getOneProxy({ userId: user._id })

    if (!proxy) {
      res.status(404).json({ error: 'Proxy not found' });
      return;
    }
    
    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const tx = await updateTx({ fields: {
      proxy: proxy._id,
      originalData: data,
      code2fa,
    } })
    
    await safeCreateOwnerTransaction({
      tx,
      destination,
      data,
      value,
      gas,
    })

    return true;
  } catch (error) {
    console.error(error)
    return error;
  }
}