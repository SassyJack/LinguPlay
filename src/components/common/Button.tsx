import React from 'react';
import { StyleSheet, TouchableOpacity, Text as RNText } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  testID,
}) => {
  const styles = getStyles(variant, disabled);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
    >
      <RNText style={styles.text}>{title}</RNText>
    </TouchableOpacity>
  );
};

const getStyles = (variant: string, disabled: boolean) => {
  const baseButton = {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: disabled ? 0.6 : 1,
  };

  const baseText = {
    fontSize: 16,
    fontWeight: '600' as const,
  };

  switch (variant) {
    case 'primary':
      return StyleSheet.create({
        button: {
          ...baseButton,
          backgroundColor: '#007AFF',
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
          backgroundColor: '#E5E5EA',
        },
        text: {
          ...baseText,
          color: '#000000',
        },
      });

    case 'outline':
      return StyleSheet.create({
        button: {
          ...baseButton,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: '#007AFF',
        },
        text: {
          ...baseText,
          color: '#007AFF',
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
