import { updateOne, search, getOne as sharedGetOne } from './shared';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'proxies';

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

async function get(pipeline) {
  return search(COLLECTION, pipeline);
}

async function getOne(filter) {
  return sharedGetOne(COLLECTION, filter);
};

async function markAsAssigning (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'ASSIGNING',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

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
  markAsAssigning,
  markAsAssigned,
};