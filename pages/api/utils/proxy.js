import { utils } from 'ethers'
import Proxy from '../abi/ProxyMock.json'

function wrapOwner ({
  to,
  data,
  value,
  gas
}) {
  return new utils.Interface(Proxy.abi)
  .encodeFunctionData(
    'forwardOwner',
    [
      to,
      data,
      value,
      gas
    ]
  )
}

function wrapMaster ({
  to,
  data,
  value,
  gas
}) {
  return new utils.Interface(Proxy.abi)
  .encodeFunctionData(
    'forwardMaster',
    [
      to,
      data,
      value,
      gas
    ]
  )
}

export {
  wrapOwner,
  wrapMaster,
}