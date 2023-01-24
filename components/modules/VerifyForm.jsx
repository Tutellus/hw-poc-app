export const VerifyForm = ({
  verifying,
  code,
  codeChangeFn,
  submitFn,
}) => {
  return (
    <div className="login">
      <input
        className="input-email"
        type="text"
        placeholder="Your 2FA code here"
        disabled={verifying}
        value={code}
        onChange={codeChangeFn}
      />
      <button
        type="submit"
        onClick={submitFn}
        disabled={verifying}
      >{verifying ? 'Verifying...' : 'Verify'}</button>
    </div>
  )
}