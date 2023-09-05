import styles from "./balance.module.css"

export const Balance = ({ balance, balanceClass }) => (
  <div className={balanceClass}>
    <div className={styles.title}>Balance</div>
    <div className="balance">{balance} HW</div>
  </div>
)
