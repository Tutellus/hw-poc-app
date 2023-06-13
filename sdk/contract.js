const CONTRACT_DATA = {
  chainId: "0x13881",
  address: "0x2CEDFf179BF88F7B4b1FFF9ca6d53393E956B74F",
  abi: [
    "function mint(address to, uint256 amount) public",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)",
  ],
}

let contract = null

export const contractSDK = {
  updateContract: async () => {
    try {
      const params = {
        address: CONTRACT_DATA.address,
        abi: CONTRACT_DATA.abi,
        chainId: CONTRACT_DATA.chainId,
      }

      const response = await fetch("/api/usecases/contracts/updateContractUC", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
      const { contract: updatedContract } = await response.json()
      contract = updatedContract
    } catch (error) {
      console.error(error)
    }
  },
  contract,
}
