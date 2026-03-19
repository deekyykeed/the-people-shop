import { useColorScheme } from 'react-native';

// ── Claude.ai Design Tokens ────────────────────────────────────────────────────
// Hex values resolved from the Claude.ai CSS HSL variables.

const light = {
  // Backgrounds — warm cream scale
  bg000: '#FFFFFF',
  bg100: '#FAF9F5',   // hsl(48 33.3% 97.1%) — main page bg
  bg200: '#F2EFE7',   // hsl(53 28.6% 94.5%)
  bg300: '#EDEAE0',   // hsl(48 25% 92.2%)   — hover
  bg400: '#E5E1D5',   // hsl(50 20.7% 88.6%) — pressed

  // Text — warm near-black
  text000: '#141413', // hsl(60 2.6%  7.6%)  — primary
  text200: '#3C3C3A', // hsl(60 2.5% 23.3%)  — secondary
  text400: '#737270', // hsl(51 3.1% 43.7%)  — muted / placeholder

  // Borders — dark (Claude light-mode uses near-black borders)
  border100: '#1F1E1C',             // full border
  borderSubtle: 'rgba(31,30,28,0.15)', // subtle ring

  // Brand — terracotta
  brand200: '#D97757', // hsl(15 63.1% 59.6%) — primary action
  brand000: '#C4643D', // hsl(15 54.2% 51.2%) — darker

  // Semantic
  warning000: '#7A4A0A',  // hsl(45 91.8% 19%)
  warningBg:  '#F4EDDE',  // hsl(38 65.9% 92%)
  danger000:  '#923030',  // hsl(0 58.6% 34.1%)
  success000: '#1A6E0A',  // hsl(103 72.3% 26.9%)

  // On-color (text on brand/colored bg)
  onColor: '#FFFFFF',

  // Always
  alwaysWhite: '#FFFFFF',
  alwaysBlack: '#000000',
};

const dark = {
  // Backgrounds — warm dark scale (confirmed computed values)
  bg000: '#30302E', // card / input surface
  bg100: '#262624', // main page bg / sidebar
  bg200: '#1F1E1D', // deeper surface
  bg300: '#141413', // hover / pressed
  bg400: '#000000', // darkest

  // Text — warm light scale
  text000: '#FAF9F5', // primary
  text200: '#C2C0B6', // secondary
  text400: '#9C9A92', // muted / placeholder

  // Borders — light on dark
  border100: '#DEDCD1',                  // full border
  borderSubtle: 'rgba(222,220,209,0.15)', // subtle ring

  // Brand — terracotta (same in both modes)
  brand200: '#D97757',
  brand000: '#C4643D',

  // Semantic
  warning000: '#D4950D', // hsl(40 71% 50%)
  warningBg:  '#4B3902', // hsl(45 94.8% 15.1%)
  danger000:  '#FE8181', // hsl(0 98.4% 75.1%)
  success000: '#65BB30', // hsl(97 59.1% 46.1%)

  // On-color
  onColor: '#FFFFFF',

  alwaysWhite: '#FFFFFF',
  alwaysBlack: '#000000',
};

export type Theme = typeof light;

export const themes = { light, dark };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
