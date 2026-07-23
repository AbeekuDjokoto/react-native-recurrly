import "@/global.css";
import { ClerkLoaded, ClerkLoading, ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { colors } from "@/constants/theme";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  PostHogErrorBoundary,
  PostHogProvider,
  usePostHog,
} from "posthog-react-native";
import { posthog } from "@/lib/posthog";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function PostHogIdentity() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user && identifiedUserId.current !== user.id) {
      if (identifiedUserId.current) {
        posthog?.reset();
      }

      posthog?.identify(user.id, {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.fullName ? { name: user.fullName } : {}),
      });
      identifiedUserId.current = user.id;
    } else if (!isSignedIn && identifiedUserId.current) {
      posthog?.reset();
      identifiedUserId.current = null;
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}

function PostHogScreenTracker() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const posthogClient = usePostHog();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!pathname || previousPathname.current === pathname) return;

    posthogClient.screen(pathname, {
      previous_screen: previousPathname.current ?? null,
      ...params,
    });
    previousPathname.current = pathname;
  }, [pathname, params, posthogClient]);

  return null;
}

function AppContent() {
  return (
    <>
      <PostHogIdentity />
      <PostHogScreenTracker />
      <PostHogErrorBoundary
        fallback={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.background,
            }}
          >
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        }
      >
        <Stack screenOptions={{ headerShown: false }} />
      </PostHogErrorBoundary>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoading>
        <LoadingScreen />
      </ClerkLoading>
      <ClerkLoaded>
        {posthog ? (
          <PostHogProvider
            client={posthog}
            autocapture={{
              captureScreens: false,
            }}
          >
            <AppContent />
          </PostHogProvider>
        ) : (
          <Stack screenOptions={{ headerShown: false }} />
        )}
      </ClerkLoaded>
    </ClerkProvider>
  );
}
