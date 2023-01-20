export const LoginForm = ({
  loggingIn,
  email,
  emailChangeFn,
  submitFn,
}) => {
  return (
    <div>
      <h1>Login</h1>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          disabled={loggingIn}
          value={email}
          onChange={emailChangeFn}
        />
      </div>
      <button
        type="submit"
        onClick={submitFn}
        disabled={loggingIn}
      >{loggingIn ? 'Logging...' : 'Login'}</button>
    </div>
  )
}