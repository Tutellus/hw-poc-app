import { utils } from 'ethers'
import DIDMock from '../abi/DIDMock.json'

function wrapOwner ({
  destination,
  data,
  value,
  gas
}) {
  const didInterface = new utils.Interface(DIDMock.abi)
  const calldata = didInterface.encodeFunctionData('forwardOwner', [
    destination,
    data,
    value,
    gas
  ])
  return calldata
}

export {
  wrapOwner
}