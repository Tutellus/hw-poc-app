// createUserOpUC.js

export default async function handler(req, res) {
  const { user, target, data, value } = req.body;
  const balance = await execute({  });
  res.status(200).json({  });
}

export async function execute({ user, target, data, value }) {
  try {
    
    const human = await getHumanUC.execute()

    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error(error)
    throw error;
  }
}