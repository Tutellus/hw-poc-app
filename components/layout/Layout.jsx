import { TopBar } from "../modules"
import styles from "./layout.module.css"
import cx from "classnames"

export const Layout = ({ children, router }) => {
  console.log({ router })
  const showTopBar = router.pathname !== "/login"

  const layoutClass = cx({
    [styles.layoutContainer]: true,
    [styles.withoutTopBar]: !showTopBar,
  })

  return (
    <>
      {showTopBar && <TopBar />}
      <div className={layoutClass}>{children}</div>
    </>
  )
}
