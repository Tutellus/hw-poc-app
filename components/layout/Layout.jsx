import styles from "./Layout.module.css"
export const Layout = ({ children }) => (
  <div className={styles.layoutContainer}>{children}</div>
)
