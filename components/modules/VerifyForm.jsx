export const VerifyForm = ({
  verifying,
  code,
  codeChangeFn,
  submitFn,
}) => {
  return (
    <div>
      <h1>Verify</h1>
      <div>
        <label htmlFor="text">Code</label>
        <input
          type="text"
          name="code"
          id="code"
          disabled={verifying}
          value={code}
          onChange={codeChangeFn}
        />
      </div>
      <button
        type="submit"
        onClick={submitFn}
        disabled={verifying}
      >{verifying ? 'Verifying...' : 'Verify'}</button>
    </div>
  )
}