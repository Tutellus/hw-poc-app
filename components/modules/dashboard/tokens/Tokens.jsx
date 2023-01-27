import { useSession } from "@/state/session.context";
import { useTransactions } from "@/state/transactions.context"
import { ethers } from "ethers"
import { useEffect, useState } from "react"

const TOKEN_ADDRESS = "0xdC588c35a53B81d6B9DeB0995A5582236f89B7a2"
const TOKEN_ABI = [
  "function mint(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
];
const CHAIN_ID = 5

export const Tokens = () => {


  const { session, proxy } = useSession()
  const [minting, setMinting] = useState(false)
  const [balance, setBalance] = useState('0.0')
  const [amount, setAmount] = useState('')
  const { transactions, createTransaction } = useTransactions()

  const [loadingContract, setLoadingContract] = useState(false)
  const [contract, setContract] = useState(null)

  const amountFloat = parseFloat(amount)
  const canMint = !minting && amountFloat !== NaN && amountFloat > 0

  const loadContract = async () => {
    try {
      setLoadingContract(true)
      const filter = {
        address: TOKEN_ADDRESS,
        chainId: CHAIN_ID,
      };
      console.log({filter})
      const response = await fetch('/api/usecases/contracts/getOne', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filter }),
      })
      const { contract: innerContract } = await response.json()
      setContract(innerContract)
      setLoadingContract(false)
    } catch (error) {
      console.error(error)
    }
  }

  const updateContract = async () => {
    try {
      setLoadingContract(true)

      const params = {
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        chainId: CHAIN_ID,
      }
      console.log({params})
      const response = await fetch('/api/usecases/contracts/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
      const { contract: innerContract } = await response.json()
      setContract(innerContract)
      setLoadingContract(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!contract) {
      loadContract()
    }
  }, [contract])

  const getBalance = async () => {
    // const response = await fetch('/api/usecases/proxys/getTokenBalance', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     token: tokenAddress,
    //     user: session
    //   }),
    // })
    // const { balance: innerBalance } = await response.json()
    // setBalance(innerBalance)
  }

  useEffect(() => {
    if (proxy) {
      getBalance()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxy, transactions])

  const mint = async () => {
    // setMinting(true)
    // try {
    //   const rpcUrl = 'https://goerli.infura.io/v3/34208e804a1947cb9e37992a4de47a06';
    //   const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    //   const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
    //   const decimals = 18;
    //   const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
    //   await createTransaction({
    //     contract: tokenContract,
    //     method: 'mint',
    //     args: [proxy.address, amountBN],
    //     value: 0,
    //   })
    // } catch (error) {
    //   console.error(error)
    // }
    // setMinting(false)
    // setAmount('')
  }

  console.log('contract', contract)

  return (
    <div className="box">
      <div className="title">My tokens</div>
      <div className="data">
        <div>{balance}</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          {contract 
            ? <div>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                />
                <button disabled={!canMint} onClick={mint}>
                  {minting ? 'Processing...' : 'Mint'}
                </button>
              </div>
            : <button onClick={updateContract}>Update contract</button>
          }
        </div>
      </div>
    </div>
  )
}