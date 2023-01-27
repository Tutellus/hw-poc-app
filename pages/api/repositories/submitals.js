import { updateOne, search, getOne as sharedGetOne } from './shared';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'submitals';

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

async function get(pipeline = []) {
  return search(COLLECTION, pipeline);
}

async function getOne(filter) {
  return sharedGetOne(COLLECTION, filter);
};

async function markAsProcessing (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'PROCESSING',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

async function markAsProcessed (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'PROCESSED',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

export {
  update,
  get,
  getOne,
  markAsProcessing,
  markAsProcessed,
};