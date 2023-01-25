import mongoDB from '../infrastructure/mongo';

const mongoUri = process.env.MONGODB_URI;

const composePaginationPipeline = ({
  offset = 0,
  limit = 10,
  orderBy = 'createdAt',
  orderDirection = 'ASC',
}) => {

  const totalCreated = '$total.createdAt';

  const pipeline = [
    {
      $sort: {
        [orderBy]: orderDirection === 'ASC' ? 1 : -1,
      },
    },
    {
      $facet: {
        total: [{
          $count: 'createdAt',
        }],
        items: [{
          $addFields: {
            _id: '$_id',
          },
        }],
      },
    },
    {
      $unwind: '$total',
    },
    {
      $project: {
        items: {
          $slice: ['$items', offset, {
            $ifNull: [limit, totalCreated],
          }],
        },
        metadata: {
          limit: {
            $literal: limit,
          },
          offset: {
            $literal: offset,
          },
          orderBy: {
            $ifNull: [{ $literal: orderBy }, ''],
          },
          orderDirection: {
            $ifNull: [{ $literal: orderDirection }, ''],
          },
          numElements: totalCreated,
          page: {
            $literal: ((offset / limit) + 1),
          },
          pages: {
            $ceil: {
              $divide: [totalCreated, limit],
            },
          },
        },
      },
    },
  ];

  return pipeline;
};

const emptyPaginatedValues = ({
  offset = 0,
  limit = 10,
  orderBy = 'createdAt',
  orderDirection = 'ASC',
}) => ({
  items: [],
  metadata: {
    numElements: 0,
    offset,
    limit,
    orderBy,
    orderDirection,
    total: 0,
    page: 0,
    pages: 0,
  },
});

// ///////////////////////////////////////////////////////////////
// PUBLIC METHODS
// ///////////////////////////////////////////////////////////////

async function searchFirst(collection, pipeline) {

  const innerResult = await mongoDB({
    mongoUri,
  }).aggregate(collection, pipeline);

  const result = innerResult[0];

  return result;
}

async function searchPaginated({ collection, pipeline = [], pagination = {} }) {

  const paginationPipeline = composePaginationPipeline(pagination);
  const searchPipeline = [
    ...pipeline,
    ...paginationPipeline,
  ];

  const innerResult = await searchFirst(collection, searchPipeline);


  const result = innerResult || emptyPaginatedValues(pagination);
  return result;
}

async function search(collection, pipeline) {
  try {
    const result = await mongoDB({
      mongoUri,
    }).aggregate(collection, pipeline);
  
    return result;
  } catch (error) {
    return [];
  }

}

async function updateOne(collection, filter, data) {
  try {
    const result = await mongoDB({
      mongoUri,
    }).updateOne(collection, filter, data);
  
    return result;
  } catch (error) {
    return null;
  }

}

async function getOne(collection, filter) {
  try {
    const pipeline = [
      { $match: filter },
    ];
  
    const result = await searchFirst(collection, pipeline);
  
    return result;
  } catch (error) {
    return null;
  }

}

async function deleteOne(collection, filter) {
  try {

    const result = await mongoDB({
      mongoUri,
    }).deleteOne(collection, filter);

    return result;
  } catch (error) {
    if (error.message === constants.INNER_ERROR_NOT_DELETED) {
      return false;
    }
    throw error;
  }
}

async function createIndex(collection, fields, options = {}) {

  await mongoDB({
    mongoUri,
  }).createIndex(collection, fields, options);

  const result = true;
  return result;
}

const composeBasicOrMatch = ({ fields, search }) => { // eslint-disable-line no-shadow
  const composeFilter = Array.isArray(fields) && fields.length > 0 && !!search;

  if (!composeFilter) return [];

  const or = fields.map((field) => ({
    [field]: { $regex: search, $options: 'i' },
  }));

  return [
    {
      $match: { $or: or },
    },
  ];
};

export {
  search,
  searchFirst,
  searchPaginated,
  updateOne,
  getOne,
  deleteOne,
  createIndex,
  composeBasicOrMatch,
};
