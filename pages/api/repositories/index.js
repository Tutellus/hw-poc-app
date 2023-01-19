import { promises as fs, existsSync} from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DB_PATH = path.join(__dirname, '/db.json');

const DIDS = 'dids';
const USERS = 'users';

function objToArray(obj) {
  return Object.keys(obj).map(key => ({
    id: key,
    ...obj[key]
  }));
};

async function update ({
  repository,
  id = uuidv4(),
  fields
}) {
  const exists = existsSync(DB_PATH);
  if (!exists) {
    await fs.writeFile(DB_PATH, JSON.stringify({
      [USERS]: {},
      [DIDS]: {}
    }));
  }
  const file = await fs.readFile(DB_PATH);
  const data = JSON.parse(file);
  if (!data[repository]) {
    data[repository] = {};
  }
  if (!data[repository][id]) {
    data[repository][id] = {
      id,
      status: 'PENDING'
    };
  }
  data[repository][id] = {
    ...data[repository][id],
    ...fields
  };
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  return data[repository][id];
};

async function get({
  repository
}) {
  const exists = existsSync(DB_PATH);
  if (!exists) {
    await fs.writeFile(DB_PATH, JSON.stringify({
      [USERS]: {},
      [DIDS]: {}
    }));
  }
  const file = await fs.readFile(DB_PATH);
  const data = JSON.parse(file);
  if (!data[repository]) {
    return null;
  }
  return objToArray(data[repository]);
}

async function updateDID ({
  id,
  fields
}) {
  return update({
    repository: DIDS,
    id,
    fields
  });
}

async function updateUser ({
  id,
  fields
}) {
  return update({
    repository: USERS,
    id,
    fields
  });
}

async function getDIDs() {
  return get({
    repository: DIDS
  });
}

async function getUsers() {
  return get({
    repository: USERS
  });
}

export {
  getDIDs,
  getUsers,
  updateDID,
  updateUser,
};