import { AuthBrand } from "@/components/AuthBrand";
import { colors } from "@/constants/theme";
import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const posthog = usePostHog();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";
  const passwordError =
    formError ?? errors?.fields?.password?.message ?? null;

  if (!signIn) {
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

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }

        posthog?.capture("sign_in_completed");

        const url = decorateUrl("/(tabs)");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.replace(url as Href);
        }
      },
    });
  };

  const handleSubmit = async () => {
    setFormError(null);
    posthog?.capture("sign_in_attempt_submitted");

    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      const message =
        error.errors?.[0]?.longMessage ||
        error.errors?.[0]?.message ||
        "Unable to sign in. Please try again.";
      setFormError(message);
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
    } else if (signIn.status === "needs_second_factor") {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      posthog?.capture("sign_in_verification_completed");
      await finalizeSignIn();
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          className="auth-screen"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="auth-scroll"
            contentContainerClassName="auth-content"
            keyboardShouldPersistTaps="handled"
          >
            <AuthBrand
              title="Verify your account"
              subtitle="Enter the code we sent to your email to finish signing in."
            />

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className="auth-input"
                    value={code}
                    placeholder="Enter your verification code"
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    autoComplete="one-time-code"
                  />
                  {errors?.fields?.code && (
                    <Text className="auth-error">{errors.fields.code.message}</Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${isFetching ? "auth-button-disabled" : ""}`}
                  onPress={handleVerify}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="auth-button-text">Verify</Text>
                  )}
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => {
                    posthog?.capture("sign_in_verification_code_resent");
                    signIn.mfa.sendEmailCode();
                  }}
                >
                  <Text className="auth-secondary-button-text">I need a new code</Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button"
                  onPress={() => {
                    posthog?.capture("sign_in_restart_selected");
                    signIn.reset();
                  }}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <AuthBrand
            title="Welcome back"
            subtitle="Sign in to continue managing your subscriptions"
          />

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  className="auth-input"
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.mutedForeground}
                  onChangeText={(value) => {
                    setFormError(null);
                    setEmailAddress(value);
                  }}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                {errors?.fields?.identifier && (
                  <Text className="auth-error">{errors.fields.identifier.message}</Text>
                )}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <TextInput
                  className="auth-input"
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry
                  onChangeText={(value) => {
                    setFormError(null);
                    setPassword(value);
                  }}
                  autoComplete="password"
                  textContentType="password"
                />
                {passwordError && (
                  <Text className="auth-error">{passwordError}</Text>
                )}
              </View>

              <Pressable
                className={`auth-button ${
                  !emailAddress || !password || isFetching ? "auth-button-disabled" : ""
                }`}
                onPress={handleSubmit}
                disabled={!emailAddress || !password || isFetching}
              >
                {isFetching ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="auth-button-text">Sign in</Text>
                )}
              </Pressable>

              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly? </Text>
                <Link href="/(auth)/sign-up">
                  <Text className="auth-link">Create an account</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
