import { colors } from '@/theme/colors';
import { type } from '@/theme/typography';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={type.h1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  subtitle: {
    ...type.body,
    color: colors.inkMuted,
    marginTop: 4,
  },
});
