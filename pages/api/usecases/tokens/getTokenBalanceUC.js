const { config } = require('../../config.js')
const { ethers } = require('ethers')
const ERC20Upgradeable = require('../../abi/ERC20Upgradeable.json')

export default async function handler(req, res) {
  const { chainId, token, address } = req.body;
  const balance = await execute({ chainId, token, address });
  res.status(200).json({ balance });
}

export async function execute({
  chainId,
  token,
  address,
}) {
  try {
    const { rpc } = config[chainId]
    const provider = new ethers.providers.JsonRpcProvider(rpc)
    const tokenContract = new ethers.Contract(token, ERC20Upgradeable.abi, provider)
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals(),
    ]);
    
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error(error)
    throw error;
  }
}