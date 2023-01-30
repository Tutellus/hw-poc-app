import { useSession } from "@/state/session.context";
import { useProposals } from "@/state/proposals.context"
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
  const { transactions, loadProposals, submit } = useProposals()

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
    setMinting(true)
    try {
      const decimals = 18;
      const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
      await submit({
        contractId: contract._id,
        projectId: proxy.projectId,
        method: 'mint',
        params: [proxy.address, amountBN],
        value: 0,
        user: session,
      })
    } catch (error) {
      console.error(error)
    }
    await loadProposals()
    setMinting(false)
    setAmount('')
  }

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
            ? <div style={{
                display: 'flex',
                gap: '8px',
            }}>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                />
                <button
                  disabled={!canMint}
                  onClick={mint}
                >
                  {minting ? 'Processing...' : 'Mint'}
                </button>
              </div>
            : <button
                disabled={loadingContract}
                onClick={updateContract}
              >
                {loadingContract ? 'Loading...' : 'Load contract'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}