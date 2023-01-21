import { useMainContext } from "@/state/main.context";
import { getExplorerUrl } from "@/utils/explorer";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const tokenAbi = [
  "function mint(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
];

const decodeTransactionData = (abi, data) => {
  try {
    const iface = new ethers.utils.Interface(abi);
    const { name, args } = iface.parseTransaction({ data });
    return `${name}(${args.map((arg) => arg.toString()).join(", ")})`;
  } catch (error) {
    console.log(error)
    return "data";
  }
}

export const Dashboard = () => {

  const [processingTx, setProcessingTx] = useState(false)

  const { session, did, logOut, assigningDid, transactions, loadingTransactions, loadTransactions } = useMainContext();

  const tokenAddress = "0xdC588c35a53B81d6B9DeB0995A5582236f89B7a2"

  const [loadingBalance, setLoadingBalance] = useState(false)
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
    // const privateKey = process.env.PRIVATE_KEY;

    // console.log("rpcUrl", rpcUrl)
    // console.log("privateKey", privateKey)

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    // const signer = new ethers.Wallet(privateKey, provider);
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

  const getBalance = async () => {
    setLoadingBalance(true);
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
    setLoadingBalance(false);
  }

  useEffect(() => {
    if (session && did) {
      getBalance()
      getOwnerSafeData()
    }
  }, [session, did])

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
      {loadingBalance
        ? <div>Loading balance...</div>
        : <div>{`Your balance: ${parseFloat(balance).toFixed(2)} TKN`}</div>
      }
      <h2>Transactions</h2>
      {loadingTransactions && <div>Loading transactions...</div>}
      {!loadingTransactions && ownerSafeData && <div>
        {transactions?.length > 0
          ? transactions.map((tx) =>
          <div key={tx._id}>
            <div>----------------------------</div>
            <a style={{
              color: 'cyan',
            }} href={getExplorerUrl(process.env.CHAIN_ID || 5, 'tx', tx.executionTxHash)} target="_blank" rel="noreferrer">{tx.nonce}</a>
            <div>{tx.status}</div>
            <div>{decodeTransactionData(tokenAbi, tx.originalData)}</div>
            <div>{`Signatures: ${tx.signatures.length} / ${ownerSafeData.threshold}`}</div>
            <div>----------------------------</div>
          </div>
          )
          : <div>No transactions yet</div>
        }
      </div>}
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
