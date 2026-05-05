import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useUI, useUser } from '@/hooks';
import { useTheme } from '@/theme';
import { AuthService } from '@/api';

export const SignupScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo, showToast } = useUI();
  const { setUser, setSubscriptionTier } = useUser();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const clearError = useCallback(() => {
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [errorMessage]);

  const handleSignup = useCallback(async () => {
    if (!displayName || !email || !password) {
      const message = 'Por favor completa todos los campos.';
      setErrorMessage(message);
      showToast(message, 'warning');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await AuthService.signup({
        displayName,
        email,
        password,
        role: isAdmin ? 'admin' : 'user',
      });

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
      const message = error.message || 'No se pudo crear la cuenta.';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [displayName, email, password, isAdmin, setUser, setSubscriptionTier, navigateTo, showToast]);

  return (
    <Container style={{ backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
            <Text variant="h1" color={theme.colors.primary}>Crear cuenta</Text>
            <Text variant="body" color={theme.colors.onBackground}>Únete a la aventura de LinguaPlay</Text>
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

            <Text variant="h3" style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: theme.colors.gray300, color: theme.colors.onBackground },
              ]}
              value={displayName}
              onChangeText={(value) => {
                clearError();
                setDisplayName(value);
              }}
              placeholder="Ej: Juan Perez"
            />

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

            <View style={styles.adminSwitch}>
              <Text variant="body">Registrar como administrador?</Text>
              <Switch
                value={isAdmin}
                onValueChange={setIsAdmin}
                trackColor={{ false: theme.colors.gray300, true: theme.colors.primaryLight }}
                thumbColor={isAdmin ? theme.colors.primary : theme.colors.white}
              />
            </View>

            <Button
              title={isLoading ? 'Registrando...' : 'Registrarse'}
              onPress={handleSignup}
              disabled={isLoading}
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity
              onPress={() => navigateTo('login')}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text variant="body" color={theme.colors.primary}>
                Ya tienes cuenta? Inicia sesion
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
            <Text variant="h3" color={theme.colors.error}>No se pudo crear la cuenta</Text>
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
    marginBottom: 30,
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
  adminSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 4,
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
