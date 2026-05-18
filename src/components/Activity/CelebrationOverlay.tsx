import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components';
import { Theme } from '@/theme';

interface CelebrationOverlayProps {
  visible: boolean;
  type: 'correct' | 'incorrect';
  streak?: number;
  stars?: number;
  reward?: number;
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
  const x = (Math.random() - 0.5) * 260;
  const y = -120 - Math.random() * 200;
  const size = 6 + Math.random() * 12;
  const rotation = Math.random() * 360;

  return (
    <View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: Math.random() > 0.5 ? 50 : 4,
          transform: [
            { translateX: x },
            { translateY: y },
            { rotate: `${rotation}deg` },
          ],
        },
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
  testID = 'celebration-overlay',
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.1)' }]} testID={testID} pointerEvents="none">
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
    </View>
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
