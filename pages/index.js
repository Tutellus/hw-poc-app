import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React from 'react'

export default function Home() {

  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [session, setSession] = React.useState({})
  const [code, setCode] = React.useState('')
  const [did, setDID] = React.useState({})
  const logged = !!session?.status;
  const showLogin = !loading && !logged;
  const showVerification = !loading && logged && session.status === 'PENDING';
  const showDID = !loading && logged && session.status === 'VERIFIED' && did?.status === 'ASSIGNED';

  const login = async () => {
    setLoading(true)
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    setSession(data.user);
    setLoading(false)

    if (data.user.status === 'VERIFIED') {
      const response2 = await fetch('/api/getDID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const data2 = await response2.json()
      setDID(data2.did);
    }
  }

  const verify = async () => {
    setLoading(true)
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: session.email, verifyCode: code }),
    })
    const data = await response.json()
    setDID(data.did);
    setLoading(false);
    login();
  }

  const sendTx = async () => {
    console.log('Sending tx')
  }

  const logout = () => {
    setSession({})
    setDID({})
    setEmail('')
    setCode('')
  }

  console.log('showDID', loading, logged, session.status, did)
  return (
    <>
      <Head>
        <title>DID POC</title>
      </Head>
      <main className={styles.main}>
        {loading && <div className={styles.center}>
          <div style={{
            fontSize: 40,
          }}>Loading...</div>
        </div>}
        {showLogin && <div className={styles.center}>
          <input
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Insert your email"
          />
          <button onClick={login} className={styles.button}>Login</button>
        </div>}
        {showVerification && <div className={styles.center}>
          <div style={{
            fontSize: 40,
          }}>{`Code: ${session.verifyCode}`}</div>
          <input
            className={styles.input}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Insert your code"
          />
          <button onClick={verify} className={styles.button}>Verify</button>
          <button onClick={logout} className={styles.button}>Logout</button>
        </div>}
        {showDID && <div className={styles.center}>
          <div>
            {JSON.stringify(did, null, 2)}
          </div>
          <button onClick={sendTx} className={styles.button}>Send Tx</button>
          <button onClick={logout} className={styles.button}>Logout</button>
        </div>}
      </main>
    </>
  )
}
