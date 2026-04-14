import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useGame, useUser, useUI } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';

interface ActivityScreenProps {
  componentId?: string;
  levelId?: string;
  activityId?: string;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  componentId,
  levelId,
  activityId,
}) => {
  const { theme } = useTheme();
  const { navigateTo, goBack, showToast, selectedComponentId, selectedLevelId, selectedActivityId } =
    useUI();
  const { completeActivity, recordAttempt } = useGame();
  const { canAttemptActivity, incrementDailyAttempts } = useUser();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentComponentId = componentId || selectedComponentId;
  const currentLevelId = levelId || selectedLevelId;
  const currentActivityId = activityId || selectedActivityId;

  const activity = useMemo(() => {
    const component = components.find((c) => c.id === currentComponentId);
    if (!component) return null;

    const level = component.levels.find((l: any) => l.id === currentLevelId);
    if (!level) return null;

    return level.activities.find((a: any) => a.id === currentActivityId);
  }, [currentComponentId, currentLevelId, currentActivityId]);

  if (!activity) {
    return (
      <Container testID="activity-screen">
        <View style={styles.centerContent}>
          <Text variant="h2">Actividad no encontrada</Text>
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

  const handleSubmit = async () => {
    if (!canAttemptActivity()) {
      showToast('Has llegado al límite de intentos diarios', 'warning');
      return;
    }

    if (!selectedOption) {
      showToast('Selecciona una opción', 'info');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const correct = selectedOption === activity.correctAnswer;
      setIsCorrect(correct);
      setShowResult(true);

      // Record attempt and update state
      recordAttempt(currentComponentId || '', correct);
      incrementDailyAttempts();

      if (correct) {
        completeActivity(activity.id, activity.reward || 10);
        showToast('¡Correcto! +' + (activity.reward || 10) + ' puntos', 'success');
      } else {
        showToast('Intenta de nuevo', 'error');
      }

      setIsSubmitting(false);
    }, 800);
  };

  const handleContinue = () => {
    // Navigate to next activity or level selector
    navigateTo('activity', {
      componentId: currentComponentId || '',
      levelId: currentLevelId || '',
    });
  };

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID="activity-screen"
    >
      <View style={styles.header}>
        <Button
          title="← Salir"
          onPress={goBack}
          variant="outline"
          testID="exit-button"
        />
        <Text variant="h3" color={theme.colors.onBackground}>
          {activity.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Instruction */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="h3" color={theme.colors.primary}>
            📝 Instrucción
          </Text>
          <Text variant="body" style={{ marginTop: 8 }}>
            {activity.instruction}
          </Text>
          {activity.supportText && (
            <Text
              variant="caption"
              color={theme.colors.info}
              style={{ marginTop: 8 }}
            >
              💡 {activity.supportText}
            </Text>
          )}
        </View>

        {/* Prompt/Question */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.primary + '10',
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            },
          ]}
        >
          <Text variant="h2" color={theme.colors.primary}>
            {activity.prompt}
          </Text>
        </View>

        {/* Options */}
        {!showResult && activity.options && (
          <View>
            <Text variant="h3" style={{ marginBottom: 12, marginTop: 16 }}>
              Opciones:
            </Text>
            {activity.options.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      selectedOption === option
                        ? theme.colors.primary
                        : theme.colors.surface,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setSelectedOption(option)}
                testID={`option-${index}`}
              >
                <Text
                  variant="body"
                  color={
                    selectedOption === option
                      ? theme.colors.white
                      : theme.colors.onBackground
                  }
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Result Screen */}
        {showResult && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: isCorrect
                  ? theme.colors.success + '15'
                  : theme.colors.error + '15',
              },
            ]}
          >
            <Text
              variant="h1"
              color={isCorrect ? theme.colors.success : theme.colors.error}
              style={{ textAlign: 'center', marginBottom: 8 }}
            >
              {isCorrect ? '¡Correcto! ✓' : 'Intenta de nuevo'}
            </Text>
            {isCorrect ? (
              <>
                <Text
                  variant="body"
                  color={theme.colors.success}
                  style={{ textAlign: 'center' }}
                >
                  Ganaste {activity.reward || 10} puntos
                </Text>
              </>
            ) : (
              <>
                <Text
                  variant="body"
                  color={theme.colors.error}
                  style={{ textAlign: 'center', marginBottom: 8 }}
                >
                  La respuesta correcta era: <Text variant="h3">{activity.correctAnswer}</Text>
                </Text>
              </>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!showResult ? (
            <Button
              title={isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
              onPress={handleSubmit}
              variant="primary"
              disabled={isSubmitting || !selectedOption}
              testID="submit-button"
            />
          ) : (
            <Button
              title={isCorrect ? 'Siguiente' : 'Reintentar'}
              onPress={isCorrect ? handleContinue : () => {
                setShowResult(false);
                setSelectedOption(null);
              }}
              variant="primary"
              testID="continue-button"
            />
          )}
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
    gap: 12,
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButton: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    borderRadius: 12,
    padding: 24,
    marginVertical: 24,
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
});

export default ActivityScreen;
