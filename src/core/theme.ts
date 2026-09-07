export type ThemeColors = {
  purple: string;
  purpleDeep: string;
  ink: string; // fixed dark text for bright accent buttons (gold/mint) — does NOT flip with theme
  text: string; // primary text on adaptive surfaces (cloud/white) — flips with theme
  gold: string;
  goldShadow: string;
  mint: string;
  mintDeep: string;
  coral: string;
  coralDeep: string;
  cloud: string;
  white: string;
  lavender: string;
  line: string;
  muted: string;
};

export const lightColors: ThemeColors = {
  purple: '#6A5ACD',
  purpleDeep: '#4B3F9B',
  ink: '#251D42',
  text: '#251D42',
  gold: '#FFD700',
  goldShadow: '#C79E00',
  mint: '#54E6A8',
  mintDeep: '#239B69',
  coral: '#FF7A8A',
  coralDeep: '#D9576A',
  cloud: '#F7F5FF',
  white: '#FFFFFF',
  lavender: '#E7E2FF',
  line: '#D9D3F5',
  muted: '#8983A5',
};

export const darkColors: ThemeColors = {
  purple: '#8477E8',
  purpleDeep: '#5A4DC4',
  ink: '#251D42',
  text: '#F1EEFF',
  gold: '#FFD700',
  goldShadow: '#C79E00',
  mint: '#54E6A8',
  mintDeep: '#239B69',
  coral: '#FF7A8A',
  coralDeep: '#D9576A',
  cloud: '#14101F',
  white: '#231C3B',
  lavender: '#241E44',
  line: '#372F58',
  muted: '#A69FC4',
};

// Backward-compat alias — files not yet migrated to useTheme() keep compiling
// and just render in light mode until you convert them.
export const colors = lightColors;

export const sectionLabel = (section: 'MATH' | 'READING_WRITING') =>
  section === 'MATH' ? 'Math' : 'Reading & Writing';