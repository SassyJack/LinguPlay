import React, { useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, Text, Container } from '@/components';
import { useGame, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';
import { useFadeInAnimation, useSlideInAnimation } from '@/services';

/**
 * ResultsScreen - Analytics dashboard showing overall and per-component progress
 * Displays statistics with visual progress representations
 */
interface ResultsScreenProps {
  testID?: string;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  testID = 'results-screen',
}) => {
  const { theme } = useTheme();
  const { navigateTo, goBack } = useUI();
  const { score, stars, completionPercentage, activitiesCompleted, completedActivities } =
    useGame();
  const { animatedStyle: fadeInStyle, startAnimation: startFadeIn } = useFadeInAnimation();
  const { animatedStyle: slideInStyle, startAnimation: startSlideIn } = useSlideInAnimation('up');

  // Trigger animations on mount
  useEffect(() => {
    startFadeIn();
    startSlideIn();
  }, [startFadeIn, startSlideIn]);

  // Memoized callback
  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleNavigateHome = useCallback(() => {
    navigateTo('home');
  }, [navigateTo]);

  // Memoized calculations
  const totalActivities = useMemo(
    () =>
      components.reduce(
        (acc, component: any) =>
          acc +
          component.levels.reduce(
            (levelAcc: number, level: any) => levelAcc + level.activities.length,
            0
          ),
        0
      ),
    []
  );

  const completionPercentageText = useMemo(
    () => completionPercentage.toFixed(0),
    [completionPercentage]
  );

  // Memoized component stats
  const componentStats = useMemo(
    () =>
      components.map((component: any) => {
        let total = 0;
        let completed = 0;

        component.levels.forEach((level: any) => {
          level.activities.forEach((activity: any) => {
            total++;
            if (completedActivities?.[activity.id]) {
              completed++;
            }
          });
        });

        return {
          name: component.title,
          total,
          completed,
          percentage: total > 0 ? (completed / total) * 100 : 0,
          accent: component.accent,
        };
      }),
    [completedActivities]
  );

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID={testID}
    >
      <View
        style={styles.header}
        testID="results-header"
        accessible={true}
        accessibilityLabel="Encabezado"
      >
        <Button
          title="← Atrás"
          onPress={handleGoBack}
          variant="outline"
          testID="back-button"
        />
        <Text
          variant="h2"
          color={theme.colors.onBackground}
          testID="header-title"
        >
          Mi Progreso
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        testID="results-scroll-view"
      >
        <Animated.View style={slideInStyle}>
          {/* Overall Stats */}
          <View
            style={[styles.statsGrid, { backgroundColor: theme.colors.surface }]}
            testID="overall-stats"
            accessible={true}
            accessibilityLabel="Estadísticas generales"
          >
            {/* Puntos */}
            <View
              style={styles.statItem}
              testID="score-stat"
              accessible={true}
              accessibilityLabel={`Puntos: ${score}`}
            >
              <Text variant="h3" color={theme.colors.primary}>
                Puntos
              </Text>
              <Text
                variant="h1"
                color={theme.colors.primary}
                style={{ marginTop: 8 }}
                testID="score-value"
              >
                {score}
              </Text>
            </View>

            {/* Estrellas */}
            <View
              style={styles.statItem}
              testID="stars-stat"
              accessible={true}
              accessibilityLabel={`Estrellas: ${stars}`}
            >
              <Text variant="h3" color={theme.colors.accent}>
                Estrellas
              </Text>
              <Text
                variant="h1"
                color={theme.colors.accent}
                style={{ marginTop: 8 }}
                testID="stars-value"
              >
                {stars}⭐
              </Text>
            </View>

            {/* Actividades */}
            <View
              style={styles.statItem}
              testID="activities-stat"
              accessible={true}
              accessibilityLabel={`Actividades completadas: ${activitiesCompleted}`}
            >
              <Text variant="h3" color={theme.colors.info}>
                Actividades
              </Text>
              <Text
                variant="h1"
                color={theme.colors.info}
                style={{ marginTop: 8 }}
                testID="activities-value"
              >
                {activitiesCompleted}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={fadeInStyle}>
          {/* Overall Progress */}
        <View
          style={[
            styles.progressCard,
            { backgroundColor: theme.colors.surface },
          ]}
          testID="overall-progress"
          accessible={true}
          accessibilityLabel={`Progreso general: ${completionPercentageText}%`}
        >
          <View style={styles.progressHeader}>
            <Text
              variant="h3"
              color={theme.colors.onBackground}
              testID="progress-title"
            >
              Progreso General
            </Text>
            <Text
              variant="h2"
              color={theme.colors.success}
              testID="progress-percentage"
            >
              {completionPercentageText}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.gray200 || '#E5E7EB' },
            ]}
            testID="overall-progress-bar"
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.success,
                  width: `${Math.min(completionPercentage, 100)}%`,
                },
              ]}
              testID="overall-progress-fill"
            />
          </View>

          <Text
            variant="caption"
            color={theme.colors.onSurface}
            style={{ marginTop: 12 }}
            testID="progress-text"
          >
            {activitiesCompleted} de {totalActivities} actividades completadas
          </Text>
        </View>

        {/* Components Progress */}
        <Text
          variant="h3"
          style={{ marginTop: 24, marginBottom: 12 }}
          testID="components-title"
        >
          Progreso por Componente
        </Text>

        {componentStats.map((stats: any, index: number) => (
          <View
            key={index}
            style={[
              styles.componentProgressCard,
              { backgroundColor: stats.accent + '10' || '#F3F4F6' },
            ]}
            testID={`component-progress-${index}`}
            accessible={true}
            accessibilityLabel={`${stats.name}: ${stats.percentage.toFixed(0)}% completado`}
          >
            <View style={styles.componentHeader}>
              <View>
                <Text
                  variant="h3"
                  color={stats.accent || '#1F2937'}
                  testID={`component-name-${index}`}
                >
                  {stats.name}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.onSurface}
                  style={{ marginTop: 4 }}
                  testID={`component-status-${index}`}
                >
                  {stats.completed} de {stats.total} actividades
                </Text>
              </View>
              <Text
                variant="h2"
                color={stats.accent || '#1F2937'}
                testID={`component-percentage-${index}`}
              >
                {stats.percentage.toFixed(0)}%
              </Text>
            </View>

            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.colors.gray200 || '#E5E7EB' },
              ]}
              testID={`component-progress-bar-${index}`}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: stats.accent || '#1F2937',
                    width: `${Math.min(stats.percentage, 100)}%`,
                  },
                ]}
                testID={`component-progress-fill-${index}`}
              />
            </View>
          </View>
        ))}

        {/* Achievements */}
        <View
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          testID="achievements-section"
          accessible={true}
          accessibilityLabel="Logros desbloqueados"
        >
          <Text
            variant="h3"
            color={theme.colors.onBackground}
            testID="achievements-title"
          >
            🏆 Logros Desbloqueados
          </Text>
          <Text
            variant="body"
            color={theme.colors.onSurface}
            style={{ marginTop: 8 }}
            testID="achievements-message"
          >
            Completa más actividades para desbloquear nuevos logros y
            recompensas especiales.
          </Text>
        </View>

        {/* Action Button */}
        <View
          style={styles.actionContainer}
          testID="action-container"
          accessible={true}
          accessibilityLabel="Botones de acción"
        >
          <Button
            title="Continuar Aprendiendo"
            onPress={handleNavigateHome}
            variant="primary"
            testID="continue-button"
          />
        </View>
        </Animated.View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  statsGrid: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  componentProgressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  actionContainer: {
    marginTop: 24,
    gap: 12,
  },
});
