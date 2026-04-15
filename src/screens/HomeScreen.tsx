import React, { useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, Text, Container } from '@/components';
import { useGame, useUser, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { useFadeInAnimation, useSlideInAnimation } from '@/services';

/**
 * HomeScreen - Main welcome hub showing personalized greeting,
 * user statistics, and primary CTAs for navigation
 */
interface HomeScreenProps {
  testID?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ testID = 'home-screen' }) => {
  const { theme } = useTheme();
  const { score, stars, completionPercentage } = useGame();
  const { user, isPremium, attemptsRemaining } = useUser();
  const { navigateTo, showToast } = useUI();
  const [refreshing, setRefreshing] = React.useState(false);

  // Animations
  const { animatedStyle: fadeInStyle, startAnimation: startFadeIn } = useFadeInAnimation();
  const { animatedStyle: slideInStyle, startAnimation: startSlideIn } = useSlideInAnimation('left');

  // Memoized callbacks for performance
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const timer = setTimeout(() => setRefreshing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Trigger animations on mount
  useEffect(() => {
    startFadeIn();
    setTimeout(() => startSlideIn(), 150);
  }, []);

  const handleStartActivity = useCallback(() => {
    if (!user) {
      showToast('Por favor inicia sesión', 'warning');
      return;
    }
    navigateTo('component');
  }, [user, navigateTo, showToast]);

  const handleViewProgress = useCallback(() => {
    navigateTo('results');
  }, [navigateTo]);

  // Memoized computed values
  const completionPercentageText = useMemo(
    () => completionPercentage.toFixed(0),
    [completionPercentage]
  );

  const displayName = useMemo(
    () => user?.displayName || 'Estudiante',
    [user?.displayName]
  );

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID={testID}
    >
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        testID="home-scroll-view"
        accessible={true}
        accessibilityLabel="Contenido principal"
      >
        {/* Header Welcome */}
        <Animated.View
          style={[styles.header, fadeInStyle]}
          testID="home-header"
          accessible={true}
          accessibilityLabel={`Bienvenido ${displayName}${isPremium ? ' Premium' : ''}`}
        >
          <Text
            variant="h1"
            color={theme.colors.primary}
            testID="welcome-text"
          >
            ¡Bienvenido a LinguaPlay!
          </Text>
          <Text
            variant="body"
            color={theme.colors.onBackground}
            testID="user-name"
          >
            {displayName}
            {isPremium && ' 👑'}
          </Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View
          style={[styles.statsContainer, slideInStyle]}
          testID="stats-container"
          accessible={true}
          accessibilityLabel="Estadísticas de usuario"
        >
          {/* Score Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.surface },
            ]}
            testID="score-card"
            accessible={true}
            accessibilityLabel={`Puntos: ${score}`}
          >
            <Text variant="h3" color={theme.colors.primary}>
              Puntos
            </Text>
            <Text variant="h2" color={theme.colors.primary} testID="score-value">
              {score}
            </Text>
          </View>

          {/* Stars Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.surface },
            ]}
            testID="stars-card"
            accessible={true}
            accessibilityLabel={`Estrellas: ${stars}`}
          >
            <Text variant="h3" color={theme.colors.accent}>
              Estrellas
            </Text>
            <Text variant="h2" color={theme.colors.accent} testID="stars-value">
              {stars}⭐
            </Text>
          </View>

          {/* Progress Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.surface },
            ]}
            testID="progress-card"
            accessible={true}
            accessibilityLabel={`Progreso: ${completionPercentageText} porciento`}
          >
            <Text variant="h3" color={theme.colors.success}>
              Progreso
            </Text>
            <Text
              variant="h2"
              color={theme.colors.success}
              testID="progress-value"
            >
              {completionPercentageText}%
            </Text>
          </View>
        </Animated.View>

        {/* Main CTA */}
        <View
          style={styles.actionContainer}
          testID="action-container"
          accessible={true}
          accessibilityLabel="Acciones principales"
        >
          <Button
            title="Comenzar Actividad"
            onPress={handleStartActivity}
            variant="primary"
            testID="start-button"
          />
          <Button
            title="Mi Progreso"
            onPress={handleViewProgress}
            variant="secondary"
            testID="progress-button"
          />
        </View>

        {/* Info Section */}
        <View
          style={styles.infoSection}
          testID="info-section"
          accessible={true}
          accessibilityLabel="Información del sistema"
        >
          <Text variant="h3" color={theme.colors.onBackground}>
            📚 Cómo Funciona
          </Text>
          <Text
            variant="caption"
            color={theme.colors.onSurface}
            style={{ marginTop: 8 }}
          >
            Selecciona un componente de lenguaje, completa los niveles y gana
            puntos. Acumula estrellas para desbloquear logros especiales.
          </Text>
          <View
            style={styles.attemptsBanner}
            testID="attempts-banner"
            accessible={true}
            accessibilityLabel={`Intentos disponibles: ${attemptsRemaining}`}
          >
            <Text
              variant="caption"
              color={isPremium ? theme.colors.success : theme.colors.warning}
              style={{ marginTop: 8 }}
            >
              {isPremium
                ? '✓ Premium: Intentos ilimitados'
                : `💡 Intentos hoy: ${attemptsRemaining}`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 100,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  attemptsBanner: {
    padding: 8,
  },
});

export default HomeScreen;
