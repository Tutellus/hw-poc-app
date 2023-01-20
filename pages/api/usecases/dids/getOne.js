import { getOne } from '../../repositories/dids';

export default async function handler(req, res) {
  const filter = req.body.filter;
  const did = await getOne(filter);
  res.status(200).json({ did });
}