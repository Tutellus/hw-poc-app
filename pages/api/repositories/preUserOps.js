const { updateOne, search, getOne: sharedGetOne } = require('./shared');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'preUserOps';

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

async function getWithParams({
  first = 10,
  skip = 0,
  where = {},
  orderBy = 'createdAt',
  orderDir = 'desc',
}) {
  const pipeline = [
    {
      $match: where,
    },
    {
      $sort: {
        [orderBy]: orderDir === 'desc' ? -1 : 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: first,
    },
  ];
  return search(COLLECTION, pipeline);
}

async function get(pipeline = []) {
  return search(COLLECTION, pipeline);
}

async function getOne(filter) {
  return sharedGetOne(COLLECTION, filter);
};

async function markAsProcessed (preUserOpId) {
  const filter = { _id: preUserOpId };
  const data = {
    $set: {
      status: 'PROCESSED',
    },
  };
  return updateOne(COLLECTION, filter, data)
};

async function markAsSignable(preUserOpId) {
  const filter = { _id: preUserOpId };
  const data = {
    $set: {
      status: 'SIGNABLE',
    },
  };
  return updateOne(COLLECTION, filter, data)
};

export {
  update,
  getWithParams,
  get,
  getOne,
  markAsProcessed,
  markAsSignable,
};