import { config } from '../../config.js'
import { ethers } from 'ethers'
import ERC20Upgradeable from '../../abi/ERC20Upgradeable.json'
import { execute as executeGetByUser } from '../../usecases/dids/getByUser.js'

export default async function handler(req, res) {
  const { token, user } = req.body;
  const balance = await execute({ token, user });
  res.status(200).json({ balance });
}

export async function execute({ token, user }) {
  const { chainId, rpcUrl } = config
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId)
  const tokenContract = new ethers.Contract(token, ERC20Upgradeable.abi, provider)
  const did = await executeGetByUser({ user })
  if (!did) {
    return '0.0';
  }
  const [balance, decimals] = await Promise.all([
    tokenContract.balanceOf(did.address),
    tokenContract.decimals(),
  ]);
  
  return ethers.utils.formatUnits(balance, decimals);
}