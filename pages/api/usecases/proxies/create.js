import { config } from '../../config.js'
import { ethers, utils } from 'ethers'
import { update as updateProxy } from '../../repositories/proxies'
import { getOne as getOneProject } from '../../repositories/projects'

import Proxy from '../../abi/ProxyMock.json'
import ProxyFactory from '../../abi/ProxyFactoryMock.json'
import Safe from '../../abi/GnosisSafe.json'
import SafeProxyFactory from '../../abi/GnosisSafeProxyFactory.json'
import { Transaction } from '../../models/Transaction'
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

export async function execute({ chainId, projectId }) {
  try {
    const project = await getOneProject({ _id: projectId })

    if (!project) {
      throw new Error('Project not found')
    }
    
    const { executorKey, ownerKeys, masterKeys } = project
    const { rpc, proxyFactory, forwardPolicies, safeFallbackHandler, safeProxyFactory, safeSingleton } = config[chainId]
    const provider = new ethers.providers.JsonRpcProvider(rpc)
  
    const executorWallet = new ethers.Wallet(executorKey, provider)
    const proxyInterface = new ethers.utils.Interface(Proxy.abi)
    const proxyFactoryContract = new ethers.Contract(proxyFactory, ProxyFactory.abi, executorWallet)
    const safeProxyFactoryContract = new ethers.Contract(safeProxyFactory, SafeProxyFactory.abi, executorWallet)
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
    
    const transaction = new Transaction({
      projectId,
      chainId,
      to: proxyFactory, 
      data: proxyFactoryContract.interface.encodeFunctionData('createProxy', [initializeCalldata]),
    });

    const receipt = await executeTx(transaction);

    const safeProxyCreationLogs = findLogs(receipt, safeProxyFactoryContract, 'ProxyCreation')
    const proxyCreationLog = findLogs(receipt, proxyFactoryContract, 'NewProxy')[0]
  
    const [ownersOfFirst, ownersOfSecond] = await Promise.all([
      new ethers.Contract(safeProxyCreationLogs[0].args.proxy, Safe.abi, executorWallet).getOwners(),
      new ethers.Contract(safeProxyCreationLogs[1].args.proxy, Safe.abi, executorWallet).getOwners(),
    ]);
  
    const ownerSafe = ownersOfFirst.every(address => ownerAddresses.includes(utils.getAddress(address)))
      ? safeProxyCreationLogs[0].args.proxy
      : safeProxyCreationLogs[1].args.proxy
    const masterSafe = ownersOfSecond.every(address => masterAddresses.includes(utils.getAddress(address)))
      ? safeProxyCreationLogs[1].args.proxy
      : safeProxyCreationLogs[0].args.proxy
  
    const proxy = await updateProxy({
      fields: {
        projectId,
        chainId,
        ownerSafe,
        masterSafe,
        address: proxyCreationLog.args.proxy,
        saltNonce,
        receipt,
      },
    });
    return proxy;
  } catch (error) {
    console.error(error)
    throw error
  }
}