import { useMainContext } from "@/state/main.context"
import { useEffect } from "react";

export default function Home() {
  const { redirect } = useMainContext();

  const start = async () => {
    await redirect();
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '50px'
    }}>
      <button onClick={start}>Start</button>
    </div>
  );
}