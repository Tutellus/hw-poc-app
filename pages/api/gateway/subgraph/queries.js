const gql = require('graphql-tag');

const humanFields = `
  id
  nonce
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

const executionFields = `
  id
  nonce
  hash
  logIndex
  operationType
  selector
  target
  timestamp
  value
  human {
    ${humanFields}
  }
`;

const userOperationRevertedFields = `
  id
  nonce
  hash
  timestamp
  revertReason
  human {
    ${humanFields}
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

exports.GET_EXECUTIONS = gql`
  query GetExecutions(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $where: Execution_filter
  ) {
    executions(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      ${executionFields}
    }
  }
`;

exports.GET_USER_OPERATION_REVERTEDS = gql`
  query GetUserOperationReverteds(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $where: UserOperationReverted_filter
  ) {
    userOperationReverteds(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      ${userOperationRevertedFields}
    }
  }
`;