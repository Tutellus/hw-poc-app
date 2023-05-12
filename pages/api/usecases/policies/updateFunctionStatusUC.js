const { ethers } = require("ethers");
const { config } = require("../../config");
const executorInfra = require('../../infrastructure/executor');

const HumanExecutePolicies = require("../../abi/HumanExecutePolicies.json");

export default async function handler (req, res) {
  const { chainId, address, selectorAndParams, status } = req.body;
  const response = await execute({ chainId, address, selectorAndParams, status });
  res.status(200).json({response});
}

export async function execute ({
  chainId,
  address,
  selectorAndParams,
  status,
}) {
  try {
    const { rpc, executePolicies, factorySigner } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const executor = new ethers.Wallet(factorySigner.kPriv, provider);
    const executePoliciesInterface = new ethers.utils.Interface(HumanExecutePolicies.abi);

    const receipt = await executorInfra.execute({
      to: executePolicies,
      data: executePoliciesInterface
        .encodeFunctionData(
          'updateIdStatus',
          [address, selectorAndParams, status]
        ),
      value: 0,
      signer: executor,
    });
    
    return receipt;
    
  } catch (error) {
    console.error(error)
    throw error;
  }
}