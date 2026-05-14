import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text } from '@/components';
import { Theme } from '@/theme';

interface StreakBadgeProps {
  streak: number;
  theme: Theme;
  testID?: string;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  theme,
  testID = 'streak-badge',
}) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (streak > 0) {
      scale.value = withSpring(1, { damping: 8, stiffness: 150 });
    } else {
      scale.value = 0;
    }
  }, [streak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (streak === 0) return null;

  return (
    <Animated.View
      style={[styles.badge, { backgroundColor: '#FF8C42' }, animatedStyle]}
      testID={testID}
    >
      <Text variant="caption" color="#FFFFFF" style={styles.text}>
        🔥 {streak}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '800',
  },
});

export default StreakBadge;
