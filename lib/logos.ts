import { icons } from "@/constants/icons";
import type { ImageSourcePropType } from "react-native";

/** Domains that don't match `{brand}.com` */
const DOMAIN_ALIASES: Record<string, string> = {
  "adobe creative cloud": "adobe.com",
  adobe: "adobe.com",
  anthropic: "anthropic.com",
  "apple music": "apple.com",
  "apple tv": "apple.com",
  "apple tv+": "tv.apple.com",
  chatgpt: "openai.com",
  claude: "anthropic.com",
  "claude pro": "anthropic.com",
  "disney+": "disneyplus.com",
  disney: "disneyplus.com",
  "google one": "one.google.com",
  "hbo max": "max.com",
  icloud: "icloud.com",
  "microsoft 365": "microsoft.com",
  "office 365": "microsoft.com",
  openai: "openai.com",
  "paramount+": "paramountplus.com",
  "youtube premium": "youtube.com",
  "youtube music": "music.youtube.com",
};

const guessDomain = (name: string): string => {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return "example.com";

  const alias = DOMAIN_ALIASES[normalized];
  if (alias) return alias;

  for (const [key, domain] of Object.entries(DOMAIN_ALIASES)) {
    if (normalized.startsWith(key)) return domain;
  }

  const slug = normalized
    .replace(/[^a-z0-9\s.-]/g, "")
    .split(/\s+/)
    .find(Boolean);

  return slug ? `${slug}.com` : "example.com";
};

/**
 * Resolve a brand logo from a subscription name.
 * Prefers Logo.dev name lookup (50M+ brands) when
 * EXPO_PUBLIC_LOGO_DEV_TOKEN is set; otherwise uses a
 * free domain-based logo CDN with a guessed domain.
 */
export const getBrandLogoSource = (name: string): ImageSourcePropType => {
  const trimmed = name.trim();
  if (!trimmed) return icons.wallet;

  const token = process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN;

  if (token) {
    const encoded = encodeURIComponent(trimmed);
    return {
      uri: `https://img.logo.dev/name/${encoded}?token=${token}&size=128&format=png&retina=true`,
    };
  }

  const domain = guessDomain(trimmed);
  return {
    uri: `https://logos.hunter.io/${domain}`,
  };
};
