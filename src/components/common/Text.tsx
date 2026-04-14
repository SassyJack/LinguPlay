import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
} from 'react-native';

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
  const variantStyle = getVariantStyle(variant);
  const customStyle = color ? { ...variantStyle, color } : variantStyle;

  return (
    <RNText style={[customStyle, style]} testID={testID} {...props}>
      {children}
    </RNText>
  );
};

const getVariantStyle = (variant: string) => {
  switch (variant) {
    case 'h1':
      return styles.h1;
    case 'h2':
      return styles.h2;
    case 'h3':
      return styles.h3;
    case 'body':
      return styles.body;
    case 'caption':
      return styles.caption;
    default:
      return styles.body;
  }
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginVertical: 8,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginVertical: 6,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginVertical: 4,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 16,
  },
});

export default Text;
