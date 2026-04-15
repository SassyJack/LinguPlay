import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

/**
 * Animation Service
 * Provides reusable animation utilities for transitions and interactions
 */

/**
 * Spring animation preset
 */
export const springConfig = {
  damping: 10,
  mass: 1,
  overshootClamping: false,
};

/**
 * Timing animation preset
 */
export const timingConfig = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Fade in animation
 */
export const useFadeInAnimation = () => {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const startAnimation = () => {
    opacity.value = withTiming(1, timingConfig);
  };

  return {
    animatedStyle,
    startAnimation,
    opacity,
  };
};

/**
 * Slide in animation
 */
export const useSlideInAnimation = (direction: 'left' | 'right' | 'up' | 'down' = 'left') => {
  const translateX = useSharedValue(direction === 'left' ? -100 : direction === 'right' ? 100 : 0);
  const translateY = useSharedValue(direction === 'up' ? 100 : direction === 'down' ? -100 : 0);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const startAnimation = () => {
    translateX.value = withTiming(0, timingConfig);
    translateY.value = withTiming(0, timingConfig);
    opacity.value = withTiming(1, timingConfig);
  };

  return {
    animatedStyle,
    startAnimation,
    translateX,
    translateY,
    opacity,
  };
};

/**
 * Scale animation
 */
export const useScaleAnimation = () => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const startAnimation = () => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withTiming(1, timingConfig);
  };

  return {
    animatedStyle,
    startAnimation,
    scale,
    opacity,
  };
};

/**
 * Bounce animation
 */
export const useBounceAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startAnimation = () => {
    scale.value = withSequence(
      withSpring(1.1, springConfig),
      withSpring(0.95, springConfig),
      withSpring(1, springConfig)
    );
  };

  return {
    animatedStyle,
    startAnimation,
    scale,
  };
};

/**
 * Pulse animation (for notifications)
 */
export const usePulseAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const startAnimation = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
    );
  };

  return {
    animatedStyle,
    startAnimation,
    scale,
  };
};

/**
 * Shake animation (for errors)
 */
export const useShakeAnimation = () => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const startAnimation = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 100, easing: Easing.linear }),
      withTiming(10, { duration: 100, easing: Easing.linear }),
      withTiming(-10, { duration: 100, easing: Easing.linear }),
      withTiming(10, { duration: 100, easing: Easing.linear }),
      withTiming(0, { duration: 100, easing: Easing.linear })
    );
  };

  return {
    animatedStyle,
    startAnimation,
    translateX,
  };
};

/**
 * Rotate animation
 */
export const useRotateAnimation = (continuous = false) => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const startAnimation = () => {
    if (continuous) {
      rotation.value = withSequence(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        withTiming(0, { duration: 0 })
      );
    } else {
      rotation.value = withTiming(360, { duration: 500, easing: Easing.linear });
    }
  };

  return {
    animatedStyle,
    startAnimation,
    rotation,
  };
};
