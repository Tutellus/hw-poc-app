import { get } from '../../repositories/proxies';

export default async function handler(req, res) {
  const proxies = await get();
  res.status(200).json({ proxies });
}