import { Web3Auth } from "@web3auth/modal"

let isLoggingIn = false
let isLoading = false
let web3AuthProvider
let user
let web3Auth

const innerChainId = process.env.NEXT_PUBLIC_CHAIN_ID
const innerProjectId = process.env.NEXT_PUBLIC_PROJECT_ID

const init = async () => {
  try {
    const w3a = new Web3Auth({
      clientId: innerChainId,
      chainConfig: {
        chainNamespace: "eip155",
        chainId: innerChainId,
      },
    })
    await w3a.initModal()
    web3Auth = w3a
  } catch (e) {
    console.error(e)
  }
}

init()

export const web3AuthSDK = {
  logIn: async () => {
    debugger
    if (isLoggingIn) {
      return
    }
    isLoggingIn = true
    try {
      const provider = await web3Auth.connect()
      web3AuthProvider = provider
      this.getUserInfo(web3Auth)
    } catch (e) {
      console.error(e)
      web3AuthProvider = null
      user = null
    }
    isLoggingIn = false
  },
  getUserInfo: async (w3a) => {
    try {
      if (localStorage.getItem(WEB3AUTH_USER_KEY)) {
        const userInfo = JSON.parse(localStorage.getItem(WEB3AUTH_USER_KEY))
        user = userInfo
        return
      } else {
        const userInfo = await w3a.getUserInfo()
        user = userInfo
      }
    } catch (e) {
      console.error(e)
    }
  },
}
