import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const isConfigured = Boolean(projectToken && host);

if (__DEV__ && !isConfigured) {
  throw new Error(
    "EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN or EXPO_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once the PostHog variables are configured",
  );
}

export const posthog = isConfigured
  ? new PostHog(projectToken!, {
      host,
      captureAppLifecycleEvents: true,
    })
  : null;
