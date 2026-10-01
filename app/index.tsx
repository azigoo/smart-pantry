import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const { usuario, cargando, firebaseListo } = useAuth();

  if (cargando) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  // Sin Firebase configurado (modo demo) siempre se manda al login; con Firebase
  // configurado, se respeta la sesión ya iniciada (persistida por Firebase Auth).
  const destino = firebaseListo && usuario ? '/(tabs)' : '/(auth)/login';

  return <Redirect href={destino} />;
}
