import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useGame, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';

interface LevelSelectorProps {
  componentId?: string;
}

export const LevelSelectorScreen: React.FC<LevelSelectorProps> = ({
  componentId,
}) => {
  const { theme } = useTheme();
  const { navigateTo, goBack, selectedComponentId } = useUI();
  const { completedActivities } = useGame();

  const currentComponentId = componentId || selectedComponentId;

  const currentComponent = useMemo(
    () => components.find((c) => c.id === currentComponentId),
    [currentComponentId]
  );

  const handleSelectLevel = (levelId: string) => {
    if (currentComponentId) {
      navigateTo('activity', {
        componentId: currentComponentId,
        levelId,
      });
    }
  };

  const getLevelProgress = (componentId: string, levelId: string) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return 0;

    const level = component.levels.find((l: any) => l.id === levelId);
    if (!level) return 0;

    let total = level.activities.length;
    let completed = 0;

    level.activities.forEach((activity: any) => {
      if (completedActivities[activity.id]) {
        completed++;
      }
    });

    return total > 0 ? (completed / total) * 100 : 0;
  };

  if (!currentComponent) {
    return (
      <Container testID="level-selector-screen">
        <View style={styles.centerContent}>
          <Text variant="h2">Componente no encontrado</Text>
          <View style={{ marginTop: 16 }}>
            <Button
              title="Volver"
              onPress={goBack}
              variant="primary"
            />
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID="level-selector-screen"
    >
      <View style={styles.header}>
        <Button
          title="← Atrás"
          onPress={goBack}
          variant="outline"
          testID="back-button"
        />
        <View style={styles.headerTitle}>
          <Text variant="h2" color={currentComponent.accent}>
            {currentComponent.title}
          </Text>
          <Text variant="caption" color={theme.colors.onSurface}>
            {currentComponent.subtitle}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {currentComponent.levels.map((level: any, index: number) => {
          const progress = getLevelProgress(currentComponent.id, level.id);
          const isCompleted = progress === 100;

          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                {
                  backgroundColor: level.color + '20',
                  borderLeftColor: level.color,
                },
              ]}
              onPress={() => handleSelectLevel(level.id)}
              testID={`level-card-${level.id}`}
            >
              {/* Level indicator */}
              <View
                style={[
                  styles.levelIndicator,
                  { backgroundColor: level.color },
                ]}
              >
                <Text
                  variant="h2"
                  style={{ color: '#FFFFFF', textAlign: 'center' }}
                >
                  {index + 1}
                </Text>
              </View>

              {/* Content */}
              <View style={styles.levelContent}>
                <View style={styles.levelHeader}>
                  <View>
                    <Text variant="h3" color={level.color}>
                      {level.label}
                    </Text>
                    <Text
                      variant="caption"
                      color={theme.colors.onSurface}
                      style={{ marginTop: 4 }}
                    >
                      Dificultad: {level.difficulty} • Edad: {level.age}+
                    </Text>
                  </View>
                  {isCompleted && (
                    <Text variant="h2" style={{ marginLeft: 12 }}>
                      ✓
                    </Text>
                  )}
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
                        backgroundColor: level.color,
                        width: `${Math.min(progress, 100)}%`,
                      },
                    ]}
                  />
                </View>

                {/* Activity count */}
                <Text
                  variant="caption"
                  color={theme.colors.onSurface}
                  style={{ marginTop: 8 }}
                >
                  {Math.round(progress)}% • {2} actividades
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Tips section */}
        <View
          style={[
            styles.tipsCard,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text variant="h3" color={theme.colors.onBackground}>
            📝 Información
          </Text>
          <Text
            variant="body"
            color={theme.colors.onSurface}
            style={{ marginTop: 8 }}
          >
            Este componente contiene {currentComponent.levels.length} niveles
            con diferentes dificultades. Comienza desde el nivel básico y avanza
            progresivamente.
          </Text>
          <Text
            variant="caption"
            color={theme.colors.success}
            style={{ marginTop: 8 }}
          >
            💚 Completa todos los niveles para dominar este componente.
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default LevelSelectorScreen;
