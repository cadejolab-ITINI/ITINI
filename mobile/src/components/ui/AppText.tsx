import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, font } from '@/constants/theme';

type Variant = 'title' | 'headline' | 'subheading' | 'body' | 'caption' | 'label';

const variants: Record<Variant, TextStyle> = {
  title: { fontFamily: font.black, fontSize: 28, lineHeight: 34, color: colors.text },
  headline: { fontFamily: font.extraBold, fontSize: 21, lineHeight: 27, color: colors.text },
  subheading: { fontFamily: font.bold, fontSize: 17, lineHeight: 22, color: colors.text },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 23, color: colors.text },
  caption: { fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  label: { fontFamily: font.extraBold, fontSize: 12, lineHeight: 16, color: colors.text, letterSpacing: 0.4 },
};

export function AppText({ style, ...props }: TextProps & { variant?: Variant }) {
  const { variant = 'body', ...textProps } = props;
  return <Text {...textProps} style={[variants[variant], style]} allowFontScaling maxFontSizeMultiplier={1.5} />;
}
