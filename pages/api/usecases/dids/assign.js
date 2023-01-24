import { getOne as getOneUser } from '../../repositories/users'
import { markAsAssigned, update as updateDID, getOne as getOneDID } from '../../repositories/dids'
import { execute as executeCreate } from './create';

export default async function handler(req, res) {
  const { userId } = req.body;
  const did = await execute({ userId });
  res.status(200).json({ did });
}

export async function execute({ userId }) {
  try {
    const user = await getOneUser({ _id: userId });
    if(!user || user.status !== 'VERIFIED') {
      return null;
    }
    
    let did = await getOneDID({ userId: user._id });
    if (did) {
      return did;
    }
    did = await getOneDID({ status: 'PENDING' });

    if (did) {
    } else {
      did = await executeCreate();
    }

    await updateDID({
      id: did._id,
      fields: {
        userId: user._id,
      },
    });

    did = await markAsAssigned(did._id);
    
    // creates a new DID if the last one is assigned
    executeCreate();
    return did;
  } catch (error) {
    return {
      error: error.message,
    };
  }
}