import { useState } from "react"
import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button"
import { Spinner } from "@tutellus/tutellus-components/lib/components/atoms/spinner"
import { Input } from "@tutellus/tutellus-components/lib/components/atoms/form/input"
import { explorerLink, truncateAddress } from "@/utils/address"
import styles from "./proposals.module.css"
import { SendIcon } from "@/components/icons"

export const Proposal = ({
  proposal = {},
  processingProposal,
  confirmProposal,
}) => {
  const [code, setCode] = useState("123456")

  const changeCode = (e) => {
    setCode(e.target.value)
  }

  const requiresConfirmation =
    proposal?.required2FA && proposal?.status === "PENDING"

  const isNotPending =
    proposal?.status === "PROCESSED" ||
    proposal?.status === "EXECUTED" ||
    proposal?.status === "CONFIRMED"

  return (
    <div className={styles.pendingItemContainer}>
      <div className={styles.block}>
        <div className={styles.values}>
          {proposal?.status !== "PENDING" && (
            <div className={styles.isPendingTrx}>
              <div>{proposal?.title}</div>
              <div className={styles.statusContainer}>
                <span className={styles.label}>{"PENDING"}</span>
                <div className={styles.pending}>
                  <Spinner />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {requiresConfirmation && (
        <>
          <div>
            <div>{proposal?.title}</div>
          </div>
          <div className={styles.blockInput}>
            <Input
              type="text"
              placeholder="2FA Code"
              value={code}
              onChange={changeCode}
            />
            <Button
              iconLeft={<SendIcon />}
              disabled={processingProposal}
              onClick={() =>
                confirmProposal({ proposalId: proposal?._id, code })
              }
            ></Button>
          </div>
        </>
      )}
    </div>
  )
}
