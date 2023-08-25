import styles from "./layout.module.css"
export const Layout = ({ children }) => (
  <div className={styles.layoutContainer}>{children}</div>
)
