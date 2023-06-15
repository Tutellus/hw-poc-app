import { Web3Auth } from "@web3auth/modal"
export * from "./web3Auth"
export * from "./contract"
export * from "./human"
export * from "./config"

const innerChainId = process.env.NEXT_PUBLIC_CHAIN_ID

const init = async () => {
  const w3a = new Web3Auth({
    clientId: innerChainId,
    chainConfig: {
      chainNamespace: "eip155",
      chainId: innerChainId,
    },
  })
  await w3a.initModal()
}

init()
