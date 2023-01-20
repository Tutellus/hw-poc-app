import { useMainContext } from "@/state/main.context";
import { useEffect, useRef, useState } from "react";

export const Dashboard = () => {

  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { session, logOut } = useMainContext();
  const [did, setDid] = useState(null);

  const assignDid = async () => {
    setAssigning(true);
    const response = await fetch('/api/usecases/dids/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: session._id }),
    })
    const { did: item } = await response.json()
    setDid(item);
    setAssigning(false);
  }

  const loadDid = async () => {
    setLoading(true);
    const response = await fetch('/api/usecases/dids/getOne', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filter: {
        userId: session._id,
      } }),
    })
    const { did } = await response.json()
    if (did) {
      setDid(did);
    } else {
      if (!assigning) {
        await assignDid();
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session && !ref.current && !loading) {
      loadDid();
      ref.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return <div>
    <h1>Dashboard</h1>
    {did && <div>
      <h2>My DID</h2>
      <div>{`Connected >>> ${did?.address}`}</div>
    </div>}
    {!did && <div>
      <h2>My DID</h2>
      <div>Connecting...</div>
    </div>
    }
    {assigning && <div>Assigning DID...</div>}
    <button onClick={logOut}>Logout</button>
  </div>
}
