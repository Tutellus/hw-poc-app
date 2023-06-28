import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default Page;
Page.requireAuth = true;
