import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import React, { createContext, useContext, useState } from "react";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null,
);

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((current) => [subscription, ...current]);
  };

  return (
    <SubscriptionsContext.Provider
      value={{ subscriptions, addSubscription }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return context;
}
