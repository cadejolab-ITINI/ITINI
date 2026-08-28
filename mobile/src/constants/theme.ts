import type { TextStyle } from 'react-native';

export const colors = {
  background: '#07111F',
  backgroundSoft: '#0A1727',
  surface: '#102238',
  surfaceRaised: '#17304A',
  border: '#24435D',
  text: '#F7FAFC',
  textMuted: '#A9BDCC',
  emerald: '#13B86D',
  emeraldDark: '#07834B',
  sky: '#1475D1',
  orange: '#F59D1D',
  amber: '#F7B731',
  danger: '#E5484D',
  dangerDark: '#A91D2A',
  white: '#FFFFFF',
  black: '#020617',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

export const shadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.24,
  shadowRadius: 20,
  elevation: 8,
} as const;

export const font = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const textStyles: Record<'title' | 'headline' | 'body' | 'caption', TextStyle> = {
  title: { fontFamily: font.black, fontSize: 28, lineHeight: 34, color: colors.text },
  headline: { fontFamily: font.extraBold, fontSize: 20, lineHeight: 26, color: colors.text },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 23, color: colors.text },
  caption: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.textMuted },
};
