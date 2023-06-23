/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";

const UserContext = createContext({
  user: null,
  web3Provider: null,
  web3Address: null,
  accessToken: null,
  login: () => {},
  logout: () => {},
});

function UserProvider(props) {
  const [user, setUser] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [web3Address, setWeb3Address] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const login = async () => {
    console.log("login");
  };

  const logout = async () => {
    console.log("logout");
  };

  const memoizedData = useMemo(
    () => ({
      user,
      web3Provider,
      web3Address,
      accessToken,
      loggedIn,
      login,
      logout,
    }),
    [web3Provider, web3Address, user, loggedIn]
  );

  return <UserContext.Provider value={memoizedData} {...props} />;
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider`);
  }
  return context;
}

export { UserProvider, useUser };
