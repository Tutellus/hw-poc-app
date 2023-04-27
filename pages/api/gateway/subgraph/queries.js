const gql = require('graphql-tag');

const humanFields = `
  id
  address
  owner
  salt
  master
  lastExecutionTime
  inactivityTime
  guardian {
    address
    delay
    executors
    id
    proposers
    safe {
      address
      id
      salt
      owners
      threshold
    }
  }
`;

exports.GET_HUMANS = gql`
  query GetHumans(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $where: Human_filter
  ) {
    humans(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      ${humanFields}
    }
  }
`;
