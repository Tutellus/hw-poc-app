import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/state/user.context";
import { Human } from "../modules/dashboard/human/Human";
import { Account } from "../modules/dashboard/account/Account";
import { Tokens } from "../modules/dashboard/tokens/Tokens";
import { Contract } from "../modules/dashboard/contract/Contract";
import { ProposalsList } from "../modules/dashboard/proposals/ProposalsList";

export const Dashboard = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="dashboard">
      {/* my email */}
      <Account />

      {/* my wallet */}
      <Human />

      {/* your tokens */}
      <Tokens />

      {/* your contract */}
      <Contract />

      {/* owner proposals list */}
      <ProposalsList />
    </div>
  );
};
