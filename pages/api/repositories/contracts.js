const { updateOne, search, getOne: sharedGetOne } = require('./shared');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'contracts';

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
      status: 'UNLOCKED',
    },
  };
  return updateOne(COLLECTION, filter, data)
};

async function get() {
  return search(COLLECTION);
};

async function getOne(filter) {
  return sharedGetOne(COLLECTION, filter);
};

async function markAsLocked (id) {
  const filter = { _id: id };
  const data = {
    $set: {
      status: 'LOCKED',
    },
  };
  return updateOne(COLLECTION, filter, data)
};

module.exports = {
  update,
  get,
  getOne,
  markAsLocked,
};