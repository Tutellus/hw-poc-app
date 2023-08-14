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
  const network = proposal?.chainId === "0x13881" ? "Mumbai" : "Unknown"
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
        <div className={styles.keys}>
          <span>Transaction Hash</span>
          <span>Nonce</span>
          <span>Required 2FA</span>
          <span>Status</span>
          <span>Network</span>
          <span>Project ID</span>
          <span>Sender</span>
        </div>
        <div className={styles.values}>
          <span>{proposal.txHash}</span>
          <span>{proposal.nonce}</span>
          <span>{proposal.required2FA ? "ACTIVE" : "INACTIVE"}</span>
          {labelStatus}
          <span>{network}</span>
          <span>{proposal.projectId}</span>
          <span>{proposal.sender}</span>
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
