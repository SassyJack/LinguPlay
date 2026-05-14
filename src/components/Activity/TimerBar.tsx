import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components';
import { Theme } from '@/theme';

interface TimerBarProps {
  timeLeft: number;
  timeLimit: number | null;
  theme: Theme;
  testID?: string;
}

const TimerBar: React.FC<TimerBarProps> = ({
  timeLeft,
  timeLimit,
  theme,
  testID = 'timer-bar',
}) => {
  if (timeLimit == null) return null;

  const ratio = timeLimit > 0 ? timeLeft / timeLimit : 0;
  const barColor =
    ratio > 0.5 ? theme.colors.success : ratio > 0.25 ? theme.colors.warning : theme.colors.error;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.infoRow}>
        <Text variant="caption" color={theme.colors.onSurface}>
          Tiempo
        </Text>
        <Text
          variant="caption"
          color={ratio > 0.25 ? theme.colors.onSurface : theme.colors.error}
          style={styles.timeText}
        >
          {timeLeft}s
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.gray200 || '#E5E7EB' }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: barColor,
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
  timeText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default TimerBar;
