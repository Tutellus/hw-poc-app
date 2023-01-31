import { getOne as getProject } from '../../repositories/projects';

export default async function handler(req, res) {
  try {
    const { projectId } = req.body;
    const response = await execute({ projectId });
    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ projectId }) {
  try {
    const project = await getProject({ _id: projectId });
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  } catch (error) {
    console.error(error)
    throw error;
  }
}