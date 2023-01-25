import { useSession } from "@/state/session.context"
import { useEffect } from "react";

export default function Home() {
  const { redirect } = useSession();

  // const start = async () => {
  //   await redirect();
  // }

  useEffect(() => {
    redirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    null
    // <div style={{
    //   display: 'flex',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   marginTop: '50px'
    // }}>
    //   <button onClick={start}>Start</button>
    // </div>
  );
}