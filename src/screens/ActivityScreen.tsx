import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  Button, Text, Container, ChoiceActivity, OrderActivity,
  ProgressBar, TimerBar, StreakBadge, CelebrationOverlay,
} from '@/components';
import { useGame, useUser, useUI, useActivityTimer, useStreak, useActivityProgress } from '@/hooks';
import { useTheme } from '@/theme';
import { components } from '@/data/gameData';
import { HapticService, audioService, speechService } from '@/services';
import { GameSyncService } from '@/api';
import { useGameStore, useUserStore } from '@/store';

const ACTIVITY_IMAGES: Record<string, number> = {
  'fonologico-7-caza-sonidos': require('../../assets/activity-images/fonologico-7-caza-sonidos.png'),
  'fonologico-7-suena-igual': require('../../assets/activity-images/fonologico-7-suena-igual.png'),
  'fonologico-8-rompecabezas': require('../../assets/activity-images/fonologico-8-rompecabezas.png'),
  'fonologico-8-rimas': require('../../assets/activity-images/fonologico-8-rimas.png'),
  'fonologico-9-segmenta': require('../../assets/activity-images/fonologico-9-segmenta.png'),
  'fonologico-9-intruso': require('../../assets/activity-images/fonologico-9-intruso.png'),
  'semantico-7-empareja': require('../../assets/activity-images/semantico-7-empareja.png'),
  'semantico-7-que-es': require('../../assets/activity-images/semantico-7-que-es.png'),
  'semantico-8-categorias': require('../../assets/activity-images/semantico-8-categorias.png'),
  'semantico-8-intrusa': require('../../assets/activity-images/semantico-8-intrusa.png'),
  'semantico-9-sinonimos': require('../../assets/activity-images/semantico-9-sinonimos.png'),
  'semantico-9-contexto': require('../../assets/activity-images/semantico-9-contexto.png'),
  'sintactico-7-ordena': require('../../assets/activity-images/sintactico-7-ordena.png'),
  'sintactico-7-completa': require('../../assets/activity-images/sintactico-7-completa.png'),
  'sintactico-8-correctas': require('../../assets/activity-images/sintactico-8-correctas.png'),
  'sintactico-8-historia': require('../../assets/activity-images/sintactico-8-historia.png'),
  'sintactico-9-error': require('../../assets/activity-images/sintactico-9-error.png'),
  'sintactico-9-construccion': require('../../assets/activity-images/sintactico-9-construccion.png'),
  'pragmatico-7-que-dices': require('../../assets/activity-images/pragmatico-7-que-dices.png'),
  'pragmatico-7-turnos': require('../../assets/activity-images/pragmatico-7-turnos.png'),
  'pragmatico-8-situaciones': require('../../assets/activity-images/pragmatico-8-situaciones.png'),
  'pragmatico-8-emociones': require('../../assets/activity-images/pragmatico-8-emociones.png'),
  'pragmatico-9-responde': require('../../assets/activity-images/pragmatico-9-responde.png'),
  'pragmatico-9-dialogo': require('../../assets/activity-images/pragmatico-9-dialogo.png'),
};

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
  const { completeActivity, recordAttempt, completedActivities } = useGame();
  const { canAttemptActivity, incrementDailyAttempts } = useUser();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sequenceAnswer, setSequenceAnswer] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'correct' | 'incorrect'>('correct');
  const [starsEarned, setStarsEarned] = useState(0);

  const { currentStreak, addCorrect, resetStreak } = useStreak();
  const { timeLeft, getStars } = useActivityTimer(null);

  const currentComponentId = componentId || selectedComponentId;
  const currentLevelId = levelId || selectedLevelId;
  const currentActivityId = activityId || selectedActivityId;
  const currentActivityImage = currentActivityId
    ? (ACTIVITY_IMAGES[currentActivityId] || null)
    : null;

  const { level: currentLevel, activities: levelActivities } = useMemo(() => {
    const component = components.find(c => c.id === currentComponentId);
    if (!component) return { level: null, activities: [] as any[] };
    const level = component.levels.find((l: any) => l.id === currentLevelId);
    return { level: level || null, activities: level?.activities || [] };
  }, [currentComponentId, currentLevelId]);

  const activity = useMemo(() => {
    const targetActivityId = currentActivityId || (levelActivities[0]?.id || null);
    return levelActivities.find((a: any) => a.id === targetActivityId) || null;
  }, [levelActivities, currentActivityId]);

  const { completed: completedCount, total: totalActivities, currentIndex } = useActivityProgress(
    completedActivities,
    levelActivities,
    currentActivityId
  );

  useEffect(() => {
    if (!activity) {
      return;
    }

    setSelectedOption(null);
    setSequenceAnswer([]);
    setShowResult(false);
    setIsCorrect(false);
    setIsSubmitting(false);
    setError(null);

    if (activity.audioPrompt) {
      speechService.speak(activity.audioPrompt);
    }

    return () => {
      speechService.stop();
    };
  }, [activity]);

  const handleExit = useCallback(() => {
    speechService.stop();
    goBack();
  }, [goBack]);

  const handlePlayPrompt = useCallback(() => {
    if (!activity) return;
    const textToRead = activity.audioPrompt || activity.prompt || activity.instruction;
    speechService.speak(textToRead);
  }, [activity]);

  const handlePressBankItem = useCallback((item: string) => {
    if (!activity || activity.type !== 'order' || showResult) return;

    const bankCount = activity.bank?.filter((bankItem: string) => bankItem === item).length || 0;
    const selectedCount = sequenceAnswer.filter(selectedItem => selectedItem === item).length;

    if (selectedCount < bankCount) {
      setSequenceAnswer(prev => [...prev, item]);
      setError(null);
      HapticService.tap();
      speechService.speak(item);
    }
  }, [activity, sequenceAnswer, showResult]);

  const handleRemoveSequenceItem = useCallback((index: number) => {
    if (showResult) return;

    const removedItem = sequenceAnswer[index];
    setSequenceAnswer(prev => prev.filter((_, itemIndex) => itemIndex !== index));
    HapticService.tap();
    if (removedItem) {
      speechService.speak(removedItem);
    }
  }, [sequenceAnswer, showResult]);

  const handleSelectOption = useCallback((option: string) => {
    setSelectedOption(option);
    setError(null);
    HapticService.tap();
    speechService.speak(option);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activity) {
      setError('Actividad no encontrada');
      return;
    }

    if (!canAttemptActivity()) {
      showToast('Has llegado al limite de intentos hoy', 'warning');
      return;
    }

    if (activity.type === 'choice' && !selectedOption) {
      setError('Por favor selecciona una opcion');
      return;
    }

    if (activity.type === 'order' && sequenceAnswer.length === 0) {
      setError('Por favor ordena los elementos');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      let correct = false;
      if (activity.type === 'choice') {
        correct = selectedOption === activity.correctAnswer;
      } else if (activity.type === 'order') {
        correct = JSON.stringify(sequenceAnswer) === JSON.stringify(activity.correctSequence);
      }

      setIsCorrect(correct);
      setShowResult(true);
      recordAttempt(currentComponentId || '', correct);
      incrementDailyAttempts();

      if (correct) {
        addCorrect();
        const stars = getStars(true);
        setStarsEarned(stars);
        setCelebrationType('correct');
        setCelebrationVisible(true);

        const reward = activity.reward || 10;
        completeActivity(activity.id, reward);
        await HapticService.success();
        await audioService.playSoundEffect('success');

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
        }
      } else {
        resetStreak();
        setCelebrationType('incorrect');
        setCelebrationVisible(true);
        await HapticService.error();
        await audioService.playSoundEffect('error');
      }
    } catch (submitError) {
      console.error('Submit activity error:', submitError);
      setError('Error al procesar tu respuesta');
      showToast('Algo salio mal', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activity,
    canAttemptActivity,
    completeActivity,
    currentComponentId,
    incrementDailyAttempts,
    recordAttempt,
    selectedOption,
    sequenceAnswer,
    showToast,
    addCorrect,
    resetStreak,
    getStars,
  ]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationVisible(false);
    if (isCorrect) {
      if (!activity) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex < levelActivities.length) {
        const nextActivity = levelActivities[nextIndex];
        navigateTo('activity', {
          componentId: currentComponentId || '',
          levelId: currentLevelId || '',
          activityId: nextActivity.id,
        });
      } else {
        navigateTo('results');
      }
    } else {
      setShowResult(false);
      setSelectedOption(null);
      setSequenceAnswer([]);
      setError(null);
    }
  }, [activity, currentComponentId, currentLevelId, isCorrect, navigateTo, currentIndex, levelActivities]);

  const handleContinue = useCallback(() => {
    setCelebrationVisible(false);
    if (isCorrect) {
      if (!activity) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex < levelActivities.length) {
        const nextActivity = levelActivities[nextIndex];
        navigateTo('activity', {
          componentId: currentComponentId || '',
          levelId: currentLevelId || '',
          activityId: nextActivity.id,
        });
      } else {
        navigateTo('results');
      }
    } else {
      setShowResult(false);
      setSelectedOption(null);
      setSequenceAnswer([]);
      setError(null);
    }
  }, [activity, currentComponentId, currentLevelId, isCorrect, navigateTo, currentIndex, levelActivities]);

  if (!activity) {
    return (
      <Container testID={testID}>
        <View style={styles.centerContent}>
          <Text variant="h2" testID="activity-error-title">
            Actividad no encontrada
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
        <View style={styles.headerTop}>
          <Button
            title="Salir"
            onPress={handleExit}
            variant="outline"
            testID="exit-button"
          />
          <Text
            variant="h3"
            color={theme.colors.onBackground}
            testID="activity-title"
            style={styles.headerTitle}
          >
            {activity.title}
          </Text>
          <StreakBadge streak={currentStreak} theme={theme} />
        </View>
        <View style={styles.headerBars}>
          <ProgressBar
            current={completedCount}
            total={totalActivities}
            currentIndex={currentIndex}
            theme={theme}
          />
          <TimerBar
            timeLeft={timeLeft}
            timeLimit={null}
            theme={theme}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {error && (
          <View
            style={[styles.card, { backgroundColor: theme.colors.error + '15' }]}
            testID="error-message"
            accessible={true}
            accessibilityLabel={`Error: ${error}`}
          >
            <Text variant="body" color={theme.colors.error}>
              {error}
            </Text>
          </View>
        )}

        <View
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          testID="instruction-card"
          accessible={true}
          accessibilityLabel="Instrucciones"
        >
          <Text variant="h3" color={theme.colors.primary}>
            Instruccion
          </Text>
          <Text
            variant="body"
            color={theme.colors.onSurface}
            style={{ marginTop: 8 }}
            testID="instruction-text"
          >
            {activity.instruction}
          </Text>
          {activity.supportText ? (
            <Text
              variant="caption"
              color={theme.colors.onSurface}
              style={{ marginTop: 8 }}
              testID="support-text"
            >
              {activity.supportText}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderLeftWidth: 6,
              borderLeftColor: theme.colors.primary,
              overflow: 'hidden',
            },
          ]}
          testID="prompt-card"
          accessible={true}
          accessibilityLabel="Pregunta"
        >
          <Image
            source={require('../../assets/activity-images/Fondo.jpeg')}
            style={styles.cardBackground}
          />
          {currentActivityImage ? (
            <Image
              source={currentActivityImage}
              style={styles.activityImage}
              resizeMode="contain"
            />
          ) : null}

          {activity.audioPrompt ? (
            <View style={styles.audioPromptBlock}>
              <Text
                variant="h3"
                color={theme.colors.onSurface}
                style={styles.audioPromptText}
                testID="activity-sentence"
              >
                {activity.audioPrompt}
              </Text>
              <TouchableOpacity
                style={[styles.listenButton, { backgroundColor: theme.colors.primary }]}
                onPress={handlePlayPrompt}
              >
                <Text variant="caption" color={theme.colors.white}>Escuchar</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text
            variant="h2"
            color={theme.colors.primary}
            style={{ fontWeight: '700' }}
            testID="prompt-text"
          >
            {activity.prompt}
          </Text>
        </View>

        {!showResult && activity.type === 'choice' && activity.options ? (
          <ChoiceActivity
            options={activity.options}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            disabled={isSubmitting}
            theme={theme}
          />
        ) : null}

        {!showResult && activity.type === 'order' && activity.bank ? (
          <OrderActivity
            bank={activity.bank}
            sequenceAnswer={sequenceAnswer}
            onPressBankItem={handlePressBankItem}
            onRemoveSequenceItem={handleRemoveSequenceItem}
            disabled={isSubmitting}
            theme={theme}
          />
        ) : null}

        {showResult ? (
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
              {isCorrect ? 'Correcto!' : 'Intenta de nuevo'}
            </Text>
            {isCorrect && (
              <Text
                variant="body"
                color={theme.colors.success}
                style={{ textAlign: 'center' }}
                testID="reward-text"
              >
                Ganaste {activity.reward || 10} puntos
              </Text>
            )}
          </View>
        ) : null}

        {isSubmitting ? (
          <View
            style={styles.loadingContainer}
            testID="loading-indicator"
            accessible={true}
            accessibilityLabel="Procesando respuesta"
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : null}

        <View
          style={styles.buttonContainer}
          testID="button-container"
          accessible={true}
          accessibilityLabel="Botones de accion"
        >
          {!showResult ? (
            <Button
              title={isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
              onPress={handleSubmit}
              variant="primary"
              disabled={
                isSubmitting ||
                (activity.type === 'choice'
                  ? !selectedOption
                  : sequenceAnswer.length === 0)
              }
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

        <CelebrationOverlay
          visible={celebrationVisible}
          type={celebrationType}
          streak={currentStreak}
          stars={starsEarned}
          theme={theme}
          onComplete={handleCelebrationComplete}
        />
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
  },
  headerBars: {
    gap: 4,
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.15,
  },
  activityImage: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    marginBottom: 20,
  },
  audioPromptBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  audioPromptText: {
    flex: 1,
    lineHeight: 26,
  },
  listenButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resultCard: {
    borderRadius: 20,
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
  errorText: {
    textAlign: 'center',
  },
});

export default ActivityScreen;
