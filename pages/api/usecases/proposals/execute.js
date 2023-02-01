import { ethers } from 'ethers';
import { config } from '../../config';
import { getOne as getProposal, update as updateProposal, markAsExecuted, markAsFailed } from '../../repositories/proposals';
import { getOne as getProject } from '../../repositories/projects';
import { execute as executeTransaction } from '../../infrastructure/executor';

import Safe from '../../abi/Safe.json'

export async function execute({ proposalId }) {
  try {

    let proposal = await getProposal({ _id: proposalId });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const { chainId, projectId } = proposal;

    const project = await getProject({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }

    const { executorKey } = project;

    const { rpc } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(executorKey, provider);

    const sortedSignatures = proposal.signatures.sort((a, b) => {
      const aAddress = ethers.utils.recoverAddress(proposal.contractTransactionHash, a)
      const bAddress = ethers.utils.recoverAddress(proposal.contractTransactionHash, b)
      return aAddress.localeCompare(bAddress)
    })
  
    const signaturesBytes = ethers.utils.solidityPack(
      sortedSignatures.map(() => 'bytes'),
      sortedSignatures
    );

    const safeInterface = new ethers.utils.Interface(Safe.abi);
    const data = safeInterface.encodeFunctionData('execTransaction', [
      proposal.to, // safe
      proposal.value, // 0
      proposal.data, // wrapped calldata
      proposal.operation, // 0
      proposal.safeTxGas, // safeTxGas
      proposal.baseGas, // baseGas
      proposal.gasPrice, // gasPrice
      proposal.gasToken, // gasToken
      proposal.refundReceiver, // refundReceiver
      signaturesBytes, // signatures
    ]);
    
    try {
      const receipt = await executeTransaction({
        to: proposal.safe,
        data,
        value: 0,
        signer,
      });
      await updateProposal({
        id: proposalId,
        fields: { receipt },
      })
      proposal = await markAsExecuted(proposalId);
    } catch (error) {
      proposal = await markAsFailed(proposalId);
    } 
    return proposal;
  } catch (error) {
    console.error(error)
    throw error;
  }
}