import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const posthog = usePostHog();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
      <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
        {user?.primaryEmailAddress?.emailAddress}
      </Text>

      <View className="mt-8">
        <Pressable
          className="items-center rounded-2xl border border-destructive/20 bg-destructive/10 py-4"
          onPress={() => {
            posthog?.capture("user_logged_out");
            signOut();
          }}
        >
          <Text className="text-base font-sans-bold text-destructive">
            Log out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
