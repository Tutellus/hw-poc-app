/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button"
import { useHuman } from "@/state/human.context"
import styles from "./trxTypePanel.module.css"

export const TrxTypePanel = ({ literal, icon, callback }) => {
  return (
    <div className={styles.panelContainer}>
      <div className={styles.title}>{literal}</div>
      <div className={styles.description}>{icon}</div>
      <Button onClick={callback}>PROBAR</Button>
    </div>
  )
}
