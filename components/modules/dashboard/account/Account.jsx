import { useSession, signOut } from "next-auth/react";
import { Button } from "@tutellus/tutellus-components/lib/components/atoms/button";

export const Account = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="box">
      <div className="title">My account</div>
      <div className="data">
        {user?.email || "No user"}
        <Button onClick={() => signOut()}>Logout</Button>
      </div>
    </div>
  );
};
