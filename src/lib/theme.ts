export type Theme = "dark" | "light";

export const DARK = {
  bg: "#0D0A07",
  bgDeep: "#100D08",
  card: "#1A1510",
  cardHover: "#221C14",
  border: "#2C241C",
  borderSubtle: "#1E1912",
  primary: "#F0C040",
  primaryText: "#0D0A07",
  danger: "#8B1A4A",
  warn: "#E07828",
  text: "#F5EFE6",
  textMid: "#C8BFB4",
  textMuted: "#7A6E64",
  textFaint: "#4A3A30",
  textGhost: "#2C241C",
  navBg: "#0D0A07",
  navBorder: "#1E1912",
  inputBg: "#100D08",
  success: "#4CAF50",
} as const;

export const LIGHT = {
  bg: "#F7F3EE",
  bgDeep: "#EDE7DF",
  card: "#FFFFFF",
  cardHover: "#F9F6F2",
  border: "#E0D8CF",
  borderSubtle: "#EDE7DF",
  primary: "#C89A10",
  primaryText: "#FFFFFF",
  danger: "#8B1A4A",
  warn: "#C86A10",
  text: "#1A1208",
  textMid: "#3D3020",
  textMuted: "#6B5C48",
  textFaint: "#9E8E7A",
  textGhost: "#C8BFB4",
  navBg: "#FFFFFF",
  navBorder: "#E0D8CF",
  inputBg: "#F7F3EE",
  success: "#2E7D32",
} as const;

export interface Tokens {
  readonly bg: string;
  readonly bgDeep: string;
  readonly card: string;
  readonly cardHover: string;
  readonly border: string;
  readonly borderSubtle: string;
  readonly primary: string;
  readonly primaryText: string;
  readonly danger: string;
  readonly warn: string;
  readonly text: string;
  readonly textMid: string;
  readonly textMuted: string;
  readonly textFaint: string;
  readonly textGhost: string;
  readonly navBg: string;
  readonly navBorder: string;
  readonly inputBg: string;
  readonly success: string;
}
