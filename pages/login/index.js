import { useEffect } from "react"
import { Login as LoginTemplate } from "../../components/templates/Login"

const Page = () => {
  useEffect(() => {
    document.body.classList.add("dark")
  }, [])
  return <LoginTemplate />
}

export default Page
