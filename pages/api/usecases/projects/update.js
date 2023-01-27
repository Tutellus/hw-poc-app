import { update as updateProject } from '../../repositories/projects';

export default async function handler(req, res) {
  const { projectId, executorKey, ownerKeys, masterKeys } = req.body;
  const response = await execute({ projectId, executorKey, ownerKeys, masterKeys });
  res.status(200).json(response)
}

export async function execute({
  projectId,
  executorKey,
  ownerKeys,
  masterKeys,
}) {
  try {
    const project = await updateProject({
      id: projectId,
      fields: {
        executorKey,
        ownerKeys,
        masterKeys,
      }
    });
    return project;
  } catch (error) {
    console.error(error)
    throw error;
  }
}