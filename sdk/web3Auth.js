import { ethers } from "ethers"

let w3a
let isLoggingIn = false
let web3AuthProvider
let user
let web3Auth
let web3Provider
let externalAccount

const WEB3AUTH_USER_KEY = "web3auth-user"

export const web3AuthSDK = {
  logIn: async () => {
    if (isLoggingIn) return
    isLoggingIn = true

    const provider = await web3Auth?.connect()
    if (provider) {
      web3Provider = new ethers.providers.Web3Provider(provider)
    }
    web3AuthProvider = provider
    web3AuthSDK.getUserInfo()

    isLoggingIn = false
  },

  logOut: async () => {
    if (isLoggingIn) return

    const provider = await web3Auth?.logout()
    web3AuthProvider = provider
    web3Provider = null
    user = null
    externalAccount = null
    localStorage.removeItem(WEB3AUTH_USER_KEY)
  },

  getUserInfo: async () => {
    if (localStorage.getItem(WEB3AUTH_USER_KEY)) {
      const userInfo = JSON.parse(localStorage.getItem(WEB3AUTH_USER_KEY))
      user = userInfo
      return
    } else {
      const userInfo = await w3a?.getUserInfo()
      user = userInfo
    }
  },
  redirect: () => {
    if (user) {
      if (window.location.pathname !== "/dashboard") {
        window.location.href = "/dashboard"
      }
    } else {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
  },
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  web3Auth,
  web3AuthProvider,
  web3Provider,
  user,
  isLoggingIn,
  externalAccount,
}
