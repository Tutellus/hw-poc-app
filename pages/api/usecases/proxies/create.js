import { config } from '../../config.js'
import { ethers, utils } from 'ethers'
import { update as updateProxy } from '../../repositories/proxies'
import { getOne as getProject } from '../../repositories/projects'

import Proxy from '../../abi/ProxyMock.json'
import ProxyFactory from '../../abi/ProxyFactoryMock.json'
import Safe from '../../abi/Safe.json'
import SafeProxyFactory from '../../abi/SafeProxyFactory.json'
import { execute as executeTx } from '../../infrastructure/executor'

function keysToAddresses (keys) {
  return keys.map(ethers.utils.computeAddress)
}

function findLogs (receipt, contract, eventName) {
  const contractLogs = receipt.logs.filter(x => x.address.toLowerCase() === contract.address.toLowerCase())
  const parsedLogs = contractLogs.map(x => contract.interface.parseLog(x))
  const eventLogs = parsedLogs.filter(x => x.name === eventName)
  return eventLogs
}

async function configSafes ({
  proxy,
  receipt,
  ownerAddresses,
  masterAddresses,
}) {

  // Wait for 6 seconds to make sure the proxy is deployed
  await new Promise(resolve => setTimeout(resolve, 6000))

  const { chainId } = proxy
  const { rpc, safeProxyFactory } = config[chainId]
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  
  const safeProxyFactoryContract = new ethers.Contract(safeProxyFactory, SafeProxyFactory.abi, provider)
  const safeProxyCreationLogs = findLogs(receipt, safeProxyFactoryContract, 'ProxyCreation')

  const safe1 = new ethers.Contract(safeProxyCreationLogs[0].args.proxy, Safe.abi, provider)
  const safe2 = new ethers.Contract(safeProxyCreationLogs[1].args.proxy, Safe.abi, provider)

  const [ownersOfFirst, ownersOfSecond] = await Promise.all([
    safe1.getOwners(),
    safe2.getOwners(),
  ]);

  const ownerSafe = ownersOfFirst.every(address => ownerAddresses.includes(utils.getAddress(address)))
    ? safeProxyCreationLogs[0].args.proxy
    : safeProxyCreationLogs[1].args.proxy
  const masterSafe = ownersOfSecond.every(address => masterAddresses.includes(utils.getAddress(address)))
    ? safeProxyCreationLogs[1].args.proxy
    : safeProxyCreationLogs[0].args.proxy

  await updateProxy({
    id: proxy._id,
    fields: {
      ownerSafe,
      masterSafe,
    },
  });
}

export async function execute({ chainId, projectId }) {
  try {

    const project = await getProject({ _id: projectId })

    if (!project) {
      throw new Error('Project not found')
    }
    
    const { executorKey, ownerKeys, masterKeys } = project

    const { rpc, proxyFactory, forwardPolicies, safeFallbackHandler, safeProxyFactory, safeSingleton } = config[chainId]
    const provider = new ethers.providers.JsonRpcProvider(rpc)
  
    const executorWallet = new ethers.Wallet(executorKey, provider)
    const proxyInterface = new ethers.utils.Interface(Proxy.abi)
    const proxyFactoryContract = new ethers.Contract(proxyFactory, ProxyFactory.abi, executorWallet)
    const saltNonce = new Date().getTime()
    const ownerAddresses = keysToAddresses(ownerKeys)
    const masterAddresses = keysToAddresses(masterKeys)

    const initializeCalldata = proxyInterface
      .encodeFunctionData(
        'initialize',
        [
          forwardPolicies,
          safeProxyFactory,
          safeSingleton,
          safeFallbackHandler,
          saltNonce,
          ownerAddresses,
          masterAddresses,
        ]
      );
      
    const receipt = await executeTx({
      to: proxyFactory,
      data: proxyFactoryContract.interface.encodeFunctionData('createProxy', [initializeCalldata]),
      signer: executorWallet,
    });

    const proxyCreationLog = findLogs(receipt, proxyFactoryContract, 'NewProxy')[0]
  
    let proxy = await updateProxy({
      fields: {
        projectId,
        chainId,
        address: proxyCreationLog.args.proxy,
        saltNonce,
        receipt,
      },
    });

    configSafes({
      proxy,
      receipt,
      ownerAddresses,
      masterAddresses,
    })

    return proxy;
  } catch (error) {
    console.error(error)
    throw error
  }
}