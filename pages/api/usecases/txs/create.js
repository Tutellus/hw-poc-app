import { update as updateTx } from '../../repositories/txs';
import { getOne as getOneDID } from '../../repositories/dids';
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
    const did = await getOneDID({ userId: user._id })

    if (!did) {
      res.status(404).json({ error: 'DID not found' });
      return;
    }
    
    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const tx = await updateTx({ fields: {
      did: did._id,
      originalData: data,
      code2fa,
    } })
    
    safeCreateOwnerTransaction({
      txId: tx._id,
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