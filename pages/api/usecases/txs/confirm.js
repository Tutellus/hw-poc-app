import { config } from '../../config';
import { push, sign } from '../../utils/safe'
import { update as updateTx } from '../../repositories/txs';

export async function execute({ 
  tx,
  safe,
  signerAddress,
  signature,
}) {
  try {
    const { chainId } = config
    const signatures = tx.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }

    // Push the transaction to the Safe
    await push(chainId, safe, {
      ...tx,
      signature,
      sender: signerAddress,
    })

    // Update the transaction
    await updateTx({
      id: tx._id,
      fields: {
        signatures,
      }
    })
  } catch (error) {
    console.error(error)
    return {};
  }
}