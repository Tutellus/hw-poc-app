import { useMainContext } from "@/state/main.context";
import { truncateAddress } from "@/utils/address";
import { getExplorerUrl } from "@/utils/explorer";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Transaction } from "../modules/Transaction";
import { useConnectWallet } from "@web3-onboard/react"

const tokenAbi = [
  "function mint(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
];

export const Dashboard = () => {

  const [processingTx, setProcessingTx] = useState(false)
  const [requestingWallet, setRequestingWallet] = useState(false)

  const { session, did, logOut, loadDid, loadingDid, assigningDid, loadingTransactions, transactions, loadTransactions } = useMainContext();

  const [{ wallet }, connect] = useConnectWallet();
  const [web3Address, setWeb3Address] = useState(null)

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
      getBalance(),
      loadTransactions(),
      getOwnerSafeData()
    ])
  }

  const requestWallet = async () => {
    if (wallet) {
      setRequestingWallet(true)
      const web3provider = new ethers.providers.Web3Provider(wallet.provider)
      const signer = web3provider.getSigner()
      const message = `I am the owner of this account ${session.email} and this wallet ${web3Address} and I want to add this wallet to my shared wallet`
      const signature = await signer.signMessage(message);
      await fetch('/api/usecases/dids/requestAddOwner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          signature,
          user: session,
        }),
      })
      refresh()
      setRequestingWallet(false)
    }
  }

  useEffect(() => {
    if (session && did) {
      refresh()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [did])

  useEffect(() => {
    if (wallet) {
      const firstAddress = wallet.accounts[0].address
      if (firstAddress) {
        setWeb3Address(firstAddress)
      }
    }
  }, [wallet])

  console.log('did', did)

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
        <div className="box">
          <div className="title">My external wallet</div>
          {web3Address ? <div className="data">
            <div> {truncateAddress(web3Address)}</div>
            <button disabled={requestingWallet} onClick={() => requestWallet()}>Request ownership</button>
          </div>
            : <button onClick={() => connect()}>Connect</button>
          }
          
        </div>
          
        {/* transactions list */}
        {did && <div className="box"
          style={{
            gridColumn: '1 / 3',
          }} 
        >
          <div className="title">Transactions</div>
          {loadingTransactions ? <div>Loading transactions...</div>
            :  ownerSafeData && transactions?.length > 0
              ? <div className="transactions">
                {transactions.map((tx, index) => <Transaction
                  key={index}
                  tx={tx}
                  abi={tokenAbi}
                  ownerSafeData={ownerSafeData}
                  confirmFn={confirmByCode}
                  executeFn={execute}
                  refresh={refresh}
                />)}
              </div>
              : <div>No transactions yet</div>
          }
      </div>}
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
