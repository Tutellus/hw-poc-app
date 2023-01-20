import { config } from './config'
import { abi as DIDFactoryABI } from './abi/DIDFactoryMock.json'
import { abi as GnosisSafeABI } from './abi/GnosisSafe.json'
import { abi as GnosisProxyFactoryABI } from './abi/GnosisSafeProxyFactory.json'
import { Contract, ethers, utils } from 'ethers'
import { get as getDIDs, markAsAssigned, update as updateDID } from './repositories/dids'
import { get as getUsers, markAsVerified } from './repositories/users'

export default async function handler(req, res) {
  const { email, verifyCode } = req.body;
  const users = await getUsers();
  const user = users.find(user => user.email === email);
  if (!user) {
    res.status(400).json({ error: 'User not found' })
    return;
  }
  if (user.verifyCode !== verifyCode) {
    res.status(400).json({ error: 'Invalid verify code' })
    return;
  }
  const dids = await getDIDs();
  let did = dids.find(did => did.userId === user._id);
  if (!did) {
    did = await assignDID(email);
    await markAsVerified(user._id);
  }

  res.status(200).json({ did })
}

function keysToAddresses (keys) {
  return keys.map(ethers.utils.computeAddress)
}

async function assignDID(email) {
  const users = await getUsers();
  const user = users.find(user => user.email === email);
  if (!user) {
    return null;
  }
  const dids = await getDIDs();
  let pendingDID = dids.find(did => !did.userId && did.status === 'PENDING');
  if (!pendingDID) {
    pendingDID = await createDID();
  }
  createDID();
  await updateDID({
    id: pendingDID._id,
    fields: {
      userId: user._id,
    },
  });
  await markAsAssigned(pendingDID._id);
}


function findLogs (receipt, contract, eventName) {
  const contractLogs = receipt.logs.filter(x => x.address.toLowerCase() === contract.address.toLowerCase())
  const parsedLogs = contractLogs.map(x => contract.interface.parseLog(x))
  const eventLogs = parsedLogs.filter(x => x.name === eventName)
  return eventLogs
}

async function createDID() {
  const { chainId, rpcUrl, serverKey, ownerKeys, masterKeys, didFactory, gnosisFallbackHandler, gnosisProxyFactory, gnosisSingleton } = config

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)
  const serverWallet = new ethers.Wallet(serverKey, provider)

  const didFactoryContract = new ethers.Contract(didFactory, DIDFactoryABI, serverWallet)
  const gnosisProxyFactoryContract = new ethers.Contract(gnosisProxyFactory, GnosisProxyFactoryABI, serverWallet)

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
  )

  const receipt = await tx.wait()

  const gnosisProxyCreationLogs = findLogs(receipt, gnosisProxyFactoryContract, 'ProxyCreation', )
  const didCreationLog = findLogs(receipt, didFactoryContract, 'NewDID')[0]

  const [ownersOfFirst, ownersOfSecond] = await Promise.all([
    new Contract(gnosisProxyCreationLogs[0].args.proxy, GnosisSafeABI, serverWallet).getOwners(),
    new Contract(gnosisProxyCreationLogs[1].args.proxy, GnosisSafeABI, serverWallet).getOwners(),
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