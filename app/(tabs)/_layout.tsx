import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

export default function TabsLayout() {
  const { usuario, cargando, firebaseListo } = useAuth();

  // Con Firebase configurado, este grupo de pantallas requiere sesión iniciada.
  // Sin Firebase configurado (modo demo), se permite el acceso libremente.
  if (firebaseListo && !cargando && !usuario) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="basket-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="lista-compras"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="categorias"
        options={{
          title: 'Categorías',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shape-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
