import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';
import { useTheme } from '@/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  children: React.ReactNode;
  testID?: string;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  style,
  children,
  testID,
  ...props
}) => {
  const { theme } = useTheme();
  const variantStyle = getVariantStyle(variant, theme.colors.onBackground, theme.colors.onSurface);
  const customStyle = color ? { ...variantStyle, color } : variantStyle;

  return (
    <RNText style={[customStyle, style]} testID={testID} {...props}>
      {children}
    </RNText>
  );
};

const getVariantStyle = (
  variant: string,
  onBackground: string,
  onSurface: string
) => {
  switch (variant) {
    case 'h1':
      return {
        ...styles.h1,
        color: onBackground,
      };
    case 'h2':
      return {
        ...styles.h2,
        color: onBackground,
      };
    case 'h3':
      return {
        ...styles.h3,
        color: onBackground,
      };
    case 'caption':
      return {
        ...styles.caption,
        color: onSurface,
      };
    case 'body':
    default:
      return {
        ...styles.body,
        color: onSurface,
      };
  }
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 8,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 6,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 4,
  },
  body: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default Text;
