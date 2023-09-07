import { HumanProvider } from "@/state/human.context";

export const Providers = ({ children }) => {
  return (
      <HumanProvider>
        {children}
      </HumanProvider>
  );
};
