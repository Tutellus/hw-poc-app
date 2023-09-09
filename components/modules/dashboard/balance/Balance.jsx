import cx from "classnames"
import styles from "./balance.module.css"

import { useHighlightOnChange } from "./useHighlightOnChange"

export const Balance = ({ balance, balanceClass }) => {

  const isHighligth = useHighlightOnChange({ value: balance })

  const addressClass = cx(styles.balance, {
    [styles.balanceHighlight]: isHighligth,
  })

  return (
    <div className={balanceClass}>
      <div className={styles.title}>Balance</div>
      <div className={addressClass}>{balance} HW</div>
    </div>
  )
}
