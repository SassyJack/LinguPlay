import React, { useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useGame, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';

/**
 * ComponentSelectorScreen - Browse language components with progress tracking
 * Displays 4 components (Fonológico, Morfosintáctico, Semántico, Pragmático)
 */
interface ComponentSelectorScreenProps {
  testID?: string;
}

export const ComponentSelectorScreen: React.FC<ComponentSelectorScreenProps> = ({
  testID = 'component-selector-screen',
}) => {
  const { theme } = useTheme();
  const { navigateTo, goBack } = useUI();
  const { completedActivities } = useGame();

  // Memoized callback
  const handleSelectComponent = useCallback(
    (componentId: string) => {
      navigateTo('level', { componentId });
    },
    [navigateTo]
  );

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // Memoized progress calculation
  const getComponentProgress = useCallback(
    (componentId: string) => {
      let total = 0;
      let completed = 0;

      const component = components.find((c) => c.id === componentId);
      if (component) {
        component.levels.forEach((level: any) => {
          level.activities.forEach((activity: any) => {
            total++;
            if (completedActivities?.[activity.id]) {
              completed++;
            }
          });
        });
      }

      return total > 0 ? (completed / total) * 100 : 0;
    },
    [completedActivities]
  );

  // Memoized components data
  const componentProgressData = useMemo(
    () =>
      components.map((component: any) => ({
        ...component,
        progress: getComponentProgress(component.id),
      })),
    [getComponentProgress]
  );

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID={testID}
    >
      <View
        style={styles.header}
        testID="selector-header"
        accessible={true}
        accessibilityLabel="Encabezado"
      >
        <Button
          title="← Atrás"
          onPress={handleGoBack}
          variant="outline"
          testID="back-button"
        />
        <Text variant="h2" color={theme.colors.onBackground}>
          Componentes
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        testID="components-scroll-view"
      >
        {componentProgressData.map((component: any) => {
          const progressPercentage = component.progress.toFixed(0);
          const isCompleted = component.progress === 100;

          return (
            <TouchableOpacity
              key={component.id}
              style={[
                styles.componentCard,
                { backgroundColor: component.accent + '20' },
              ]}
              onPress={() => handleSelectComponent(component.id)}
              testID={`component-card-${component.id}`}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${component.name}: ${progressPercentage}% completado${isCompleted ? ', completado' : ''}`}
            >
              {/* Accent bar */}
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: component.accent },
                ]}
                testID={`accent-bar-${component.id}`}
              />

              {/* Content */}
              <View style={styles.componentContent}>
                {/* Title and mascot */}
                <View
                  style={styles.titleSection}
                  testID={`title-section-${component.id}`}
                  accessible={true}
                  accessibilityLabel={component.name}
                >
                  <View style={styles.titleText}>
                    <Text
                      variant="h3"
                      color={component.accent}
                      testID={`component-title-${component.id}`}
                    >
                      {component.title}
                    </Text>
                    <Text
                      variant="caption"
                      color={theme.colors.onSurface}
                      style={{ marginTop: 4 }}
                      testID={`component-subtitle-${component.id}`}
                    >
                      {component.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.mascotBadge,
                      { backgroundColor: component.accent + '30' },
                    ]}
                    testID={`mascot-badge-${component.id}`}
                  >
                    <Text
                      variant="h2"
                      style={{ textAlign: 'center' }}
                      testID={`mascot-text-${component.id}`}
                    >
                      {component.mascot?.substring(0, 1) || '🎓'}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.colors.gray200 || '#E5E7EB' },
                  ]}
                  testID={`progress-bar-${component.id}`}
                  accessible={true}
                  accessibilityLabel={`Progreso: ${progressPercentage}%`}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: component.accent,
                        width: `${Math.min(component.progress, 100)}%`,
                      },
                    ]}
                    testID={`progress-fill-${component.id}`}
                  />
                </View>

                {/* Progress text */}
                <Text
                  variant="caption"
                  color={theme.colors.onSurface}
                  style={{ marginTop: 8 }}
                  testID={`progress-text-${component.id}`}
                >
                  Progreso: {progressPercentage}% ({component.levels.length} niveles)
                  {isCompleted && ' ✓'}
                </Text>
              </View>

              {/* CTA Arrow */}
              <View style={styles.arrowContainer}>
                <Text variant="h2" color={component.accent}>
                  →
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Info card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text variant="h3" color={theme.colors.onBackground}>
            💡 Consejo
          </Text>
          <Text
            variant="body"
            color={theme.colors.onSurface}
            style={{ marginTop: 8 }}
          >
            Completa todos los niveles de cada componente para dominar cada
            aspecto del lenguaje. Avanza a tu propio ritmo.
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  componentCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accentBar: {
    width: 4,
    height: '100%',
  },
  componentContent: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleText: {
    flex: 1,
    marginRight: 12,
  },
  mascotBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  arrowContainer: {
    paddingRight: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
});

export default ComponentSelectorScreen;
