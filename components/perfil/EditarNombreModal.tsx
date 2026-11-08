import { ErrorMessage } from '@/components/ErrorMessage';
import { colors } from '@/theme/colors';
import { styles } from './perfilStyles';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  nombre: string;
  guardando: boolean;
  error: string | null;
  onClose: () => void;
  onNombreChange: (nombre: string) => void;
  onGuardar: () => void;
};

export function EditarNombreModal({
  visible,
  nombre,
  guardando,
  error,
  onClose,
  onNombreChange,
  onGuardar,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} accessible={false} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Editar nombre</Text>
          <ErrorMessage mensaje={error} />
          <TextInput
            accessibilityLabel="Nombre del perfil"
            value={nombre}
            onChangeText={onNombreChange}
            placeholder="Tu nombre"
            placeholderTextColor={colors.inkMuted}
            style={styles.input}
            autoFocus
          />
          <View style={styles.modalActions}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edición del nombre"
            >
              <Text style={[styles.btnText, { color: colors.ink }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, guardando && { opacity: 0.6 }]}
              onPress={onGuardar}
              disabled={guardando}
              accessibilityRole="button"
              accessibilityLabel="Guardar nombre del perfil"
            >
              <Text style={[styles.btnText, { color: colors.surface }]}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
