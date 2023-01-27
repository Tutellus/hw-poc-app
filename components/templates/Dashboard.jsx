import { TransactionsList } from "../modules/dashboard/transactions/TransactionsList";
import { Web3 } from "../modules/dashboard/web3/Web3";
import { Tokens } from "../modules/dashboard/tokens/Tokens";
import { Proxy } from "../modules/dashboard/proxy/Proxy";
import { Account } from "../modules/dashboard/account/Account";

export const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="grid">

        {/* my email */}
        {<Account/>}

        {/* my wallet */}
        <Proxy/>

        {/* your tokens */}
        <Tokens/>

        {/* my external wallet */}
        <Web3/>
    
        {/* transactions list */}
        {<TransactionsList/>}
        
    </div>
  
  </div>
  );
}
