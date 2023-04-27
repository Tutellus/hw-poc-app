import { Human } from "../modules/dashboard/human/Human";
import { Account } from "../modules/dashboard/account/Account";
import { Tokens } from "../modules/dashboard/tokens/Tokens";
import { Contract } from "../modules/dashboard/contract/Contract";

export const Dashboard = () => {
  return (
    <div className="dashboard">
        {/* my email */}
        {<Account/>}

        {/* my wallet */}
        <Human/>

        {/* your contract */}
        <Contract/>

        {/* your tokens */}
        <Tokens/>

        {/* my external wallet */}
        {/* <Web3/> */}
    
        {/* owner proposals list */}
        {/* {<Proposals/>} */}
        
  </div>
  );
}
