import { config } from './config'
import { abi as DIDFactoryABI } from './abi/DIDFactoryMock.json'
import { abi as GnosisProxyFactoryABI } from './abi/GnosisSafeProxyFactory.json'
import { ethers } from 'ethers'
import { getDIDs, getUsers, updateDID, updateUser } from './repositories'

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
  let did = dids.find(did => did.userId === user.id);
  if (!did) {
    did = await assignDID(email);
    await updateUser({
      id: user.id,
      fields: {
        status: 'VERIFIED',
      },
    })
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
  console.log('pendingDID', pendingDID)
  if (!pendingDID) {
    pendingDID = await createDID();
  }
  console.log('pendingDID', pendingDID)
  createDID();
  return await updateDID({
    id: pendingDID.id,
    fields: {
      status: 'ASSIGNED',
      userId: user.id,
    },
  });
}

async function createDID() {
  const { chainId, rpcUrl, serverKey, ownerKeys, masterKeys, didFactory, gnosisFallbackHandler, gnosisProxyFactory, gnosisSingleton } = config

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)
  const serverWallet = new ethers.Wallet(serverKey, provider)

  const didFactoryContract = new ethers.Contract(didFactory, DIDFactoryABI, serverWallet)
  const gnosisProxyFactoryContract = new ethers.Contract(gnosisProxyFactory, GnosisProxyFactoryABI, serverWallet)

  const nonce = new Date().getTime()

  const tx = await didFactoryContract.createDID(
    keysToAddresses(ownerKeys),
    keysToAddresses(masterKeys),
    gnosisProxyFactory,
    gnosisSingleton,
    gnosisFallbackHandler,
    nonce,
  )

  const receipt = await tx.wait()

  const logsProxyFactory = receipt.logs.filter(x => x.address.toLowerCase() === gnosisProxyFactory.toLowerCase())
  const parsedLogs = logsProxyFactory.map(x => gnosisProxyFactoryContract.interface.parseLog(x))
  const proxyAddress = parsedLogs.find(x => x.name === 'ProxyCreation').args.proxy

  const did = await updateDID({
    fields: {
      proxyAddress,
      nonce,
    },
  });
  return did;
}