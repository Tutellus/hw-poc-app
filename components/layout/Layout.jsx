import { TopBar } from "../modules"
import styles from "./layout.module.css"

export const Layout = ({ children }) => (
  <>
    <TopBar />
    <div className={styles.layoutContainer}>{children}</div>
  </>
)
