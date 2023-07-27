import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button";

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
      <div className="logo">
        <img
          src="https://uploads-ssl.webflow.com/64bfe0b7cf5ceb8900f47cfc/64c0d82e4f9a861231dfe614_human-wallet.svg"
          alt="logo"
        />
      </div>
      <Button onClick={() => signIn("discord")} disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log in"}
      </Button>
    </div>
  );
};
