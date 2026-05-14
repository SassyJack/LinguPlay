import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components';
import { Theme } from '@/theme';

interface ChoiceActivityProps {
  options: string[];
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  disabled: boolean;
  theme: Theme;
  testID?: string;
}

const ChoiceActivity: React.FC<ChoiceActivityProps> = ({
  options,
  selectedOption,
  onSelectOption,
  disabled,
  theme,
  testID = 'choice-activity',
}) => {
  return (
    <View testID={testID}>
      <Text
        variant="h3"
        style={{ marginBottom: 12, marginTop: 16 }}
        testID="options-label"
      >
        Opciones:
      </Text>
      {options.map((option: string, index: number) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            {
              backgroundColor:
                selectedOption === option
                  ? theme.colors.primary
                  : theme.colors.surface,
              borderColor:
                selectedOption === option
                  ? theme.colors.primary
                  : theme.colors.gray300 || '#D1D5DB',
              borderWidth: 2,
            },
          ]}
          onPress={() => onSelectOption(option)}
          disabled={disabled}
          testID={`option-${index}`}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Opcion ${index + 1}: ${option}${selectedOption === option ? ' seleccionada' : ''}`}
        >
          <Text
            variant="body"
            style={{ fontWeight: '600' }}
            color={selectedOption === option ? theme.colors.white : theme.colors.onSurface}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
});

export default ChoiceActivity;
