import { web3AuthSDK } from "@/sdk"
import { useEffect } from "react"

export default function Home() {
  const { redirect } = web3AuthSDK
  useEffect(() => {
    redirect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
