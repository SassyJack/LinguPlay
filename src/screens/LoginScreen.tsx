import React, { useState, useCallback } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Button, Text, Container } from '@/components';
import { useUI, useUser } from '@/hooks';
import { useTheme } from '@/theme';
import { AuthService } from '@/api';

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo } = useUI();
  const { setUser, setSubscriptionTier } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    setIsLoading(true);
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
      Alert.alert('Error de inicio de sesión', error.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, setUser, setSubscriptionTier, navigateTo]);

  return (
    <Container style={{ backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="h1" color={theme.colors.primary}>LinguaPlay</Text>
            <Text variant="body" color={theme.colors.onBackground}>Bienvenido de nuevo</Text>
          </View>

          <View style={styles.form}>
            <Text variant="h3" style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.gray300, color: theme.colors.onBackground }]}
              value={email}
              onChangeText={setEmail}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text variant="h3" style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.gray300, color: theme.colors.onBackground }]}
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry
            />

            <Button
              title={isLoading ? "Iniciando..." : "Iniciar Sesión"}
              onPress={handleLogin}
              disabled={isLoading}
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity 
              onPress={() => navigateTo('signup')}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text variant="body" color={theme.colors.primary}>
                ¿No tienes cuenta? Regístrate aquí
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  }
});
