import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components';
import { Theme } from '@/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  currentIndex: number;
  theme: Theme;
  testID?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  currentIndex,
  theme,
  testID = 'progress-bar',
}) => {
  if (total === 0) return null;
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.infoRow}>
        <Text variant="caption" color={theme.colors.onSurface}>
          Progreso del nivel
        </Text>
        <Text variant="caption" color={theme.colors.primary} style={styles.counter}>
          {current} de {total}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.gray200 || '#E5E7EB' }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
              backgroundColor: progress === 100 ? theme.colors.success : theme.colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  counter: {
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ProgressBar;
