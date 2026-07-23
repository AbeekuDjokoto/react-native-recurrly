import { AuthBrand } from "@/components/AuthBrand";
import { colors } from "@/constants/theme";
import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const posthog = usePostHog();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const isFetching = fetchStatus === "fetching";

  if (!signUp) {
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

  const handleSubmit = async () => {
    posthog?.capture("sign_up_started");

    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      posthog?.capture("sign_up_completed");

      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }
          router.replace("/(tabs)" as Href);
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const needsEmailVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (needsEmailVerification) {
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
              subtitle="Enter the code we sent to your email to finish creating your account."
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
                    posthog?.capture("sign_up_verification_code_resent");
                    signUp.verifications.sendEmailCode();
                  }}
                >
                  <Text className="auth-secondary-button-text">I need a new code</Text>
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
            title="Create account"
            subtitle="Start managing your subscriptions in one place"
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
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                {errors?.fields?.emailAddress && (
                  <Text className="auth-error">{errors.fields.emailAddress.message}</Text>
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
                  onChangeText={setPassword}
                  autoComplete="new-password"
                  textContentType="newPassword"
                />
                {errors?.fields?.password && (
                  <Text className="auth-error">{errors.fields.password.message}</Text>
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
                  <Text className="auth-button-text">Create account</Text>
                )}
              </Pressable>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account? </Text>
                <Link href="/(auth)/sign-in">
                  <Text className="auth-link">Sign in</Text>
                </Link>
              </View>

              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
