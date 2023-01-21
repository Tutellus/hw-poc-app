import { useMainContext } from "@/state/main.context";
import { getExplorerUrl } from "@/utils/explorer";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Transaction } from "../modules/Transactions";

const tokenAbi = [
  "function mint(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
];

export const Dashboard = () => {

  const [processingTx, setProcessingTx] = useState(false)

  const { session, did, logOut, assigningDid, loadingTransactions, transactions, loadTransactions } = useMainContext();

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

  const confirm = async (txId) => {
    await fetch('/api/usecases/txs/confirm', {
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
      getBalance(),
      loadTransactions(),
      getOwnerSafeData()
    ])
  }

  useEffect(() => {
    if (session && did) {
      refresh()
    }
  }, [did])

  return <div>
    <h1>Dashboard</h1>
    {session && <div>{`Email: ${session.email}`}</div>}
    {did && <div>
      <h2>My DID</h2>
      <div>Connected</div>
      <a
        style={{
          color: 'cyan',
        }}
        href={getExplorerUrl(process.env.CHAIN_ID || 5, 'address', did.address)}
        target="_blank"
        rel="noreferrer"
      >{did?.address}</a>
      <div>{`Your balance: ${parseFloat(balance).toFixed(2)} TKN`}</div>
      <h2>Transactions</h2>
        {loadingTransactions && <div>Loading transactions...</div>}
        {ownerSafeData && transactions?.length > 0
          ? transactions.map((tx, index) => <Transaction
            key={index}
            tx={tx}
            abi={tokenAbi}
            ownerSafeData={ownerSafeData}
            confirmFn={confirm}
            executeFn={execute}
            refresh={refresh}
          />)
          : <div>No transactions yet</div>
        }
      <button disabled={processingTx} onClick={() => mintTransaction(did.address, 5)}>Mint 5 TKN</button>
    </div>}
    {!did && <div>
      <h2>My DID</h2>
      <div>Connecting...</div>
    </div>}
    {assigningDid && <div>Assigning DID...</div>}
    <button onClick={logOut}>Logout</button>
  </div>
}
