import { getUsers, updateUser } from './repositories'

export default async function handler(req, res) {
  const { email } = req.body;
  const users = await getUsers();
  let user = users?.find(user => user.email === email);
  if (!user) {
    user = await createUser(email);
  }
  res.status(200).json({ user })
}

async function createUser(email) {
  const code = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const user = await updateUser({
    fields: {
      verifyCode: code,
      email,
    },
  });
  return user;
}


