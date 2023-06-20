import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export const Login = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const isLoading = status === "loading";

  return (
    <div className="login">
      <button type="submit" onClick={() => signIn("discord")} disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </button>
    </div>
  );
};
