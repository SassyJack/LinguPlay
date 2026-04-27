import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Button, Text, Container, Card } from '@/components';
import { useUI, useUser } from '@/hooks';
import { useTheme } from '@/theme';
import { get, ref, remove, update } from 'firebase/database';
import { database } from '@/api/firebaseConfig';
import type { UserProfile } from '@/api';

export const AdminDashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo, showToast } = useUI();
  const { logout, user: currentUser } = useUser();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, premium: 0, free: 0 });

  const buildStats = useCallback((usersList: UserProfile[]) => {
    const activeUsers = usersList.filter(user => user.accountStatus !== 'deleted');
    const premium = activeUsers.filter(user => user.subscriptionTier === 'premium').length;
    const free = activeUsers.filter(user => user.subscriptionTier === 'free').length;

    setStats({
      total: activeUsers.length,
      premium,
      free,
    });
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersList = (Object.values(usersData) as UserProfile[])
          .filter(user => user.accountStatus !== 'deleted')
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        setUsers(usersList);
        buildStats(usersList);
      } else {
        setUsers([]);
        buildStats([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('No se pudo cargar la lista de usuarios.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [buildStats, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = () => {
    logout();
    navigateTo('login');
  };

  const handleTogglePlan = useCallback(async (userProfile: UserProfile) => {
    const nextTier: UserProfile['subscriptionTier'] =
      userProfile.subscriptionTier === 'premium' ? 'free' : 'premium';
    setProcessingUserId(userProfile.id);

    try {
      await update(ref(database, `users/${userProfile.id}`), {
        subscriptionTier: nextTier,
        updatedAt: new Date().toISOString(),
      });

      const updatedUsers = users.map(user =>
        user.id === userProfile.id
          ? { ...user, subscriptionTier: nextTier, updatedAt: new Date().toISOString() }
          : user
      );

      setUsers(updatedUsers);
      buildStats(updatedUsers);
      showToast(
        `${userProfile.displayName} ahora tiene plan ${nextTier}.`,
        'success'
      );
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      showToast('No se pudo actualizar el plan del usuario.', 'error');
    } finally {
      setProcessingUserId(null);
    }
  }, [buildStats, showToast, users]);

  const handleDeleteUser = useCallback(async (userProfile: UserProfile) => {
    if (currentUser?.id === userProfile.id) {
      showToast('No puedes desactivar tu propia cuenta desde este panel.', 'warning');
      return;
    }

    setProcessingUserId(userProfile.id);

    try {
      await update(ref(database, `users/${userProfile.id}`), {
        accountStatus: 'deleted',
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await remove(ref(database, `gameProgress/${userProfile.id}`));

      const updatedUsers = users.filter(user => user.id !== userProfile.id);
      setUsers(updatedUsers);
      buildStats(updatedUsers);
      showToast(
        `${userProfile.displayName} fue desactivado y ya no podra iniciar sesion.`,
        'success'
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('No se pudo desactivar el usuario.', 'error');
    } finally {
      setProcessingUserId(null);
    }
  }, [buildStats, currentUser?.id, showToast, users]);

  const renderUserItem = ({ item }: { item: UserProfile }) => {
    const isProcessing = processingUserId === item.id;
    const isSelf = currentUser?.id === item.id;
    const tierButtonLabel =
      item.subscriptionTier === 'premium' ? 'Pasar a Free' : 'Pasar a Premium';

    return (
      <Card style={styles.userCard}>
        <View style={styles.userTopRow}>
          <View style={styles.userInfo}>
            <Text variant="h3">{item.displayName}</Text>
            <Text variant="caption" color={theme.colors.gray600}>{item.email}</Text>
            <Text variant="caption" color={theme.colors.gray600}>
              Rol: {item.role === 'admin' ? 'Administrador' : 'Usuario'}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.subscriptionTier === 'premium'
                    ? theme.colors.accent
                    : theme.colors.gray300,
              },
            ]}
          >
            <Text
              variant="caption"
              color={
                item.subscriptionTier === 'premium'
                  ? theme.colors.white
                  : theme.colors.onBackground
              }
            >
              {item.subscriptionTier.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isProcessing ? 0.6 : 1,
              },
            ]}
            onPress={() => handleTogglePlan(item)}
            disabled={isProcessing}
          >
            <Text variant="caption" color={theme.colors.white}>
              {isProcessing ? 'Actualizando...' : tierButtonLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isSelf ? theme.colors.gray400 : theme.colors.error,
                opacity: isProcessing ? 0.6 : 1,
              },
            ]}
            onPress={() => handleDeleteUser(item)}
            disabled={isProcessing || isSelf}
          >
            <Text variant="caption" color={theme.colors.white}>
              {isProcessing ? 'Procesando...' : isSelf ? 'Tu cuenta' : 'Eliminar'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <Container style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <Text variant="h2">Dashboard Admin</Text>
        <Button title="Salir" onPress={handleLogout} variant="outline" />
      </View>

      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { borderLeftColor: theme.colors.primary, borderLeftWidth: 4 }]}>
          <Text variant="caption">Total Usuarios</Text>
          <Text variant="h1">{stats.total}</Text>
        </Card>
        <Card style={[styles.statCard, { borderLeftColor: theme.colors.accent, borderLeftWidth: 4 }]}>
          <Text variant="caption">Premium</Text>
          <Text variant="h1">{stats.premium}</Text>
        </Card>
        <Card style={[styles.statCard, { borderLeftColor: theme.colors.info, borderLeftWidth: 4 }]}>
          <Text variant="caption">Free</Text>
          <Text variant="h1">{stats.free}</Text>
        </Card>
      </View>

      <Text variant="h3" style={styles.sectionTitle}>Gestion de usuarios</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={fetchUsers}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40 }}>
              No hay usuarios registrados
            </Text>
          }
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    padding: 16,
    marginBottom: 12,
  },
  userTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
