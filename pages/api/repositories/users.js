import { updateOne, search } from './shared';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'users';

async function update ({
  id = uuidv4(),
  fields
}) {
  const filter = { _id: id };
  const data = {
    $set: {
      ...fields,
    },
    $setOnInsert: {
      status: 'PENDING',
    },
  };
  return updateOne(COLLECTION, filter, data)
};

async function get() {
  return search(COLLECTION, []);
}

async function markAsVerified (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'VERIFIED',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

export {
  update,
  get,
  markAsVerified,
};