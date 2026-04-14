import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useGame, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';

export const ComponentSelectorScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo, goBack } = useUI();
  const { completedActivities } = useGame();

  const handleSelectComponent = (componentId: string) => {
    navigateTo('level', { componentId });
  };

  const getComponentProgress = (componentId: string) => {
    let total = 0;
    let completed = 0;

    const component = components.find((c) => c.id === componentId);
    if (component) {
      component.levels.forEach((level: any) => {
        level.activities.forEach((activity: any) => {
          total++;
          if (completedActivities[activity.id]) {
            completed++;
          }
        });
      });
    }

    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID="component-selector-screen"
    >
      <View style={styles.header}>
        <Button
          title="← Atrás"
          onPress={goBack}
          variant="outline"
          testID="back-button"
        />
        <Text variant="h2" color={theme.colors.onBackground}>
          Componentes
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {components.map((component: any) => {
          const progress = getComponentProgress(component.id);
          const progressPercentage = progress.toFixed(0);

          return (
            <TouchableOpacity
              key={component.id}
              style={[
                styles.componentCard,
                { backgroundColor: component.accent + '20' },
              ]}
              onPress={() => handleSelectComponent(component.id)}
              testID={`component-card-${component.id}`}
            >
              {/* Accent bar */}
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: component.accent },
                ]}
              />

              {/* Content */}
              <View style={styles.componentContent}>
                {/* Title and mascot */}
                <View style={styles.titleSection}>
                  <View style={styles.titleText}>
                    <Text variant="h3" color={component.accent}>
                      {component.title}
                    </Text>
                    <Text
                      variant="caption"
                      color={theme.colors.onSurface}
                      style={{ marginTop: 4 }}
                    >
                      {component.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.mascotBadge,
                      { backgroundColor: component.accent + '30' },
                    ]}
                  >
                    <Text variant="h2" style={{ textAlign: 'center' }}>
                      {component.mascot?.substring(0, 1) || '🎓'}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
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
                        width: `${Math.min(progress, 100)}%`,
                      },
                    ]}
                  />
                </View>

                {/* Progress text */}
                <Text
                  variant="caption"
                  color={theme.colors.onSurface}
                  style={{ marginTop: 8 }}
                >
                  Progreso: {progressPercentage}% completado ({component.levels.length} niveles)
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
