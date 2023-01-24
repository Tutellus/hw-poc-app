import { config } from '../../config.js'
import { ethers, utils } from 'ethers'
import { update as updateDID } from '../../repositories/dids'
import DIDFactory from '../../abi/DIDFactoryMock.json'
import GnosisSafe from '../../abi/GnosisSafe.json'
import GnosisProxyFactory from '../../abi/GnosisSafeProxyFactory.json'

function keysToAddresses (keys) {
  return keys.map(ethers.utils.computeAddress)
}

function findLogs (receipt, contract, eventName) {
  const contractLogs = receipt.logs.filter(x => x.address.toLowerCase() === contract.address.toLowerCase())
  const parsedLogs = contractLogs.map(x => contract.interface.parseLog(x))
  const eventLogs = parsedLogs.filter(x => x.name === eventName)
  return eventLogs
}

export async function execute() {
  const { chainId, rpcUrl, serverKey, ownerKeys, masterKeys, didFactory, gnosisFallbackHandler, gnosisProxyFactory, gnosisSingleton } = config
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)
  const serverWallet = new ethers.Wallet(serverKey, provider)
  const didFactoryContract = new ethers.Contract(didFactory, DIDFactory.abi, serverWallet)
  const gnosisProxyFactoryContract = new ethers.Contract(gnosisProxyFactory, GnosisProxyFactory.abi, serverWallet)
  const nonce = new Date().getTime()
  const ownerAddresses = keysToAddresses(ownerKeys)
  const masterAddresses = keysToAddresses(masterKeys)
  const tx = await didFactoryContract.createDID(
    ownerAddresses,
    masterAddresses,
    gnosisProxyFactory,
    gnosisSingleton,
    gnosisFallbackHandler,
    nonce,
  );
  const receipt = await tx.wait()
  const gnosisProxyCreationLogs = findLogs(receipt, gnosisProxyFactoryContract, 'ProxyCreation')
  const didCreationLog = findLogs(receipt, didFactoryContract, 'NewDID')[0]

  const [ownersOfFirst, ownersOfSecond] = await Promise.all([
    new ethers.Contract(gnosisProxyCreationLogs[0].args.proxy, GnosisSafe.abi, serverWallet).getOwners(),
    new ethers.Contract(gnosisProxyCreationLogs[1].args.proxy, GnosisSafe.abi, serverWallet).getOwners(),
  ]);

  const ownerMS = ownersOfFirst.every(address => ownerAddresses.includes(utils.getAddress(address)))
    ? gnosisProxyCreationLogs[0].args.proxy
    : gnosisProxyCreationLogs[1].args.proxy
  const masterMS = ownersOfSecond.every(address => masterAddresses.includes(utils.getAddress(address)))
    ? gnosisProxyCreationLogs[1].args.proxy
    : gnosisProxyCreationLogs[0].args.proxy

  const did = await updateDID({
    fields: {
      ownerMS,
      masterMS,
      address: didCreationLog.args.did,
      nonce,
      creationTx: tx.hash,
    },
  });
  return did;
}