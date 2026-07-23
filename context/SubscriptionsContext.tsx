import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import React, { createContext, useCallback, useContext, useState } from "react";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  cancelSubscription: (id: string) => void;
  isCancellingSubscription: (id: string) => boolean;
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
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(
    () => new Set(),
  );

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((current) => [subscription, ...current]);
  };

  const cancelSubscription = useCallback((id: string) => {
    setCancellingIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.id === id
          ? { ...subscription, status: "cancelled" }
          : subscription,
      ),
    );

    setCancellingIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, []);

  const isCancellingSubscription = useCallback(
    (id: string) => cancellingIds.has(id),
    [cancellingIds],
  );

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        cancelSubscription,
        isCancellingSubscription,
      }}
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
