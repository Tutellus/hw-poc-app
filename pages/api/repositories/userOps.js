const { updateOne, search, getOne: sharedGetOne } = require('./shared');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'userOps';

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

async function markAsExecuted ({
  id,
  receipt,
}) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'EXECUTED',
      receipt,
    },
  };
  return updateOne(COLLECTION, filter, data)
};

export {
  update,
  get,
  getOne,
  markAsExecuted
};