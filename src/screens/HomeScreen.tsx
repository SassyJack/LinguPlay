import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Button, Text, Container} from '@/components';
import { useGame, useUser, useUI } from '@/hooks';
import { useTheme } from '@/theme';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { score, stars, completionPercentage } = useGame();
  const { user, isPremium } = useUser();
  const { navigateTo } = useUI();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID="home-screen"
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Welcome */}
        <View style={styles.header}>
          <Text variant="h1" color={theme.colors.primary}>
            ¡Bienvenido a LinguaPlay!
          </Text>
          {user && (
            <Text variant="body" color={theme.colors.onBackground}>
              {user.displayName}
              {isPremium && ' 👑'}
            </Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Score Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="h3" color={theme.colors.primary}>
              Puntos
            </Text>
            <Text variant="h2" color={theme.colors.primary}>
              {score}
            </Text>
          </View>

          {/* Stars Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="h3" color={theme.colors.accent}>
              Estrellas
            </Text>
            <Text variant="h2" color={theme.colors.accent}>
              {stars}⭐
            </Text>
          </View>

          {/* Progress Card */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text variant="h3" color={theme.colors.success}>
              Progreso
            </Text>
            <Text variant="h2" color={theme.colors.success}>
              {completionPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Main CTA */}
        <View style={styles.actionContainer}>
          <Button
            title="Comenzar Actividad"
            onPress={() => navigateTo('component')}
            variant="primary"
            testID="start-button"
          />
          <Button
            title="Mi Progreso"
            onPress={() => navigateTo('results')}
            variant="secondary"
            testID="progress-button"
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
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
          {!isPremium && (
            <Text
              variant="caption"
              color={theme.colors.warning}
              style={{ marginTop: 8 }}
            >
              💡 Tienes 5 intentos diarios. Suscríbete a Premium para intentos
              ilimitados.
            </Text>
          )}
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
});

export default HomeScreen;
