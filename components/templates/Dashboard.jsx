import { Web3 } from "../modules/dashboard/web3/Web3";
import { Tokens } from "../modules/dashboard/tokens/Tokens";
import { Proxy } from "../modules/dashboard/proxy/Proxy";
import { Account } from "../modules/dashboard/account/Account";
import { Proposals } from "../modules/dashboard/proposals/Proposals";

export const Dashboard = () => {
  return (
    <div className="dashboard">
        {/* my email */}
        {<Account/>}

        {/* my wallet */}
        <Proxy/>

        {/* your tokens */}
        <Tokens/>

        {/* my external wallet */}
        <Web3/>
    
        {/* owner proposals list */}
        {<Proposals/>}
        
  </div>
  );
}
