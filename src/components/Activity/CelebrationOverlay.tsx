import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '@/components';
import { Theme } from '@/theme';

interface CelebrationOverlayProps {
  visible: boolean;
  type: 'correct' | 'incorrect';
  streak?: number;
  stars?: number;
  theme: Theme;
  onComplete?: () => void;
  testID?: string;
}

const PARTICLE_COLORS = ['#FFD93D', '#4A90D9', '#50C878', '#FF8C42', '#E74C3C', '#9B59B6'];
const PARTICLE_COUNT = 20;

interface ParticleProps {
  index: number;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ index, color }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const delay = index * 30;
    const xDest = (Math.random() - 0.5) * 300;
    const yDest = -200 - Math.random() * 300;
    translateX.value = withDelay(delay, withTiming(xDest, { duration: 800, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withTiming(yDest, { duration: 800, easing: Easing.out(Easing.ease) }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 800 }));
    rotate.value = withDelay(delay, withTiming(Math.random() * 360, { duration: 800 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          width: 8 + Math.random() * 10,
          height: 8 + Math.random() * 10,
          borderRadius: Math.random() > 0.5 ? 50 : 4,
        },
        animatedStyle,
      ]}
    />
  );
};

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  visible,
  type,
  streak = 0,
  stars = 0,
  theme,
  onComplete,
  testID = 'celebration-overlay',
}) => {
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1200, withTiming(0, { duration: 300 }, () => {
          if (onComplete) runOnJS(onComplete)();
        }))
      );
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: overlayOpacity.value > 0 ? 'auto' : ('none' as any),
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} testID={testID} pointerEvents="none">
      {type === 'correct' && (
        <>
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <Particle key={i} index={i} color={PARTICLE_COLORS[i % PARTICLE_COLORS.length]} />
          ))}
          <View style={styles.messageContainer}>
            <Text variant="h1" color="#50C878" style={styles.message}>
              ¡Correcto!
            </Text>
            {stars > 0 && (
              <Text variant="h2" color="#FFD93D" style={styles.stars}>
                {'⭐'.repeat(stars)}
              </Text>
            )}
            {streak >= 3 && (
              <Text variant="body" color="#FF8C42" style={styles.streak}>
                🔥 {streak} seguidos
              </Text>
            )}
          </View>
        </>
      )}
      {type === 'incorrect' && (
        <View style={styles.messageContainer}>
          <Text variant="h1" color="#E74C3C" style={styles.message}>
            Intenta de nuevo
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    bottom: '40%',
  },
  messageContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontWeight: '900',
    textAlign: 'center',
  },
  stars: {
    marginTop: 8,
    textAlign: 'center',
  },
  streak: {
    marginTop: 4,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default CelebrationOverlay;
