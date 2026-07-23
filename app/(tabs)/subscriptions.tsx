import SubscriptionCard from "@/components/SubscriptionCard";
import { icons } from "@/constants/icons";
import { colors, components } from "@/constants/theme";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const Subscriptions = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return subscriptions;

    return subscriptions.filter((subscription) => {
      const haystack = [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.billing,
        subscription.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, subscriptions]);

  const listBottomPadding =
    keyboardHeight > 0
      ? keyboardHeight + 16
      : components.tabBar.height +
        Math.max(insets.bottom, components.tabBar.horizontalInset) +
        24;

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <View className="flex-1 px-5 pt-2">
          <View className="subscriptions-header">
            <Pressable
              className="subscriptions-header-btn"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)");
                }
              }}
            >
              <Image
                source={icons.back}
                className="subscriptions-header-icon"
                resizeMode="contain"
              />
            </Pressable>

            <Text className="subscriptions-title">My Subscriptions</Text>

            <Pressable className="subscriptions-header-btn">
              <Image
                source={icons.menu}
                className="subscriptions-header-icon"
                resizeMode="contain"
              />
            </Pressable>
          </View>

          <TextInput
            className="subscriptions-search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search subscriptions"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />

          <FlatList
            data={filteredSubscriptions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: listBottomPadding }}
            extraData={expandedSubscriptionId}
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListEmptyComponent={
              <Text className="home-empty-state">
                {query.trim()
                  ? "No subscriptions match your search"
                  : "No subscriptions found"}
              </Text>
            }
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => {
                  const isExpanding = expandedSubscriptionId !== item.id;
                  posthog.capture("subscription_details_toggled", {
                    subscription_id: item.id,
                    ...(item.category
                      ? { subscription_category: item.category }
                      : {}),
                    ...(item.status
                      ? { subscription_status: item.status }
                      : {}),
                    state: isExpanding ? "expanded" : "collapsed",
                    source: "subscriptions_list",
                  });
                  setExpandedSubscriptionId(isExpanding ? item.id : null);
                }}
                onCancelPress={() => {
                  posthog.capture("subscription_cancel_tapped", {
                    subscription_id: item.id,
                    ...(item.status
                      ? { subscription_status: item.status }
                      : {}),
                  });
                }}
              />
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
