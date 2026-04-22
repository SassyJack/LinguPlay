import React, { useState, useMemo, useCallback } from 'react';
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
import { HapticService, audioService } from '@/services';
import { GameSyncService } from '@/api';
import { useGameStore, useUserStore } from '@/store';

/**
 * ActivityScreen - Interactive game activity with question/options/feedback flow
 * Handles activity presentation, answer submission, and result display
 */
interface ActivityScreenProps {
  componentId?: string;
  levelId?: string;
  activityId?: string;
  testID?: string;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  componentId,
  levelId,
  activityId,
  testID = 'activity-screen',
}) => {
  const { theme } = useTheme();
  const {
    navigateTo,
    goBack,
    showToast,
    selectedComponentId,
    selectedLevelId,
    selectedActivityId,
  } = useUI();
  const { completeActivity, recordAttempt } = useGame();
  const { canAttemptActivity, incrementDailyAttempts } = useUser();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sequenceAnswer, setSequenceAnswer] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentComponentId = selectedComponentId;
  const currentLevelId = selectedLevelId;
  const currentActivityId = selectedActivityId;

  const activity = useMemo(() => {
    const component = components.find((c) => c.id === currentComponentId);
    if (!component) return null;

    const level = component.levels.find((l: any) => l.id === currentLevelId);
    if (!level) return null;

    // If no specific activity ID, get the first activity in the level
    const targetActivityId = currentActivityId || (level.activities[0]?.id || null);
    
    return level.activities.find((a: any) => a.id === targetActivityId);
  }, [currentComponentId, currentLevelId, currentActivityId]);

  // Reset local state when activity changes
  React.useEffect(() => {
    if (activity) {
      setSelectedOption(null);
      setSequenceAnswer([]);
      setShowResult(false);
      setIsCorrect(false);
      setIsSubmitting(false);
      setError(null);
      
      // Play game background music
      audioService.playBackgroundMusic('game');
    }
  }, [activity?.id]);

  const handlePressBankItem = useCallback((item: string) => {
    if (!activity || activity.type !== 'order' || showResult) return;

    // Count how many times this item is in the bank vs how many times it's been selected
    const bankCount = activity.bank?.filter((i: string) => i === item).length || 0;
    const selectedCount = sequenceAnswer.filter((i: string) => i === item).length;

    if (selectedCount < bankCount) {
      setSequenceAnswer(prev => [...prev, item]);
      HapticService.tap();
      audioService.playSoundEffect('tap');
    }
  }, [activity, sequenceAnswer, showResult]);

  const handleRemoveSequenceItem = useCallback((index: number) => {
    if (showResult) return;
    
    setSequenceAnswer(prev => prev.filter((_, i) => i !== index));
    HapticService.tap();
    audioService.playSoundEffect('tap');
  }, [showResult]);

  // Memoized callbacks for event handlers - defined before error boundary
  const handleExit = useCallback(() => {
    goBack();
  }, [goBack]);

  // Error state fallback
  if (!activity) {
    return (
      <Container testID={testID}>
        <View style={styles.centerContent}>
          <Text variant="h2" testID="activity-error-title">
            ⚠️ Actividad no encontrada
          </Text>
          <Text
            variant="body"
            style={[styles.errorText, { marginTop: 12 }]}
            testID="activity-error-message"
          >
            Por favor intenta seleccionar otra actividad
          </Text>
          <View style={{ marginTop: 16, width: '100%', paddingHorizontal: 16 }}>
            <Button
              title="Volver"
              onPress={handleExit}
              variant="primary"
              testID="error-back-button"
            />
          </View>
        </View>
      </Container>
    );
  }
  const handleSubmit = useCallback(async () => {
    // Validation checks
    if (!activity) {
      setError('Actividad no encontrada');
      return;
    }

    if (!canAttemptActivity()) {
      showToast('Has llegado al límite de intentos hoy', 'warning');
      return;
    }

    if (activity.type === 'choice' && !selectedOption) {
      setError('Por favor selecciona una opción');
      return;
    }

    if (activity.type === 'order' && sequenceAnswer.length === 0) {
      setError('Por favor ordena los elementos');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Simulate API call with error handling
      await new Promise(resolve => setTimeout(resolve, 800));

      let correct = false;
      
      if (activity.type === 'choice') {
        correct = selectedOption === activity.correctAnswer;
      } else if (activity.type === 'order') {
        correct = JSON.stringify(sequenceAnswer) === JSON.stringify(activity.correctSequence);
      }

      setIsCorrect(correct);
      setShowResult(true);

      // Record attempt and update state
      recordAttempt(currentComponentId || '', correct);
      incrementDailyAttempts();

      if (correct) {
        const reward = activity.reward || 10;
        completeActivity(activity.id, reward);
        
        // Haptic feedback for success
        await HapticService.success();
        
        // Play success sound
        await audioService.playSoundEffect('success');
        
        showToast(`¡Correcto! +${reward} puntos`, 'success');
        
        // Sync progress to backend
        try {
          const gameState = useGameStore.getState();
          const userState = useUserStore.getState();
          
          if (userState.user) {
            await GameSyncService.syncProgress({
              userId: userState.user.id,
              completedActivities: gameState.completedActivities,
              score: gameState.score,
              stars: gameState.stars,
              streak: gameState.streak,
              totalAttempts: gameState.totalAttempts,
              totalCorrect: gameState.totalCorrect,
              componentMistakes: gameState.componentMistakes,
              unlockedAchievements: gameState.unlockedAchievements,
              lastSyncAt: new Date().toISOString(),
            });
          }
        } catch (syncError) {
          console.warn('Sync error (offline):', syncError);
          // Continue gracefully if offline
        }
      } else {
        // Haptic feedback for error
        await HapticService.error();
        
        // Play error sound
        await audioService.playSoundEffect('error');
        
        showToast('Intenta de nuevo', 'error');
      }
    } catch (err) {
      setError('Error al procesar tu respuesta');
      showToast('Algo salió mal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activity,
    canAttemptActivity,
    selectedOption,
    recordAttempt,
    incrementDailyAttempts,
    completeActivity,
    currentComponentId,
    showToast,
    sequenceAnswer,
  ]);

  const handleContinue = useCallback(() => {
    if (isCorrect) {
      // Find the next activity in the level
      const component = components.find((c) => c.id === currentComponentId);
      if (!component) return;

      const level = component.levels.find((l: any) => l.id === currentLevelId);
      if (!level) return;

      const currentActivityIndex = level.activities.findIndex(
        (a: any) => a.id === activity.id
      );

      if (currentActivityIndex >= 0 && currentActivityIndex < level.activities.length - 1) {
        // There's a next activity
        const nextActivity = level.activities[currentActivityIndex + 1];
        navigateTo('activity', {
          componentId: currentComponentId || '',
          levelId: currentLevelId || '',
          activityId: nextActivity.id,
        });
      } else {
        // No more activities in this level - go to results or next level
        navigateTo('results');
      }
    } else {
      // Reset for retry
      setShowResult(false);
      setSelectedOption(null);
      setSequenceAnswer([]);
      setError(null);
    }
  }, [isCorrect, navigateTo, currentComponentId, currentLevelId, currentActivityId]);

  const handleSelectOption = useCallback((option: string) => {
    setSelectedOption(option);
    setError(null);
    // Haptic feedback and sound on option selection
    HapticService.tap();
    audioService.playSoundEffect('tap');
  }, []);

  return (
    <Container
      style={{ backgroundColor: theme.colors.background }}
      testID={testID}
    >
      <View
        style={styles.header}
        testID="activity-header"
        accessible={true}
        accessibilityLabel="Encabezado de actividad"
      >
        <Button
          title="← Salir"
          onPress={handleExit}
          variant="outline"
          testID="exit-button"
        />
        <Text
          variant="h3"
          color={theme.colors.onBackground}
          testID="activity-title"
        >
          {activity.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Error Message */}
        {error && (
          <View
            style={[styles.card, { backgroundColor: theme.colors.error + '15' }]}
            testID="error-message"
            accessible={true}
            accessibilityLabel={`Error: ${error}`}
          >
            <Text variant="body" color={theme.colors.error}>
              ⚠️ {error}
            </Text>
          </View>
        )}

        {/* Instruction */}
        <View
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          testID="instruction-card"
          accessible={true}
          accessibilityLabel="Instrucciones"
        >
          <Text variant="h3" color={theme.colors.primary}>
            📝 Instrucción
          </Text>
          <Text variant="body" style={{ marginTop: 8 }} testID="instruction-text">
            {activity.instruction}
          </Text>
          {activity.supportText && (
            <Text
              variant="caption"
              color={theme.colors.info}
              style={{ marginTop: 8 }}
              testID="support-text"
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
              backgroundColor: theme.colors.surface,
              borderLeftWidth: 6,
              borderLeftColor: theme.colors.primary,
            },
          ]}
          testID="prompt-card"
          accessible={true}
          accessibilityLabel="Pregunta"
        >
          {activity.audioPrompt && (
            <Text
              variant="h3"
              color={theme.colors.onSurface}
              style={{ marginBottom: 12, lineHeight: 26 }}
              testID="activity-sentence"
            >
              {activity.audioPrompt}
            </Text>
          )}
          <Text
            variant="h2"
            color={theme.colors.primary}
            style={{ fontWeight: '700' }}
            testID="prompt-text"
          >
            {activity.prompt}
          </Text>
        </View>

        {/* Options */}
        {!showResult && activity.options && (
          <View
            testID="options-container"
            accessible={true}
            accessibilityLabel="Opciones de respuesta"
          >
            <Text
              variant="h3"
              style={{ marginBottom: 12, marginTop: 16 }}
              testID="options-label"
            >
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
                    borderColor:
                      selectedOption === option
                        ? theme.colors.primary
                        : theme.colors.gray300 || '#D1D5DB',
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleSelectOption(option)}
                testID={`option-${index}`}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Opción ${index + 1}: ${option}${selectedOption === option ? ' seleccionada' : ''}`}
              >
                <Text
                  variant="body"
                  style={{ fontWeight: '600' }} // Un poco más negrita
                  color={
                    selectedOption === option
                      ? theme.colors.white
                      : '#000000' // Negro puro para máximo contraste en opciones no seleccionadas
                  }
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Order Activity UI */}
        {!showResult && activity.type === 'order' && (
          <View testID="order-container">
            <Text variant="h3" style={{ marginBottom: 12, marginTop: 16 }}>
              Tu respuesta:
            </Text>
            <View style={styles.sequenceContainer}>
              {sequenceAnswer.map((item, index) => (
                <TouchableOpacity
                  key={`seq-${index}`}
                  style={[styles.sequenceItem, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleRemoveSequenceItem(index)}
                >
                  <Text variant="body" color={theme.colors.white}>{item}</Text>
                </TouchableOpacity>
              ))}
              {sequenceAnswer.length === 0 && (
                <Text variant="caption" color={theme.colors.gray500 || '#9CA3AF'}>
                  Toca los elementos de abajo para ordenarlos
                </Text>
              )}
            </View>

            <Text variant="h3" style={{ marginBottom: 12, marginTop: 24 }}>
              Elementos:
            </Text>
            <View style={styles.bankContainer}>
              {activity.bank?.map((item: string, index: number) => {
                // Determine if this specific instance is already used
                const usedCount = sequenceAnswer.filter(i => i === item).length;
                const totalCount = activity.bank.filter((i: string) => i === item).length;
                const instances = Array.from({ length: totalCount });
                const itemIndexInBank = activity.bank.indexOf(item);
                
                // Simplified: just show the items and let handlePressBankItem handle the logic
                return (
                  <TouchableOpacity
                    key={`bank-${index}`}
                    style={[
                      styles.bankItem,
                      { 
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.primary,
                        opacity: sequenceAnswer.filter(i => i === item).length >= activity.bank.filter((i: string) => i === item).length ? 0.5 : 1
                      }
                    ]}
                    onPress={() => handlePressBankItem(item)}
                  >
                    <Text variant="body" color={theme.colors.onBackground}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
            testID="result-card"
            accessible={true}
            accessibilityLabel={isCorrect ? 'Respuesta correcta' : 'Respuesta incorrecta'}
          >
            <Text
              variant="h1"
              color={isCorrect ? theme.colors.success : theme.colors.error}
              style={{ textAlign: 'center', marginBottom: 8 }}
              testID="result-title"
            >
              {isCorrect ? '¡Correcto! ✓' : 'Intenta de nuevo'}
            </Text>
            {isCorrect ? (
              <Text
                variant="body"
                color={theme.colors.success}
                style={{ textAlign: 'center' }}
                testID="reward-text"
              >
                Ganaste {activity.reward || 10} puntos
              </Text>
            ) : (
              <View testID="incorrect-section">
                <Text
                  variant="body"
                  color={theme.colors.error}
                  style={{ textAlign: 'center', marginBottom: 8 }}
                >
                  La respuesta correcta era:
                </Text>
                <Text
                  variant="h3"
                  color={theme.colors.error}
                  style={{ textAlign: 'center' }}
                  testID="correct-answer-text"
                >
                  {activity.type === 'choice' 
                    ? activity.correctAnswer 
                    : activity.correctSequence?.join(' ')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Loading Indicator */}
        {isSubmitting && (
          <View
            style={styles.loadingContainer}
            testID="loading-indicator"
            accessible={true}
            accessibilityLabel="Procesando respuesta"
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={styles.buttonContainer}
          testID="button-container"
          accessible={true}
          accessibilityLabel="Botones de acción"
        >
          {!showResult ? (
            <Button
              title={isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
              onPress={handleSubmit}
              variant="primary"
              disabled={isSubmitting || (activity.type === 'choice' ? !selectedOption : sequenceAnswer.length === 0)}
              testID="submit-button"
            />
          ) : (
            <Button
              title={isCorrect ? 'Siguiente' : 'Reintentar'}
              onPress={handleContinue}
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
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16, // Aumentado de 12
    padding: 20, // Aumentado de 16
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 }, // Aumentado para profundidad
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  optionButton: {
    borderRadius: 12, // Aumentado de 8
    padding: 18, // Aumentado de 16
    marginBottom: 16, // Aumentado de 12
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60, // Aumentado de 50
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultCard: {
    borderRadius: 12,
    padding: 24,
    marginVertical: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    marginVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minHeight: 60,
    alignItems: 'center',
    gap: 8,
  },
  sequenceItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  bankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bankItem: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  errorText: {
    textAlign: 'center',
  },
});

export default ActivityScreen;
