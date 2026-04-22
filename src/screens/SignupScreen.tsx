import React, { useState, useCallback } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Switch } from 'react-native';
import { Button, Text, Container } from '@/components';
import { useUI, useUser } from '@/hooks';
import { useTheme } from '@/theme';
import { AuthService } from '@/api';

export const SignupScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo } = useUI();
  const { setUser, setSubscriptionTier } = useUser();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = useCallback(async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando datos de registro...');
      const response = await AuthService.signup({ 
        displayName, 
        email, 
        password,
        role: isAdmin ? 'admin' : 'user'
      });
      console.log('Registro exitoso, actualizando usuario y navegando...');

      // Update user state and subscription tier
      setUser({
        id: response.user.id,
        displayName: response.user.displayName,
        email: response.user.email,
        role: response.user.role,
      });
      setSubscriptionTier(response.subscriptionTier);
      
      // The state update above will trigger a re-render of AppContainer, 
      // which will show the main app. We navigate to the specific dashboard next.
      if (response.user.role === 'admin') {
        navigateTo('admin_dashboard');
      } else {
        navigateTo('home');
      }
    } catch (error: any) {
      console.error('Error capturado en SignupScreen:', error);
      Alert.alert('Error de registro', error.message || 'No se pudo crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  }, [displayName, email, password, isAdmin, setUser, setSubscriptionTier, navigateTo]);

  return (
    <Container style={{ backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="h1" color={theme.colors.primary}>Crear Cuenta</Text>
            <Text variant="body" color={theme.colors.onBackground}>Únete a la aventura de LinguaPlay</Text>
          </View>

          <View style={styles.form}>
            <Text variant="h3" style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.gray300, color: theme.colors.onBackground }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Ej: Juan Pérez"
            />

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

            <View style={styles.adminSwitch}>
              <Text variant="body">¿Registrar como Administrador?</Text>
              <Switch
                value={isAdmin}
                onValueChange={setIsAdmin}
                trackColor={{ false: theme.colors.gray300, true: theme.colors.primaryLight }}
                thumbColor={isAdmin ? theme.colors.primary : theme.colors.white}
              />
            </View>

            <Button
              title={isLoading ? "Registrando..." : "Registrarse"}
              onPress={handleSignup}
              disabled={isLoading}
              style={{ marginTop: 24 }}
            />

            <TouchableOpacity 
              onPress={() => navigateTo('login')}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text variant="body" color={theme.colors.primary}>
                ¿Ya tienes cuenta? Inicia sesión
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
    marginBottom: 30,
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
  }
});
