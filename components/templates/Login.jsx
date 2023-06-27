import { useUser } from "@/state/user.context";

export const Login = () => {
  const { login, loading, loggingIn, user } = useUser();
  return (
    <div className="login">
      <button type="submit" onClick={login} disabled={loading || loggingIn || user}>
        {loggingIn ? "Logging in..." : "Log in"}
      </button>
    </div>
  );
};
