import { useSession } from "@/state/session.context";

import { TransactionsList } from "../modules/dashboard/transactions/TransactionsList";
import { Web3 } from "../modules/dashboard/web3/Web3";
import { Tokens } from "../modules/dashboard/tokens/Tokens";
import { Wallet } from "../modules/dashboard/wallet/Wallet";
import { Account } from "../modules/dashboard/account/Account";

export const Dashboard = () => {

  const { logOut } = useSession();

  return (
    <div className="dashboard">
      <div className="grid">

        {/* my email */}
        {<Account/>}

        {/* my wallet */}
        <Wallet/>

        {/* your tokens */}
        <Tokens/>

        {/* my external wallet */}
        <Web3/>
    
        {/* transactions list */}
        {<TransactionsList/>}
        
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
