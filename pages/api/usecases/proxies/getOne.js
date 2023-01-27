import { getOne as getOneProxy } from '../../repositories/proxies';

export default async function handler(req, res) {
  try {
    const { filter } = req.body;
    const proxy = await getOneProxy(filter);
    res.status(200).json({ proxy });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}