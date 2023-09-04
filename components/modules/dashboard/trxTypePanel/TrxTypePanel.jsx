import {
  Button,
  buttonColors,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
import styles from "./trxTypePanel.module.css"
import cx from "classnames"

export const TrxTypePanel = ({ literal, icon, callback, isDisabled }) => (
  <div
    className={cx(styles.panelContainer, { [styles.isDisabled]: isDisabled })}
  >
    <div className={styles.titleContainer}>
      <div className={styles.title}>{literal}</div>
      <div className={styles.icon}>{icon}</div>
    </div>
    <Button
      color={buttonColors.ACCENT}
      isDisabled={isDisabled}
      onClick={callback}
    >
      TEST
    </Button>
  </div>
)
