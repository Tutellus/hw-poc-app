export const LoginForm = ({
  loggingIn,
  email,
  emailChangeFn,
  submitFn,
}) => {
  return (
    <div className="login">
      <input
        className="input-email"
        type="email"
        name="email"
        id="email"
        placeholder="Email"
        disabled={loggingIn}
        value={email}
        onChange={emailChangeFn}
      />
      <button
        type="submit"
        onClick={submitFn}
        disabled={loggingIn}
      >{loggingIn ? 'Loading...' : 'Go'}</button>
    </div>
  )
}