// /* eslint-disable react-hooks/exhaustive-deps */
// import { useRouter } from "next/router";
// import { createContext, useContext, useState, useMemo, useEffect } from "react";
// import { DEFAULT_CHAIN_ID } from "./wallet.context";

// const PROJECT_ID = "63d3c3a83d55158bfb36d502";

// const SessionContext = createContext({
//   verifying: false,
//   loggingIn: false,
//   assigningProxy: false,
//   loadingProxy: false,
//   session: null,
//   proxy: null,
//   loadProxy: async () => {},
//   logIn: async () => {},
//   logOut: async () => {},
//   verifyUser: async () => {},
//   redirect: async () => {},
// });

// function SessionProvider(props) {
//   const [verifying, setVerifying] = useState(false);
//   const [loggingIn, setLoggingIn] = useState(false);
//   const [assigningProxy, setAssigningProxy] = useState(false);
//   const [loadingProxy, setLoadingProxy] = useState(false);
//   const [session, setSession] = useState(null);
//   const [proxy, setProxy] = useState(null);
//   const router = useRouter();

//   const logIn = async (email) => {
//     setLoggingIn(true)
//     const response = await fetch('/api/usecases/users/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email }),
//     })
//     const { user } = await response.json()
//     setSession(user);
//     setLoggingIn(false)
//   }

//   const logOut = () => {
//     setSession(null);
//     setProxy(null);
//     localStorage.removeItem('session');
//     router.push('/login');
//   };

//   const assignProxy = async () => {
//     if (session && session.status === 'VERIFIED') {
//       setAssigningProxy(true);
//       const params = {
//         userId: session._id,
//         chainId: DEFAULT_CHAIN_ID,
//         projectId: PROJECT_ID,
//       }
//       const response = await fetch('/api/usecases/users/assignProxy', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(params),
//       })
//       const { proxy } = await response.json()
//       if (proxy) {
//         setProxy(proxy);
//         setAssigningProxy(false);
//       }
//     }
//   }

//   const loadProxy = async () => {
//     if (session && session.status === 'VERIFIED') {
//       setLoadingProxy(true);

//       const filter = {
//         userId: session._id,
//         chainId: DEFAULT_CHAIN_ID,
//         projectId: PROJECT_ID,
//       }

//       const response = await fetch('/api/usecases/proxies/getProxy', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ filter }),
//       })
//       const { proxy } = await response.json()
//       if (proxy) {
//         setProxy(proxy);
//       } else {
//         assignProxy();
//       }
//       setLoadingProxy(false);
//     }
//   }

//   const verifyUser = async (code) => {
//     if (session) {
//       setVerifying(true)  
//       const response = await fetch('/api/usecases/users/verify', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           user: session,
//           code,
//           projectId: PROJECT_ID,
//           chainId: DEFAULT_CHAIN_ID,
//         }),
//       })
//       const { user } = await response.json()
//       setSession(user);
//       setVerifying(false)
//     }
//   }

//   const redirect = () => {
//     if (session) {
//       if (session?.status === 'PENDING') {
//         if (router.pathname !== '/verify') {
//           router.push('/verify');
//         }
//       } else {
//         if (router.pathname !== '/dashboard') {
//           router.push('/dashboard');
//         }
//       }
//     } else {
//       if (router.pathname !== '/login') {
//         router.push('/login');
//       }
//     }
//   }

//   useEffect(() => {
//     if (session) {
//       localStorage.setItem('session', JSON.stringify(session));
//       loadProxy();
//       redirect();
//     }
//   }, [session]);

//   useEffect(() => {
//     const localSession = JSON.parse(localStorage.getItem('session'));
//     if (localSession && !session) {
//       setSession(localSession);
//     }
//   }, []);

//   const memoizedData = useMemo(
//     () => ({
//       session,
//       proxy,
//       verifying,
//       loggingIn,
//       loadingProxy,
//       assigningProxy,
//       loadProxy,
//       logIn,
//       logOut,
//       verifyUser,
//       redirect,
//     }),
//     [session, proxy, loadingProxy, loggingIn, verifying, assigningProxy]
//   );

//   return <SessionContext.Provider value={memoizedData} {...props} />;
// }

// function useSession() {
//   const context = useContext(SessionContext);
//   if (context === undefined) {
//     throw new Error(
//       `useSessionContext must be used within a SessionContextProvider`
//     );
//   }
//   return context;
// }

// export { SessionProvider, useSession };