import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React, { useEffect } from 'react'
import { useMainContext } from '@/state/main.context'
import { useRouter } from 'next/router';

export default function Home() {

  const { session } = useMainContext();
  const router = useRouter();

  // const [loading, setLoading] = React.useState(false)
  // const [email, setEmail] = React.useState('')
  // const [code, setCode] = React.useState('')
  // const [did, setDID] = React.useState({})
  // const [txs, setTxs] = React.useState({})

  // const logged = !!session?.status;
  // const showLogin = !loading && !logged;
  // const showVerification = !loading && logged && session.status === 'PENDING';
  // const showDID = !loading && logged && session.status === 'VERIFIED' && did?.status === 'ASSIGNED';

  // // useEffect(() => {
  // //   if (showDID) {
  // //     loadTxs();
  // //   }
  // // }, [showDID]);

  // const login = async () => {
  //   setLoading(true)
  //   const response = await fetch('/api/login', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ email }),
  //   })
  //   const data = await response.json()
  //   setSession(data.user);
  //   setLoading(false)

  //   if (data.user.status === 'VERIFIED') {
  //     const response2 = await fetch('/api/getDID', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email }),
  //     })
  //     const data2 = await response2.json()
  //     setDID(data2.did);
  //   }
  // }

  // const verify = async () => {
  //   setLoading(true)
  //   const response = await fetch('/api/verify', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ email: session.email, verifyCode: code }),
  //   })
  //   const data = await response.json()
  //   setDID(data.did);
  //   setLoading(false);
  //   login();
  // }

  // const loadTxs = async () => {
  //   setLoading(true)
  //   const response2 = await fetch('/api/tx/getTxs', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //   const data2 = await response2.json()
  //   const filtered = data2.txs.filter(tx => tx.did === did._id);
  //   setTxs(filtered);
  //   setLoading(false);
  // }

  // const requestTx = async () => {
  //   setLoading(true)
  //   const response = await fetch('/api/tx/request', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ did }),
  //   })
  //   await response.json()    
  //   loadTxs();
  //   setLoading(false);
  // }

  // const confirmTx = async ({ id }) => {
  //   setLoading(true)
  //   const response = await fetch('/api/tx/confirm', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ id }),
  //   })
  //   const data = await response.json()
  //   loadTxs();
  //   setLoading(false);
  // }

  // const executeTx = async ({ id }) => {
  //   setLoading(true)
  //   const response = await fetch('/api/tx/execute', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ id }),
  //   })
  //   await response.json()
  //   loadTxs();
  //   setLoading(false);
  // }

  // const goToExplorer = async ({ hash }) => {
  //   window.open(`https://goerli.etherscan.io/tx/${hash}`, '_blank');
  // }
  
  // const logout = () => {
  //   setSession({})
  //   setDID({})
  //   setEmail('')
  //   setCode('')
  //   setTxs([])
  // }

  const goTo = () => {
    if (session) {
      if (session.status === 'VERIFIED') {
        router.push('/dashboard');
      } else {
        router.push('/verify');
      }
    } else {
      router.push('/login');
    }
  }

  useEffect(() => {
    goTo();
  }, [])

  return <></>
  // return (
  //   <>
  //     <Head>
  //       <title>DID POC</title>
  //     </Head>
  //     <main className={styles.main}>
  //       {loading && <div className={styles.center}>
  //         <div style={{
  //           fontSize: 40,
  //         }}>Loading...</div>
  //       </div>}
  //       {showLogin && <div className={styles.center}>
  //         <input
  //           className={styles.input}
  //           value={email}
  //           onChange={(e) => setEmail(e.target.value)}
  //           placeholder="Insert your email"
  //         />
  //         <button onClick={login} className={styles.button}>Login</button>
  //       </div>}
  //       {showVerification && <div className={styles.center}>
  //         <div style={{
  //           fontSize: 40,
  //         }}>{`Code: ${session.verifyCode}`}</div>
  //         <input
  //           className={styles.input}
  //           value={code}
  //           onChange={(e) => setCode(e.target.value)}
  //           placeholder="Insert your code"
  //         />
  //         <button onClick={verify} className={styles.button}>Verify</button>
  //         <button onClick={logout} className={styles.button}>Logout</button>
  //       </div>}
  //       {showDID && <div className={styles.center}>
  //         <div style={{
  //           fontSize: 32,
  //           width: '100%',
  //         }}>
  //           Your account: {did.address}
  //         </div>
  //         {txs?.length > 0 && <div>
  //           {txs.map((tx) => (
  //             <div style={{
  //               display: 'flex',
  //               flexDirection: 'row',
  //               justifyContent: 'space-between',
  //               alignItems: 'center',
  //             }} key={tx._id}>
  //               <div>{JSON.stringify(tx._id, null, 2)}</div>
  //               {tx?.status === 'PENDING' && <button onClick={() => confirmTx({ id: tx._id })} className={styles.button}>2FA Confirm</button>}
  //               {tx?.status === 'PENDING'
  //                 ? <button onClick={() => executeTx({ id: tx._id })} className={styles.button}>Execute</button>
  //                 : <button onClick={() => goToExplorer({ hash: tx.executionTxHash })} className={styles.button}>See on explorer</button>
  //               }
  //             </div>
  //           ))
  //           }
  //         </div>}
  //         <button onClick={requestTx} className={styles.button}>Request</button>
  //         <button onClick={logout} className={styles.button}>Logout</button>
  //       </div>}
  //     </main>
  //   </>
  // )
}
