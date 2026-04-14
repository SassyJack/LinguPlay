import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useGame, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';

export const ResultsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo, goBack } = useUI();
  const { score, stars, completionPercentage, activitiesCompleted } =
    useGame();

  const totalActivities = components.reduce(
    (acc, component: any) =>
      acc +
      component.levels.reduce(
        (levelAcc: number, level: any) => levelAcc + level.activities.length,
        0
      ),
    0
  );

  const getComponentStats = (componentId: string) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return { total: 0, completed: 0, percentage: 0 };

    let total = 0;
    let completed = 0;

    component.levels.forEach((level: any) => {
      level.activities.forEach((activity: any) => {
        total++;
        // Would need access to completedActivities from store
        // This is a simplified version
      });
    });

    return {
      total,
      completed: Math.floor((total * completionPercentage) / 100),
      percentage:
        total > 0 ? Math.round((Math.floor((total * completionPercentage) / 100) / total) * 100) : 0,
    };
  };

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID="results-screen"
    >
      <View style={styles.header}>
        <Button
          title="← Atrás"
          onPress={goBack}
          variant="outline"
          testID="back-button"
        />
        <Text variant="h2" color={theme.colors.onBackground}>
          Mi Progreso
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Overall Stats */}
        <View style={[styles.statsGrid, { backgroundColor: theme.colors.surface }]}>
          {/* Puntos */}
          <View style={styles.statItem}>
            <Text variant="h3" color={theme.colors.primary}>
              Puntos
            </Text>
            <Text
              variant="h1"
              color={theme.colors.primary}
              style={{ marginTop: 8 }}
            >
              {score}
            </Text>
          </View>

          {/* Estrellas */}
          <View style={styles.statItem}>
            <Text variant="h3" color={theme.colors.accent}>
              Estrellas
            </Text>
            <Text
              variant="h1"
              color={theme.colors.accent}
              style={{ marginTop: 8 }}
            >
              {stars}⭐
            </Text>
          </View>

          {/* Actividades */}
          <View style={styles.statItem}>
            <Text variant="h3" color={theme.colors.info}>
              Actividades
            </Text>
            <Text
              variant="h1"
              color={theme.colors.info}
              style={{ marginTop: 8 }}
            >
              {activitiesCompleted}
            </Text>
          </View>
        </View>

        {/* Overall Progress */}
        <View
          style={[
            styles.progressCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text variant="h3" color={theme.colors.onBackground}>
              Progreso General
            </Text>
            <Text variant="h2" color={theme.colors.success}>
              {completionPercentage.toFixed(0)}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.gray200 },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.success,
                  width: `${Math.min(completionPercentage, 100)}%`,
                },
              ]}
            />
          </View>

          <Text
            variant="caption"
            color={theme.colors.onSurface}
            style={{ marginTop: 12 }}
          >
            {activitiesCompleted} de {totalActivities} actividades
            completadas
          </Text>
        </View>

        {/* Components Progress */}
        <Text variant="h3" style={{ marginTop: 24, marginBottom: 12 }}>
          Progreso por Componente
        </Text>

        {components.map((component: any) => {
          const stats = getComponentStats(component.id);
          const localProgress = (stats.completed / stats.total) * 100 || 0;

          return (
            <View
              key={component.id}
              style={[
                styles.componentProgressCard,
                { backgroundColor: component.accent + '10' },
              ]}
            >
              <View style={styles.componentHeader}>
                <View>
                  <Text variant="h3" color={component.accent}>
                    {component.title}
                  </Text>
                  <Text
                    variant="caption"
                    color={theme.colors.onSurface}
                    style={{ marginTop: 4 }}
                  >
                    {Math.round(localProgress)}% completado
                  </Text>
                </View>
                <Text variant="h2" color={component.accent}>
                  {Math.round(localProgress)}%
                </Text>
              </View>

              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.gray200 },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: component.accent,
                      width: `${Math.min(localProgress, 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="h3" color={theme.colors.onBackground}>
            🏆 Logros Desbloqueados
          </Text>
          <Text
            variant="body"
            color={theme.colors.onSurface}
            style={{ marginTop: 8 }}
          >
            Completa más actividades para desbloquear nuevos logros y
            recompensas especiales.
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Continuar Aprendiendo"
            onPress={() => navigateTo('component')}
            variant="primary"
          />
        </View>
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
    marginBottom: 16,
  },
});

export default ResultsScreen;
