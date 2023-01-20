import { markAsAssigned, update as updateDID } from '../../repositories/dids'
import { execute as executeCreate } from './create';

export async function execute({
  user
}) {
  if(!user || user.status !== 'VERIFIED') {
    return null;
  }
  let did = await getOne({ userId: user._id });
  if (did) {
    return did;
  }
  did = await getOne({ status: 'PENDING' });
  if (!did) {
    did = await executeCreate();
  }
  did = await updateDID({
    id: did._id,
    fields: {
      userId: user._id,
    },
  });
  did = await markAsAssigned(did._id);
  // creates a new DID
  executeCreate();
  return did;
}