import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Human } from "../modules/dashboard/human/Human";
import { Account } from "../modules/dashboard/account/Account";
import { Tokens } from "../modules/dashboard/tokens/Tokens";
import { ProposalsList } from "../modules/dashboard/proposals/ProposalsList";

export const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="dashboard">
      {/* my email */}
      <Account />

      {/* my wallet */}
      <Human />

      {/* your tokens */}
      <Tokens />

      {/* owner proposals list */}
      <ProposalsList />
    </div>
  );
};
