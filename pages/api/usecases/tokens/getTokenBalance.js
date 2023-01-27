import { config } from '../../config.js'
import { ethers } from 'ethers'
import ERC20Upgradeable from '../../abi/ERC20Upgradeable.json'

export default async function handler(req, res) {
  const { token, user } = req.body;
  const balance = await execute({ token, user });
  res.status(200).json({ balance });
}

export async function execute({
  chainId,
  token,
  address,
}) {
  const { rpc } = config[chainId]
  const provider = new ethers.providers.JsonRpcProvider(rpc)
  const tokenContract = new ethers.Contract(token, ERC20Upgradeable.abi, provider)
  const [balance, decimals] = await Promise.all([
    tokenContract.balanceOf(address),
    tokenContract.decimals(),
  ]);
  
  return ethers.utils.formatUnits(balance, decimals);
}