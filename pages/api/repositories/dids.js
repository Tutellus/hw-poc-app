import { updateOne, search, getOne as sharedGetOne } from './shared';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'dids';

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
  return search(COLLECTION);
}

async function getOne(filter) {
  return sharedGetOne(COLLECTION, filter);
};

async function markAsAssigned (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'ASSIGNED',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

export {
  update,
  get,
  getOne,
  markAsAssigned,
};