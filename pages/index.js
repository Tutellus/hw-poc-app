import { useWeb3Auth } from "@/state/web3auth.context";
import { useEffect } from "react";

export default function Home() {
  const { redirect } = useWeb3Auth();
  useEffect(() => {
    redirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}