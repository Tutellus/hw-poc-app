import { useUser } from "@/state/user.context";

export const Account = () => {
  const { user, logout } = useUser();

  return (
    <div className="box">
      <div className="title">My account</div>
      <div className="data">
        {user?.email || "No user"}
        <button onClick={() => logout()}>Logout</button>
      </div>
    </div>
  );
};
