import assert from 'assert';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

module.exports = ({ mongoUri, options = {}, mongodbLib = require('mongodb') }) => { // eslint-disable-line global-require
  const { MongoClient, ObjectID } = mongodbLib;
  const { uuid = false, ...libOptions } = options;
  let connection;

  const getConnection = async (uri, options) => {
    connection = await MongoClient.connect(uri, options);
    return connection.db();
  };

  const defaultOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const mongoOptions = { ...defaultOptions, ...libOptions };

  const dbPromise = getConnection(mongoUri, mongoOptions);

  const defaultValues = ({ createdAt = false, modifiedAt = false, _id = false }) => {
    const now = new Date();
    // mongodb is very delicate and does not like undefined or empty objects
    const onInsert = {};
    if (createdAt) {
      onInsert.createdAt = now;
    }
    if (_id && uuid) {
      onInsert._id = uuidv4(); // eslint-disable-line no-underscore-dangle
    }
    const onUpdate = {};
    if (modifiedAt) {
      onUpdate.modifiedAt = now;
    }
    // compose result with non empty objects
    const result = {};
    if (!_.isEmpty(onInsert)) {
      result.$setOnInsert = onInsert;
    }
    if (!_.isEmpty(onUpdate)) {
      result.$set = onUpdate;
    }
    return result;
  };

  const completeUpdate = (entity) => {
    const updateOptions = ['$set', '$setOnInsert', '$unset'];
    const entityFileds = [
      ...Object.keys(entity),
      ...updateOptions.reduce((acu, option) => {
        if (entity[option]) {
          return [
            ...acu,
            ...Object.keys(entity[option]),
          ];
        }
        return acu;
      }, []),
    ];

    return _.merge(entity, defaultValues({
      createdAt: !entityFileds.includes('createdAt'),
      modifiedAt: !entityFileds.includes('modifiedAt'),
      _id: !entityFileds.includes('_id'),
    }));
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#createIndex
  const createIndex = async (collection, fields, options = {}) => {
    const db = await dbPromise;
    return db.collection(collection).createIndex(fields, { ...options, background: true });
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#aggregate
  const aggregate = async (collection, pipeline, options = {}) => {
    const db = await dbPromise;
    return db.collection(collection).aggregate(pipeline, options).toArray();
  };

  const aggregateCursor = async (collection, pipeline, options = {}) => {
    const db = await dbPromise;
    return db.collection(collection).aggregate(pipeline, options);
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#find
  const find = async (collection, filter, options = {}) => {
    const db = await dbPromise;
    return db.collection(collection).find(filter, options).toArray();
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOne
  const findOne = async (collection, filter, options = {}) => {
    const db = await dbPromise;
    return db.collection(collection).findOne(filter, options);
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#updateMany
  const update = async (collection, filter, data, options = {
    upsert: true,
  }) => {
    const db = await dbPromise;

    const completedUpdate = completeUpdate(data);

    const {
      result: {
        ok,
        nModified,
      },
    } = await db.collection(collection).updateMany(filter, completedUpdate, options);
    assert.strictEqual(ok, 1, 'NOT - Updated');
    return nModified;
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOneAndUpdate
  const updateOne = async (collection, filter, data, options = {
    upsert: true,
    returnDocument: 'after',
  }) => {
    const db = await dbPromise;

    const completedUpdate = completeUpdate(data);

    const {
      ok,
      value,
    } = await db.collection(collection).findOneAndUpdate(filter, completedUpdate, options);
    assert.strictEqual(ok, 1, 'NOT - Updated One');
    return value;
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOneAndDelete
  const deleteOne = async (collection, filter, options = {}) => {
    const db = await dbPromise;

    const {
      lastErrorObject: { n },
    } = await db.collection(collection).findOneAndDelete(filter, options);
    assert.strictEqual(n, 1, 'NOT - Deleted One');
    return true;
  };

  // https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#deleteMany
  const deleteFn = async (collection, filter, options = {}) => {
    const db = await dbPromise;

    const {
      deletedCount,
    } = await db.collection(collection).deleteMany(filter, options);

    assert.ok(deletedCount > 0, 'NOT - Deleted');
    return deletedCount;
  };

  const close = async () => {
    const db = await dbPromise;
    await db.close();
    await connection.close();
  };

  return {
    ObjectID,
    createIndex,
    aggregate,
    aggregateCursor,
    find,
    findOne,
    update,
    updateOne,
    deleteOne,
    delete: deleteFn,
    close,
  };
};
