import { useEffect } from "react";
import { useUser } from "@/state/user.context";
import { useRouter } from "next/router";

export const Login = () => {
  const { user, login } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isLoading = user?.status === "loading";

  return (
    <div className="login">
      <button type="submit" onClick={() => login("discord")} disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </button>
    </div>
  );
};
