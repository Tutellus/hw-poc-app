import { updateOne, search, getOne as sharedGetOne } from './shared';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'projects';

async function update ({
  id = uuidv4(),
  fields
}) {
  const filter = { _id: id };
  const data = {
    $set: {
      ...fields,
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

export {
  update,
  get,
  getOne,
};