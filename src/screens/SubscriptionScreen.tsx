import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Button, Text, Container } from '@/components';
import { useUI, useUser } from '@/hooks';
import { useTheme } from '@/theme';
import { wompiService } from '@/services';

const PAYMENT_METHODS = [
  { id: 'nequi', name: 'Nequi', icon: '📱', color: '#E91E63', wompiType: 'NEQUI' },
  { id: 'daviplata', name: 'Daviplata', icon: '💳', color: '#ED1C24', wompiType: 'DAVIPLATA' },
  { id: 'bancolombia', name: 'Bancolombia', icon: '🏦', color: '#003B71', wompiType: 'BANCOLOMBIA_TRANSFER' },
];

const DOCUMENT_TYPES = ['CC', 'CE', 'NIT'];

interface Product {
  id: string;
  category: string;
  name: string;
  price: string;
  cents: number;
  description: string;
}

const PRODUCTS: Product[] = [
  { id: 'explorador', category: 'Juego', name: 'Juego Explorador', price: '$80,000', cents: 8000000, description: 'Acceso inicial a módulos y actividades seleccionadas para potenciar habilidades básicas' },
  { id: 'maestro', category: 'Juego', name: 'Juego Maestro', price: '$130,000', cents: 13000000, description: 'Acceso ampliado a más módulos y niveles para potenciar habilidades adicionales' },
  { id: 'heroe', category: 'Juego', name: 'Juego Héroe', price: '$190,000', cents: 19000000, description: 'Acceso completo a todos los módulos, niveles y actividades para potenciar todas las habilidades del lenguaje' },
  { id: 'guia-interfaz', category: 'Paquete complementario', name: 'Guía Interfaz', price: '$120,000', cents: 12000000, description: 'Capacitación sobre el uso adecuado de la plataforma para padres, docentes y profesionales' },
  { id: 'reporte-progreso', category: 'Paquete complementario', name: 'Reporte de Progreso', price: '$200,000', cents: 20000000, description: 'Informe sobre los resultados obtenidos y la potenciación de habilidades trabajadas' },
  { id: 'potencia-personalizada', category: 'Paquete complementario', name: 'Potencia Personalizada', price: '$642,000', cents: 64200000, description: 'Intervención fonoaudiológica profesional para reforzar habilidades o trabajar dificultades específicas' },
  { id: 'bonus', category: 'Servicio adicional', name: 'Bonus', price: '$80,000', cents: 8000000, description: 'Actualizaciones de la plataforma: nuevos niveles, contenidos y mejoras' },
];

const CATEGORIES = ['Juego', 'Paquete complementario'] as const;

const BONUS = PRODUCTS.find(p => p.id === 'bonus')!;

const formatPrice = (cents: number) =>
  '$' + (cents / 100).toLocaleString('es-CO');

export const SubscriptionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo, showToast } = useUI();
  const { isPremium, user, setSubscriptionTier } = useUser();

  const [selectedProduct, setSelectedProduct] = useState<string>('heroe');
  const [selectedBonus, setSelectedBonus] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('nequi');
  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'approved' | 'declined'>('idle');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transactionIdRef = useRef<string | null>(null);

  const checkUrlCallback = useCallback(async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment_callback') === '1') {
        const tid = params.get('transaction_id');
        if (tid && !transactionIdRef.current) {
          transactionIdRef.current = tid;
          setPaymentStatus('pending');
          setLoading(true);
          try {
            const result = await wompiService.verifyTransaction(tid);
            if (result.status === 'APPROVED') {
              setPaymentStatus('approved');
              setSubscriptionTier('premium');
              showToast('¡Bienvenido a LinguaPlay Premium!', 'success');
              window.history.replaceState({}, '', window.location.pathname);
              navigateTo('home');
            } else {
              setPaymentStatus('declined');
              showToast('El pago no fue completado', 'error');
            }
          } catch {
            showToast('Error al verificar el pago', 'error');
          } finally {
            setLoading(false);
          }
        }
      }
    }
  }, [navigateTo, showToast, setSubscriptionTier]);

  useEffect(() => {
    checkUrlCallback();
  }, [checkUrlCallback]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const startPolling = useCallback(async (transactionId: string) => {
    return new Promise<void>((resolve) => {
      pollingRef.current = setInterval(async () => {
        try {
          const result = await wompiService.verifyTransaction(transactionId);
          if (result.status === 'APPROVED') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPaymentStatus('approved');
            setSubscriptionTier('premium');
            showToast('¡Bienvenido a LinguaPlay Premium!', 'success');
            resolve();
          } else if (result.status === 'DECLINED' || result.status === 'ERROR') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPaymentStatus('declined');
            showToast('El pago no fue completado', 'error');
            resolve();
          }
        } catch {
          // continue polling
        }
      }, 3000);
    });
  }, [showToast, setSubscriptionTier]);

  const handleConfirmPayment = async () => {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    if (!product || !method || !user?.email) return;

    const totalCents = product.cents + (selectedBonus ? BONUS.cents : 0);
    const productLabel = product.name + (selectedBonus ? ` + ${BONUS.name}` : '');

    if (method.id === 'nequi' && phoneNumber.length < 10) {
      showToast('Ingresa tu número de Nequi (10 dígitos)', 'warning');
      setLoading(false);
      return;
    }
    if (method.id === 'daviplata') {
      if (phoneNumber.length < 10) {
        showToast('Ingresa tu número de Daviplata (10 dígitos)', 'warning');
        setLoading(false);
        return;
      }
      if (docNumber.length < 5) {
        showToast('Ingresa tu número de documento', 'warning');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const reference = `linguaplay-${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const result = await wompiService.createTransaction({
        amountInCents: totalCents,
        customerEmail: user.email,
        customerFullname: user.displayName || user.email,
        paymentMethodType: method.wompiType as any,
        phoneNumber: phoneNumber || undefined,
        userLegalId: method.id === 'daviplata' ? docNumber : undefined,
        userLegalIdType: method.id === 'daviplata' ? docType : undefined,
        userType: method.id === 'bancolombia' ? 'PERSON' : undefined,
        paymentDescription: `LinguaPlay ${productLabel} - ${user.email}`,
        reference,
      });

      transactionIdRef.current = result.transaction_id;

      if (Platform.OS === 'web') {
        window.open(result.checkout_url, '_self');
      } else {
        startPolling(result.transaction_id);
        setPaymentStatus('pending');
        showToast('Redirigiendo a la pasarela de pago...', 'info');
      }
    } catch (error: any) {
      console.error('Wompi error:', error);
      showToast(error.message || 'Error al procesar el pago', 'error');
      setPaymentStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!selectedMethod) {
      showToast('Selecciona un método de pago', 'warning');
      return;
    }
    setShowConfirm(true);
  };

  if (isPremium) {
    return (
      <Container style={{ backgroundColor: theme.colors.background }} testID="subscription-screen">
        <View style={styles.centered}>
          <Text variant="h1" style={{ textAlign: 'center' }}>👑</Text>
          <Text variant="h2" color={theme.colors.primary} style={{ textAlign: 'center', marginTop: 16 }}>
            ¡Ya eres Premium!
          </Text>
          <Text variant="body" color={theme.colors.onSurface} style={{ textAlign: 'center', marginTop: 8 }}>
            Disfrutas de todos los beneficios.
          </Text>
          <Button
            title="Volver al inicio"
            onPress={() => navigateTo('home')}
            variant="primary"
            style={{ marginTop: 24, alignSelf: 'center' }}
          />
        </View>
      </Container>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <Container style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="h3" color={theme.colors.onBackground} style={{ marginTop: 16, textAlign: 'center' }}>
            Esperando confirmación del pago...
          </Text>
          <Text variant="caption" color={theme.colors.onSurface} style={{ marginTop: 8, textAlign: 'center' }}>
            Si ya realizaste el pago, espera unos segundos mientras verificamos.
          </Text>
        </View>
      </Container>
    );
  }

  if (showConfirm) {
    const product = PRODUCTS.find(p => p.id === selectedProduct);
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    const totalCents = (product?.cents ?? 0) + (selectedBonus ? BONUS.cents : 0);
    return (
      <Container style={{ backgroundColor: theme.colors.background }} testID="subscription-confirm">
        <View style={styles.centered}>
          <Text variant="h2" color={theme.colors.primary}>Confirmar compra</Text>

          <View style={[styles.confirmCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="caption" color={theme.colors.onSurface} style={{ marginBottom: 4 }}>{product?.category}</Text>
            <Text variant="h3">{product?.name}</Text>
            <Text variant="body" color={theme.colors.onSurface} style={{ marginTop: 4 }}>{product?.description}</Text>
            {selectedBonus && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E0E0E0', width: '100%', justifyContent: 'center', gap: 6 }}>
                <Text variant="body" color={theme.colors.primary}>+ {BONUS.name}</Text>
                <Text variant="body" color={theme.colors.accent}>{BONUS.price}</Text>
              </View>
            )}
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: theme.colors.primary, width: '100%', alignItems: 'center' }}>
              <Text variant="h1" color={theme.colors.accent}>{formatPrice(totalCents)}</Text>
              <Text variant="caption" color={theme.colors.onSurface}>Total</Text>
            </View>
          </View>

          <View style={[styles.confirmCard, { backgroundColor: theme.colors.surface, marginTop: 12 }]}>
            <Text variant="h3">Método: {method?.icon} {method?.name}</Text>
            <Text variant="caption" color={theme.colors.onSurface} style={{ marginTop: 8 }}>
              Serás redirigido a la pasarela de pagos para completar la transacción.
            </Text>
          </View>

          {(method?.id === 'nequi' || method?.id === 'daviplata') && (
            <View style={[styles.confirmCard, { backgroundColor: theme.colors.surface, marginTop: 12, width: '100%' }]}>
              <Text variant="h3">📱 Número de celular</Text>
              <TextInput
                style={[styles.phoneInput, { borderColor: theme.colors.primary, color: theme.colors.onBackground }]}
                placeholder="3001234567"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <Text variant="caption" color={theme.colors.onSurface} style={{ marginTop: 4 }}>
                Ingresa el número asociado a tu cuenta {method?.name}
              </Text>
            </View>
          )}

          {method?.id === 'daviplata' && (
            <View style={[styles.confirmCard, { backgroundColor: theme.colors.surface, marginTop: 12, width: '100%' }]}>
              <Text variant="h3">🆔 Documento de identidad</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, width: '100%' }}>
                {DOCUMENT_TYPES.map(dt => (
                  <TouchableOpacity
                    key={dt}
                    style={[
                      styles.docTypeBtn,
                      {
                        backgroundColor: docType === dt ? theme.colors.primary : theme.colors.surface,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setDocType(dt)}
                  >
                    <Text
                      variant="caption"
                      color={docType === dt ? '#FFF' : theme.colors.primary}
                    >
                      {dt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.phoneInput, { borderColor: theme.colors.primary, color: theme.colors.onBackground, marginTop: 8 }]}
                placeholder="Número de documento"
                placeholderTextColor="#999"
                value={docNumber}
                onChangeText={setDocNumber}
                keyboardType="number-pad"
              />
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <Button title="Cancelar" variant="outline" onPress={() => { setShowConfirm(false); setPaymentStatus('idle'); }} disabled={loading} />
            <Button title={loading ? 'Procesando...' : 'Pagar ahora'} variant="primary" onPress={handleConfirmPayment} disabled={loading} />
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container style={{ backgroundColor: theme.colors.background }} testID="subscription-screen">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          onPress={() => navigateTo('home')}
          style={styles.backButton}
          testID="back-button"
        >
          <Text variant="body" color={theme.colors.primary}>← Volver al inicio</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Image
            source={require('../../assets/activity-images/Fondo.jpeg')}
            style={styles.backgroundImage}
          />
          <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
          <Text variant="h1" color={theme.colors.primary}>Planes y Paquetes</Text>
          <Text variant="body" color={theme.colors.onBackground}>
            Elige el producto ideal para ti
          </Text>
        </View>

        {CATEGORIES.map((cat) => {
          const catProducts = PRODUCTS.filter(p => p.category === cat);
          if (catProducts.length === 0) return null;
          return (
            <View key={cat} style={styles.categorySection}>
              <Text variant="h3" color={theme.colors.primary} style={styles.categoryTitle}>
                {cat === 'Juego' ? '🎮 ' : '📦 '}
                {cat === 'Juego' ? 'Juegos' : 'Paquetes Complementarios'}
              </Text>
              {catProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[
                    styles.productCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: selectedProduct === product.id ? theme.colors.primary : '#E0E0E0',
                      borderWidth: selectedProduct === product.id ? 3 : 1,
                    },
                  ]}
                  onPress={() => setSelectedProduct(product.id)}
                >
                  <View style={styles.productHeader}>
                    <Text variant="h3" color={theme.colors.onBackground} style={{ flex: 1 }}>{product.name}</Text>
                    <Text variant="h2" color={theme.colors.accent}>{product.price}</Text>
                  </View>
                  <Text variant="caption" color={theme.colors.onSurface} style={styles.productDesc}>
                    {product.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        <View style={[styles.bonusSection, { backgroundColor: theme.colors.surface, borderColor: selectedBonus ? '#50C878' : '#E0E0E0' }]}>
          <TouchableOpacity
            style={styles.bonusToggle}
            onPress={() => setSelectedBonus(!selectedBonus)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { backgroundColor: selectedBonus ? '#50C878' : 'transparent', borderColor: selectedBonus ? '#50C878' : theme.colors.onSurface }]}>
              {selectedBonus && <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '900' }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.productHeader}>
                <Text variant="h3" color={theme.colors.onBackground}>🔄 {BONUS.name}</Text>
                <Text variant="h2" color={theme.colors.accent}>{BONUS.price}</Text>
              </View>
              <Text variant="caption" color={theme.colors.onSurface} style={styles.productDesc}>
                {BONUS.description}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text variant="h3" color={theme.colors.onBackground} style={styles.sectionTitle}>
          Método de pago
        </Text>

        <View style={styles.methodsContainer}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                {
                  backgroundColor: selectedMethod === method.id ? method.color + '15' : theme.colors.surface,
                  borderColor: selectedMethod === method.id ? method.color : '#E0E0E0',
                  borderWidth: selectedMethod === method.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Text variant="h2">{method.icon}</Text>
              <Text
                variant="body"
                color={selectedMethod === method.id ? method.color : theme.colors.onBackground}
              >
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Comprar ahora"
          onPress={handleSubscribe}
          variant="primary"
          style={styles.subscribeButton}
        />

        <Text variant="caption" color={theme.colors.onSurface} style={styles.disclaimer}>
          Pago procesado de forma segura a través de Wompi.
          Tus datos están protegidos.
        </Text>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 24,
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: '#FFD93D',
    backgroundColor: '#FFF0DB',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.3,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFD93D',
  },
  productCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productDesc: {
    marginTop: 6,
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    marginBottom: 10,
  },
  bonusSection: {
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
    padding: 16,
  },
  bonusToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    flex: 1,
    minWidth: '45%',
  },
  subscribeButton: {
    marginTop: 24,
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  phoneInput: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  docTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
});

export default SubscriptionScreen;
