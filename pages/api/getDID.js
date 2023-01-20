import { get as getDIDs } from './repositories/dids'
import { get as getUsers } from './repositories/users'

export default async function handler(req, res) {
  const { email } = req.body;
  const users = await getUsers();
  const user = users.find(user => user.email === email);
  if (!user) {
    res.status(400).json({ error: 'User not found' })
    return;
  }
  const dids = await getDIDs();
  let did = dids.find(did => did.userId === user._id);
  res.status(200).json({ did })
}