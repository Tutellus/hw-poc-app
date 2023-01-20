import { utils } from 'ethers'
import { abi as DIDMockABI } from '../abi/DIDMock.json'

function wrapOwner ({
  destination,
  data,
  value,
  gas
}) {
  const didInterface = new utils.Interface(DIDMockABI)
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