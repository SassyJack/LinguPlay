import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/components';
import { Theme } from '@/theme';

interface OrderActivityProps {
  bank: string[];
  sequenceAnswer: string[];
  onPressBankItem: (item: string) => void;
  onRemoveSequenceItem: (index: number) => void;
  disabled: boolean;
  theme: Theme;
  testID?: string;
}

const OrderActivity: React.FC<OrderActivityProps> = ({
  bank,
  sequenceAnswer,
  onPressBankItem,
  onRemoveSequenceItem,
  disabled,
  theme,
  testID = 'order-activity',
}) => {
  const countInBank = (item: string) => bank.filter((b: string) => b === item).length;
  const countInAnswer = (item: string) => sequenceAnswer.filter((s: string) => s === item).length;

  return (
    <View testID={testID}>
      <Text variant="h3" style={{ marginBottom: 12, marginTop: 16 }}>
        Tu respuesta:
      </Text>
      <View style={styles.sequenceContainer}>
        {sequenceAnswer.map((item: string, index: number) => (
          <TouchableOpacity
            key={`seq-${index}`}
            style={[styles.sequenceItem, { backgroundColor: theme.colors.primary }]}
            onPress={() => onRemoveSequenceItem(index)}
            disabled={disabled}
          >
            <Text variant="body" color={theme.colors.white}>{item}</Text>
          </TouchableOpacity>
        ))}
        {sequenceAnswer.length === 0 ? (
          <Text variant="caption" color={theme.colors.gray500 || '#9CA3AF'}>
            Toca los elementos de abajo para ordenarlos
          </Text>
        ) : null}
      </View>

      <Text variant="h3" style={{ marginBottom: 12, marginTop: 24 }}>
        Elementos:
      </Text>
      <View style={styles.bankContainer}>
        {bank.map((item: string, index: number) => {
          const availableCount = countInBank(item);
          const selectedCount = countInAnswer(item);
          return (
            <TouchableOpacity
              key={`bank-${index}`}
              style={[
                styles.bankItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primary,
                  opacity: selectedCount >= availableCount ? 0.5 : 1,
                },
              ]}
              onPress={() => onPressBankItem(item)}
              disabled={disabled || selectedCount >= availableCount}
            >
              <Text variant="body" color={theme.colors.onBackground}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    minHeight: 60,
    alignItems: 'center',
    gap: 8,
  },
  sequenceItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bankItem: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default OrderActivity;
