import { useMainContext } from "@/state/main.context"
import { useEffect } from "react";

export default function Home() {
  const { redirect } = useMainContext();
  useEffect(() => {
    redirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <></>
}