# PostHog setup report

PostHog product analytics, Clerk-based user identity, React error tracking, and a starter dashboard were added to the Expo Router app.

## Installed and initialized

- Added `posthog-react-native` (`^4.7.0`, resolved during installation to 4.59.0) and `react-native-svg` (`~15.12.1`) to the project dependencies; installation updated `package-lock.json`.
- Initialized one environment-backed client in `lib/posthog.ts` using `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST`, with app lifecycle capture enabled.
- Added the environment variable names to `.env.example`; the real values were configured in the local `.env` through wizard tools.
- Configured builds provide the singleton client through `PostHogProvider` in `app/_layout.tsx`. Production builds without configuration render the original app stack without a PostHog provider; development configuration failures remain loud so missing analytics configuration is not silent.

## Events instrumented

These are instrumented call sites, not verified deliveries. The run did not start the app or observe events arriving in PostHog.

| Event | What it measures | File |
|---|---|---|
| `sign_in_attempt_submitted` | User submits password sign-in credentials. | `app/(auth)/sign-in.tsx` |
| `sign_in_completed` | User completes password sign-in and session finalization. | `app/(auth)/sign-in.tsx` |
| `sign_in_verification_completed` | User completes email-code verification for trusted-device sign-in. | `app/(auth)/sign-in.tsx` |
| `sign_in_verification_code_resent` | User requests another sign-in verification code. | `app/(auth)/sign-in.tsx` |
| `sign_in_restart_selected` | User restarts the sign-in flow during verification. | `app/(auth)/sign-in.tsx` |
| `sign_up_started` | User submits account-creation credentials and starts verification. | `app/(auth)/sign-up.tsx` |
| `sign_up_completed` | User completes email verification and account finalization. | `app/(auth)/sign-up.tsx` |
| `sign_up_verification_code_resent` | User requests another account-verification code. | `app/(auth)/sign-up.tsx` |
| `subscription_details_toggled` | User expands or collapses a subscription card to inspect details. | `app/(tabs)/index.tsx` |
| `tab_selected` | Authenticated user selects a primary navigation tab. | `app/(tabs)/_layout.tsx` |
| `user_logged_out` | Authenticated user initiates sign-out from settings. | `app/(tabs)/settings.tsx` |

All 11 captures use `usePostHog()` and avoid raw authentication or person PII in event properties. The dashboard insights use these exact event names, but their current data volume was not verified.

## User identification

Identification was wired, not skipped. `app/_layout.tsx` observes Clerk authentication, identifies authenticated users with Clerk's stable `user.id`, and sends email/name as person properties rather than event properties. It resets PostHog on logout and before an account switch. No additional per-event identity calls are required. The run did not verify identity or event attribution in a live app session.

## Error tracking

`PostHogErrorBoundary` was mounted around the Expo Router stack inside the configured PostHog provider in `app/_layout.tsx`, with the app's minimal loading-style fallback. This statically verified the SDK boundary shape; no runtime exception was generated or observed in PostHog.

## Verification and conflicts

- Dependency installation completed successfully with npm and added 16 packages.
- `npm run lint` completed with 0 errors and two pre-existing warnings for the existing `clsx` default-import convention in `app/(tabs)/_layout.tsx` and `components/SubscriptionCard.tsx`.
- Type checking (`npx tsc --noEmit`) reported no errors in the active PostHog-integrated app files, but project-wide checking remains blocked by pre-existing errors in the stale `app-example/` directory (missing components/hooks and obsolete theme exports).
- No build script exists, so a production/native build was not run. Tests were not run. Native device startup and live event delivery were not verified.
- Clerk peer-dependency warnings and npm's 28 moderate audit findings were reported during installation; neither was attributed to PostHog.

## Dashboard

[Analytics basics (wizard)](https://us.posthog.com/project/520353/dashboard/1893926)

The dashboard contains four saved wizard-tagged insight tiles: sign-up conversion, authentication activity, navigation engagement, and subscription-detail engagement. It is ready to populate once the app emits events.

## Open issues and user follow-up

1. **Live delivery and attribution are unresolved.** The run verified source call sites, SDK exports, installation, and linting, but did not launch the app or observe events, identity, exceptions, or batches arriving in PostHog. Without this check, analytics completeness and Clerk attribution remain unconfirmed.
2. **Project-wide type checking remains unresolved.** Existing `app-example/` errors prevent a clean repository-wide TypeScript result; leaving them alone can obscure future integration regressions.
3. **Native release behavior remains unverified.** Expo/iOS/Android startup and production builds were not attempted, so environment embedding and runtime SDK behavior still require confirmation.

## Before you merge

- [ ] Run a full production/native build and confirm the configured and production-no-config paths in `lib/posthog.ts` and `app/_layout.tsx` (especially the PostHog initialization/provider branches); fix any integration-generated build or type errors.
- [ ] Run the test suite and update mocks or fixtures for the capture and identity call sites in `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/settings.tsx`, and `app/_layout.tsx`.
- [ ] Confirm `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST` from `.env.example` are configured in every deployment environment, not only local `.env` (which is not a source-controlled deployment configuration).
- [ ] Exercise sign-in, sign-up, subscription details, tab navigation, and logout, then confirm the 11 named events and Clerk user attribution arrive in PostHog; also trigger a rendering error to verify the boundary.
- [ ] Resolve or explicitly exclude the pre-existing `app-example/` TypeScript errors before relying on a repository-wide typecheck.
