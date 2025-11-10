import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface SubscriptionContextValue {
  isUserSubscribed: boolean;
  setIsUserSubscribed: Dispatch<SetStateAction<boolean>>;
  showSubscriptionModal: boolean;
  setShowSubscriptionModal: Dispatch<SetStateAction<boolean>>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  return (
    <SubscriptionContext.Provider
      value={{
        isUserSubscribed,
        setIsUserSubscribed,
        showSubscriptionModal,
        setShowSubscriptionModal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }

  return context;
};

