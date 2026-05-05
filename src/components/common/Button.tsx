import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text as RNText,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  testID,
  style,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(variant, disabled, theme);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
    >
      <RNText style={styles.text}>{title}</RNText>
    </TouchableOpacity>
  );
};

const getStyles = (variant: string, disabled: boolean, theme: any) => {
  const baseButton = {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: disabled ? 0.6 : 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  };

  const baseText = {
    fontSize: 20,
    fontWeight: '800' as const,
  };

  switch (variant) {
    case 'primary':
      return StyleSheet.create({
        button: {
          ...baseButton,
          backgroundColor: theme.colors.primary,
        },
        text: {
          ...baseText,
          color: '#FFFFFF',
        },
      });

    case 'secondary':
      return StyleSheet.create({
        button: {
          ...baseButton,
          backgroundColor: theme.colors.accent,
        },
        text: {
          ...baseText,
          color: '#FFFFFF',
        },
      });

    case 'outline':
      return StyleSheet.create({
        button: {
          ...baseButton,
          backgroundColor: 'transparent',
          borderWidth: 3,
          borderColor: theme.colors.primary,
          shadowOpacity: 0,
          elevation: 0,
        },
        text: {
          ...baseText,
          color: theme.colors.primary,
        },
      });

    default:
      return StyleSheet.create({
        button: baseButton,
        text: baseText,
      });
  }
};

export default Button;
