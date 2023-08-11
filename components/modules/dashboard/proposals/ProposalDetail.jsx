import styles from "./proposalDetail.module.css"
export const ProposalDetail = ({ proposal }) => {
  console.log({ proposal })

  const network = proposal?.chainId === "0x13881" ? "Mumbai" : "Unknown"

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
          <span>{proposal.status}</span>
          <span>{network}</span>
          <span>{proposal.projectId}</span>
          <span>{proposal.sender}</span>
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.container}>
      <h2 className={styles.title}>Loading Proposal data</h2>
    </div>
  )
}
