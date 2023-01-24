import { useMainContext } from "@/state/main.context";
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

  const [processingTx, setProcessingTx] = useState(false)

  const { session, did, logOut, loadDid, loadingDid, assigningDid, loadingTransactions, transactions, loadTransactions } = useMainContext();

  const tokenAddress = "0xdC588c35a53B81d6B9DeB0995A5582236f89B7a2"

  const [balance, setBalance] = useState("0.0")
  const [ownerSafeData, setOwnerSafeData] = useState(null)

  const getOwnerSafeData = async () => {
    const response = await fetch('/api/usecases/safe/getSafeData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        safe: did.ownerMS
      }),
    })
    const { safeData } = await response.json()
    setOwnerSafeData(safeData)
  }

  const mintTransaction = async (address, amount) => {
    try {
    setProcessingTx(true)
    const rpcUrl = 'https://goerli.infura.io/v3/34208e804a1947cb9e37992a4de47a06';
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
    const decimals = await tokenContract.decimals();
    const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
    const estimateGas = await tokenContract.estimateGas.mint(address, amountBN);
    const encodedData = tokenContract.interface.encodeFunctionData("mint", [
      address,
      amountBN,
    ]);

    const response = await fetch('/api/usecases/txs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: session,
        destination: tokenAddress,
        data: encodedData,
        value: 0,
        gas: estimateGas,
      }),
    })
    const { tx } = await response.json()
    loadTransactions()
    setProcessingTx(false)
    } catch (error) {
      console.log(error)
      setProcessingTx(false)
    }
  }

  const confirmByCode = async (txId, code) => {
    await fetch('/api/usecases/txs/confirmByCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: session,
        txId,
        code,
      }),
    })
    await refresh()
  }

  const execute = async (txId) => {
    await fetch('/api/usecases/txs/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: session,
        txId
      }),
    })
    await refresh()
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

  const refresh = async () => {
    await Promise.all([
      loadDid(),
    ])
  }

  useEffect(() => {
    if (session && did) {
      getBalance()
      loadTransactions()
      getOwnerSafeData()
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
            <button disabled={processingTx} onClick={() => mintTransaction(did.address, 5)}>Mint 5 TKN</button>
          </div>
        </div>

        {/* my external wallet */}
        <Web3
          refresh={refresh}
        />
    
        {/* transactions list */}
        {did && <TransactionsList
          ownerSafeData={ownerSafeData}
          loadingTransactions={loadingTransactions}
          transactions={transactions}
          confirmFn={confirmByCode}
          executeFn={execute}
        />}
        
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
