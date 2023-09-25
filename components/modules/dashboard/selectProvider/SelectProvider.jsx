import styles from "./selectProvider.module.css"

export const SelectProvider = ({ storedProvider, handleProvider }) => (
  <div className={styles.selectProvider}>
    <select
      onChange={(e) => handleProvider(e.target.value)}
      value={storedProvider}
    >
      <option value="mock">Mock Provider</option>
      <option value="web3auth">Web3 Auth</option>
    </select>
  </div>
)
