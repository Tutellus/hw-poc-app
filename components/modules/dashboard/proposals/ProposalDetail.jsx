import { truncateAddress } from "@/utils/address"
import {
  Button,
  buttonTypes,
} from "@tutellus/tutellus-components/lib/components/atoms/button"
import {
  LinkIcon,
  PolygonScanIcon,
  CheckOKIcon,
  CheckKOIcon,
} from "@/components/icons"
import styles from "./proposalDetail.module.css"
export const ProposalDetail = ({ proposal }) => {
  const network =
    proposal?.chainId === "0x13881" ? (
      <span className={styles.tagMumbai}>
        <PolygonScanIcon /> MUMBAI
      </span>
    ) : (
      <span className={styles.tagMumbai}>UNKNOWN</span>
    )
  const labelStatus =
    proposal?.status === "CONFIRMED" ? (
      <span className={styles.tagOk}>
        <CheckOKIcon /> SUCCESS
      </span>
    ) : (
      <span className={styles.tagKo}>
        <CheckKOIcon /> FAILED
      </span>
    )

  return proposal ? (
    <div className={styles.container}>
      <h2 className={styles.title}>Details</h2>
      <div className={styles.block}>
        <div className={styles.itemContainer}>
          <span className={styles.label}>Transaction Hash</span>
          <span className={styles.contentLabel}>{proposal.txHash}</span>
        </div>
        <div className={styles.itemContainer}>
          <span>Nonce</span>
          <span className={styles.contentLabel}>{proposal.nonce}</span>
        </div>
        <div className={styles.itemContainer}>
          <span>Required 2FA</span>
          <span className={styles.contentLabel}>
            {proposal.required2FA ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
        <div className={styles.itemContainer}>
          <span>Status</span>
          {labelStatus}
        </div>
        <div className={styles.itemContainer}>
          <span>Network</span>
          <span className={styles.contentLabel}>{network}</span>
        </div>
        <div className={styles.itemContainer}>
          <span>Project ID</span>
          <span className={styles.contentLabel}>{proposal.projectId}</span>
        </div>
        <div className={styles.keys}>
          <span>Sender</span>
        </div>
        <div className={styles.values}>
          <span className={styles.contentLabel}>{proposal.sender}</span>
        </div>
      </div>
      <div className={styles.links}>
        <span className={styles.cta}>
          <Button
            iconLeft={<PolygonScanIcon />}
            iconRight={<LinkIcon />}
            type={buttonTypes.OUTLINE}
            onClick={() =>
              window.open(
                `https://mumbai.polygonscan.com/address/${proposal?.sender}#tokentxns`
              )
            }
          >
            {truncateAddress(
              {
                address: proposal?.sender,
              },
              { noLink: true }
            )}
          </Button>
        </span>
      </div>
    </div>
  ) : (
    <div className={styles.container}>
      <h2 className={styles.title}>Loading Proposal data</h2>
    </div>
  )
}
