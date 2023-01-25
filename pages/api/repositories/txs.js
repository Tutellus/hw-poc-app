import { updateOne, search, getOne as sharedGetOne } from './shared';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'txs';

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
      status: 'CREATING',
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

async function markAsExecuting (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'EXECUTING',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

async function markAsExecuted (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'EXECUTED',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

async function markAsCreated (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'CREATED',
    },
  };
  return updateOne(COLLECTION, filter, data)
}

export {
  update,
  get,
  getOne,
  markAsExecuting,
  markAsExecuted,
  markAsCreated,
};