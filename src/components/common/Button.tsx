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
    fontSize: 18, // Aumentado de 16
    fontWeight: '700' as const, // Aumentado de 600
  };

  switch (variant) {
    case 'primary':
      return StyleSheet.create({
        button: {
          ...baseButton,
          backgroundColor: '#0051D5', // Un azul un poco más oscuro para mejor contraste con texto blanco
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
          backgroundColor: '#E5E7EB', // Gris más claro de la paleta
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
          borderWidth: 2, // Aumentado de 1 para visibilidad
          borderColor: '#0051D5',
        },
        text: {
          ...baseText,
          color: '#0051D5',
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
