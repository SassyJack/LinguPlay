import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useUI, useUser } from '@/hooks';
import { useTheme } from '@/theme';
import { AuthService } from '@/api';

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo, showToast } = useUI();
  const { setUser, setSubscriptionTier } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const clearError = useCallback(() => {
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [errorMessage]);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      const message = 'Por favor ingresa tu correo y contrasena.';
      setErrorMessage(message);
      showToast(message, 'warning');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await AuthService.login({ email, password });
      setUser({
        id: response.user.id,
        displayName: response.user.displayName,
        email: response.user.email,
        role: response.user.role,
      });
      setSubscriptionTier(response.subscriptionTier);

      if (response.user.role === 'admin') {
        navigateTo('admin_dashboard');
      } else {
        navigateTo('home');
      }
    } catch (error: any) {
      const message = error.message || 'No fue posible iniciar sesion.';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, setUser, setSubscriptionTier, navigateTo, showToast]);

  return (
    <Container style={{ backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
            <Text variant="h1" color={theme.colors.primary}>LinguaPlay</Text>
            <Text variant="body" color={theme.colors.onBackground}>Bienvenido de nuevo</Text>
          </View>

          <View style={styles.form}>
            {errorMessage ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: theme.colors.error + '15',
                    borderColor: theme.colors.error,
                  },
                ]}
              >
                <Text variant="body" color={theme.colors.error}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <Text variant="h3" style={styles.label}>Correo electronico</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.colors.gray300, color: theme.colors.onBackground },
              ]}
              value={email}
              onChangeText={(value) => {
                clearError();
                setEmail(value);
              }}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text variant="h3" style={styles.label}>Contrasena</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.colors.gray300, color: theme.colors.onBackground },
              ]}
              value={password}
              onChangeText={(value) => {
                clearError();
                setPassword(value);
              }}
              placeholder="********"
              secureTextEntry
            />

            <Button
              title={isLoading ? 'Iniciando...' : 'Iniciar sesion'}
              onPress={handleLogin}
              disabled={isLoading}
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity
              onPress={() => navigateTo('signup')}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text variant="body" color={theme.colors.primary}>
                No tienes cuenta? Registrate aqui
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={Boolean(errorMessage)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorMessage('')}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="h3" color={theme.colors.error}>No se pudo iniciar sesion</Text>
            <Text
              variant="body"
              color={theme.colors.onBackground}
              style={styles.modalMessage}
            >
              {errorMessage}
            </Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setErrorMessage('')}
            >
              <Text variant="body" color={theme.colors.white}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
  },
  modalMessage: {
    marginTop: 12,
    marginBottom: 20,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
