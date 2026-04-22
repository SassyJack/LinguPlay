import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Button, Text, Container, Card } from '@/components';
import { useUI, useUser } from '@/hooks';
import { useTheme } from '@/theme';
import { ref, get, database } from '@/api/firebaseConfig';

export const AdminDashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { navigateTo, goBack } = useUI();
  const { logout } = useUser();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, premium: 0, free: 0 });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersList = Object.values(usersData);
        setUsers(usersList);
        
        const premium = usersList.filter((u: any) => u.subscriptionTier === 'premium').length;
        const free = usersList.filter((u: any) => u.subscriptionTier === 'free').length;
        
        setStats({
          total: usersList.length,
          premium,
          free
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = () => {
    logout();
    navigateTo('login');
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <Card style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text variant="h3">{item.displayName}</Text>
        <Text variant="caption" color={theme.colors.gray600}>{item.email}</Text>
      </View>
      <View style={[
        styles.badge, 
        { backgroundColor: item.subscriptionTier === 'premium' ? theme.colors.accent : theme.colors.gray300 }
      ]}>
        <Text variant="caption" color={item.subscriptionTier === 'premium' ? theme.colors.white : theme.colors.onBackground}>
          {item.subscriptionTier.toUpperCase()}
        </Text>
      </View>
    </Card>
  );

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
      </View>

      <Text variant="h3" style={styles.sectionTitle}>Listado de Usuarios</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={fetchUsers}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40 }}>No hay usuarios registrados</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  }
});
