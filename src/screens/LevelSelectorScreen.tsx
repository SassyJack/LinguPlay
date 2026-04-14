import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useGame, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';

/**
 * LevelSelectorScreen - Show 3 difficulty levels for selected component
 * Displays individual progress tracking and age recommendations per level
 */
interface LevelSelectorProps {
  componentId?: string;
  testID?: string;
}

export const LevelSelectorScreen: React.FC<LevelSelectorProps> = ({
  componentId,
  testID = 'level-selector-screen',
}) => {
  const { theme } = useTheme();
  const { navigateTo, goBack, selectedComponentId } = useUI();
  const { completedActivities } = useGame();

  const currentComponentId = componentId || selectedComponentId;

  const currentComponent = useMemo(
    () => components.find((c) => c.id === currentComponentId),
    [currentComponentId]
  );

  // Memoized callback
  const handleSelectLevel = useCallback(
    (levelId: string) => {
      if (currentComponentId) {
        navigateTo('activity', {
          componentId: currentComponentId,
          levelId,
        });
      }
    },
    [currentComponentId, navigateTo]
  );

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // Memoized progress calculation
  const getLevelProgress = useCallback(
    (componentId: string, levelId: string) => {
      const component = components.find((c) => c.id === componentId);
      if (!component) return 0;

      const level = component.levels.find((l: any) => l.id === levelId);
      if (!level) return 0;

      let total = level.activities.length;
      let completed = 0;

      level.activities.forEach((activity: any) => {
        if (completedActivities?.[activity.id]) {
          completed++;
        }
      });

      return total > 0 ? (completed / total) * 100 : 0;
    },
    [completedActivities]
  );

  // Error state
  if (!currentComponent) {
    return (
      <Container
        testID={testID}
      >
        <View style={styles.centerContent}>
          <Text variant="h2" testID="level-error-title">
            ⚠️ Componente no encontrado
          </Text>
          <Text
            variant="body"
            style={[styles.errorText, { marginTop: 12 }]}
            testID="level-error-message"
          >
            Por favor intenta seleccionar otro componente
          </Text>
          <View style={{ marginTop: 16, width: '100%', paddingHorizontal: 16 }}>
            <Button
              title="Volver"
              onPress={handleGoBack}
              variant="primary"
              testID="error-back-button"
            />
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID={testID}
    >
      <View
        style={styles.header}
        testID="level-header"
      >
        <Button
          title="← Atrás"
          onPress={handleGoBack}
          variant="outline"
          testID="back-button"
        />
        <View style={styles.headerTitle}>
          <Text
            variant="h2"
            color={currentComponent.accent}
            testID="component-title"
          >
            {currentComponent.title}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.onSurface}
            testID="component-subtitle"
          >
            {currentComponent.subtitle}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        testID="levels-scroll-view"
      >
        {currentComponent.levels.map((level: any, index: number) => {
          const progress = getLevelProgress(currentComponent.id, level.id);
          const progressPercentage = progress.toFixed(0);
          const isCompleted = progress === 100;

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                {
                  backgroundColor: level.color + '20' || '#F3F4F6',
                  borderLeftColor: level.color || theme.colors.primary,
                },
              ]}
              onPress={() => handleSelectLevel(level.id)}
              testID={`level-card-${level.id}`}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${level.difficulty}: ${progressPercentage}% completado${isCompleted ? ', completado' : ''}`}
            >
              {/* Level indicator */}
              <View
                style={[
                  styles.levelIndicator,
                  { backgroundColor: level.color || theme.colors.primary },
                ]}
                testID={`level-indicator-${level.id}`}
              >
                <Text
                  variant="h2"
                  style={{ color: '#FFFFFF', textAlign: 'center' }}
                  testID={`level-number-${level.id}`}
                >
                  {index + 1}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.levelContent}>
                <View style={styles.levelHeader}>
                  <View>
                    <Text
                      variant="h3"
                      color={level.color || theme.colors.primary}
                      testID={`level-label-${level.id}`}
                    >
                      {level.label}
                    </Text>
                    <Text
                      variant="caption"
                      color={theme.colors.onSurface}
                      style={{ marginTop: 4 }}
                      testID={`level-difficulty-${level.id}`}
                    >
                      {level.difficulty} • {level.age || '5'}+
                    </Text>
                  </View>
                  {isCompleted && (
                    <Text
                      variant="h2"
                      style={{ marginLeft: 12 }}
                      testID={`completion-badge-${level.id}`}
                    >
                      ✓
                    </Text>
                  )}
                </View>

                {/* Progress bar */}
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.colors.gray200 || '#E5E7EB' },
                  ]}
                  testID={`level-progress-bar-${level.id}`}
                  accessible={true}
                  accessibilityLabel={`Progreso: ${progressPercentage}%`}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: level.color || theme.colors.primary,
                        width: `${Math.min(progress, 100)}%`,
                      },
                    ]}
                    testID={`level-progress-fill-${level.id}`}
                  />
                </View>

                {/* Activity count */}
                <Text
                  variant="caption"
                  color={theme.colors.onSurface}
                  style={{ marginTop: 8 }}
                  testID={`level-progress-text-${level.id}`}
                >
                  {progressPercentage}% • 2 actividades
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  headerTitle: {
    marginLeft: 12,
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  levelCard: {
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelIndicator: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelContent: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    textAlign: 'center',
  },
});
