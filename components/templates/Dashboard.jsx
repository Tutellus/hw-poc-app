import { useSession } from "@/state/session.context";
import { useTransactions } from "@/state/transactions.context";
import { truncateAddress } from "@/utils/address";
import { getExplorerUrl } from "@/utils/explorer";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { TransactionsList } from "../modules/dashboard/transactions/TransactionsList";
import { Web3 } from "../modules/dashboard/web3/Web3";

const tokenAbi = [
  "function mint(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
];

export const Dashboard = () => {

  const { session, did, logOut, loadDid, loadingDid, assigningDid } = useSession();
  const { creatingTransaction, createTransaction } = useTransactions()

  const tokenAddress = "0xdC588c35a53B81d6B9DeB0995A5582236f89B7a2"

  const [balance, setBalance] = useState("0.0")

  const mintTransaction = async () => {
    try {
      const rpcUrl = 'https://goerli.infura.io/v3/34208e804a1947cb9e37992a4de47a06';
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const decimals = 18;
      const amountBN = ethers.utils.parseUnits('5', decimals);
      await createTransaction({
        contract: tokenContract,
        method: 'mint',
        args: [did.address, amountBN],
        value: 0,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const getBalance = async () => {
    const response = await fetch('/api/usecases/dids/getTokenBalance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenAddress,
        user: session
      }),
    })
    const { balance: innerBalance } = await response.json()
    setBalance(innerBalance)
  }

  useEffect(() => {
    if (session && did) {
      getBalance()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [did])

  return (
    <div className="dashboard">
      <div className="grid">
        {/* my email */}
        {session && <div className="box">
          <div className="title">My account</div>
          <div className="data">{session.email}</div>
        </div>}

        {/* my wallet */}
        <div className="box">
          <div className="title">My wallet</div>
          {assigningDid
            ? <div>Assigning wallet...</div>
            : loadingDid
              ? <div>Loading wallet...</div>
              : did
                ? <div
                    className="data"
                    onClick={() => window.open(getExplorerUrl(process.env.CHAIN_ID || 5, 'address', did.address), '_blank')}
                  >{truncateAddress(did.address)}</div>
                : <button onClick={() => loadDid()}>Connect</button>
            }
        </div>

        {/* your tokens */}
        <div className="box">
          <div className="title">My tokens</div>
          <div className="data">
            <div>{balance}</div>
            <button disabled={creatingTransaction} onClick={mintTransaction}>Mint 5 TKN</button>
          </div>
        </div>

        {/* my external wallet */}
        <Web3/>
    
        {/* transactions list */}
        {did && <TransactionsList/>}
        
    </div>
  
    {/* logout */}
    <button style={{
      position: 'absolute',
      bottom: 1,
      right: 1,
      margin: '1rem',
    }} onClick={logOut}>Logout</button>

  </div>
  );
}
