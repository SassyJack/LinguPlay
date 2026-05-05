import React, { useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
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
  const { user, isPremium, attemptsRemaining, logout } = useUser();
  const { navigateTo } = useUI();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigateTo('login');
  }, [logout, navigateTo]);

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
    navigateTo('component');
  }, [navigateTo]);

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
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
          </View>
          <View style={styles.headerTop}>
            <View>
              <Text
                variant="h1"
                color={theme.colors.primary}
                testID="welcome-text"
              >
                ¡Hola! 🎮 Bienvenido a LinguaPlay
              </Text>
              <Text
                variant="body"
                color={theme.colors.onBackground}
                testID="user-name"
              >
                {displayName}
                {isPremium && ' 👑'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text variant="caption" color={theme.colors.error}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
          {user?.role === 'admin' && (
            <Button 
              title="Ir a Panel Admin" 
              variant="outline" 
              onPress={() => navigateTo('admin_dashboard')}
              style={{ marginTop: 16 }}
            />
          )}
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
              { backgroundColor: '#E3F2FD', borderColor: '#64B5F6' },
            ]}
            testID="score-card"
            accessible={true}
            accessibilityLabel={`Puntos: ${score}`}
          >
            <Text variant="h3" color={theme.colors.primary}>
              ⭐ Puntos
            </Text>
            <Text variant="h2" color={theme.colors.primary} testID="score-value">
              {score}
            </Text>
          </View>

          {/* Stars Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: '#FFF8E1', borderColor: '#FFD54F' },
            ]}
            testID="stars-card"
            accessible={true}
            accessibilityLabel={`Estrellas: ${stars}`}
          >
            <Text variant="h3" color={theme.colors.accent}>
              🌟 Estrellas
            </Text>
            <Text variant="h2" color={theme.colors.accent} testID="stars-value">
              {stars}⭐
            </Text>
          </View>

          {/* Progress Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: '#E8F5E9', borderColor: '#81C784' },
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
            📚 ¿Cómo se juega?
          </Text>
          <Text
            variant="caption"
            color={theme.colors.onSurface}
            style={{ marginTop: 8 }}
          >
            Elige un componente del lenguaje, completa los niveles y gana
            puntos. ¡Acumula estrellas para desbloquear logros especiales!
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
    borderBottomWidth: 3,
    borderBottomColor: '#FFD93D',
    backgroundColor: '#FFF0DB',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    borderWidth: 3,
    borderColor: '#FFD93D',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#FFF0DB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  attemptsBanner: {
    padding: 8,
  },
});

export default HomeScreen;
