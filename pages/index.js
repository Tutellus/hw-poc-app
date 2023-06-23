import { useEffect } from "react";
import { useUser } from "@/state/user.context";
import { useRouter } from "next/router";

const Page = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Page;
Page.requireAuth = true;
