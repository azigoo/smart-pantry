import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const TECNOLOGIAS = [
  { nombre: 'TypeScript', detalle: 'Lenguaje principal, modo estricto' },
  { nombre: 'React Native', detalle: 'Framework de la aplicación móvil' },
  { nombre: 'Expo (SDK 57)', detalle: 'Entorno de desarrollo y build' },
  { nombre: 'Expo Router', detalle: 'Navegación basada en archivos' },
  { nombre: 'Jest + jest-expo', detalle: 'Pruebas unitarias' },
  { nombre: 'Baloo 2 / Nunito', detalle: 'Tipografía (Google Fonts)' },
];

export function AboutModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <MaterialCommunityIcons name="close" size={22} color={colors.inkMuted} />
          </Pressable>

          <View style={styles.badge}>
            <MaterialCommunityIcons name="egg-easter" size={32} color={colors.secondary} />
          </View>

          <Text style={styles.title}>¡Encontraste el huevo de Pascua! 🥚</Text>
          <Text style={styles.subtitle}>Acerca de Smart Pantry</Text>

          <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Desarrollado por</Text>
              <Text style={styles.sectionValue}>Grisel Ivonne Zárate Ángeles</Text>
              <Text style={styles.sectionMeta}>
                Universidad Autónoma del Estado de Hidalgo · Administración de la calidad de
                software
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Construido con</Text>
              {TECNOLOGIAS.map((tec) => (
                <View key={tec.nombre} style={styles.techRow}>
                  <View style={styles.techDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.techNombre}>{tec.nombre}</Text>
                    <Text style={styles.techDetalle}>{tec.detalle}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.footer}>Gracias por tocar tres veces 💛</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 42, 36, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.cardYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    ...type.h3,
    textAlign: 'center',
  },
  subtitle: {
    ...type.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  section: {
    width: '100%',
    marginBottom: 18,
  },
  sectionLabel: {
    ...type.label,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionValue: {
    ...type.h3,
  },
  sectionMeta: {
    ...type.caption,
    color: colors.inkMuted,
    marginTop: 2,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  techDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  techNombre: {
    ...type.bodyMedium,
  },
  techDetalle: {
    ...type.caption,
    color: colors.inkMuted,
  },
  footer: {
    ...type.caption,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
