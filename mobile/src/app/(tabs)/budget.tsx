import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, font, radius, spacing } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import type { BudgetCategory } from '@/types/domain';

const categories: BudgetCategory[] = ['Transporte', 'Hospedaje', 'Alimentación', 'Guía', 'Entrada', 'Otro'];

export default function BudgetScreen() {
  const { budgetItems, addBudgetItem, removeBudgetItem } = useAppData();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('Transporte');
  const [message, setMessage] = useState<string | null>(null);
  const total = useMemo(() => budgetItems.reduce((sum, item) => sum + item.amount, 0), [budgetItems]);

  const save = async () => {
    const numericAmount = Number(amount.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage('Escribí un concepto y un monto válido.');
      return;
    }
    await addBudgetItem(name, numericAmount, category);
    setName('');
    setAmount('');
    setMessage('Gasto guardado en el teléfono.');
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View>
            <AppText variant="title">Presupuesto</AppText>
            <AppText variant="caption">Tus cambios permanecen disponibles sin internet.</AppText>
          </View>

          <View style={styles.totalCard}>
            <View>
              <AppText variant="label" style={styles.totalLabel}>TOTAL ESTIMADO</AppText>
              <AppText variant="title">C$ {total.toLocaleString('es-NI')}</AppText>
            </View>
            <View style={styles.wallet}><MaterialCommunityIcons name="wallet-outline" size={29} color={colors.orange} /></View>
          </View>

          <View style={styles.formCard}>
            <AppText variant="headline">Agregar gasto</AppText>
            <TextInput value={name} onChangeText={setName} placeholder="Ej. Transporte a La Garnacha" placeholderTextColor={colors.textMuted} style={styles.input} accessibilityLabel="Concepto del gasto" />
            <TextInput value={amount} onChangeText={setAmount} placeholder="Monto en córdobas" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Monto del gasto en córdobas" />
            <View style={styles.categories}>
              {categories.map((item) => (
                <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]} accessibilityRole="button" accessibilityState={{ selected: category === item }}>
                  <AppText variant="label" style={category === item ? styles.categoryTextActive : styles.categoryText}>{item}</AppText>
                </Pressable>
              ))}
            </View>
            {message && <AppText variant="caption" style={styles.message}>{message}</AppText>}
            <PrimaryButton label="Guardar en el teléfono" icon="content-save-outline" onPress={save} />
          </View>

          <View style={styles.listSection}>
            <AppText variant="headline">Detalle</AppText>
            {budgetItems.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemIcon}><MaterialCommunityIcons name="cash" size={20} color={colors.sky} /></View>
                <View style={styles.itemText}>
                  <AppText variant="subheading">{item.name}</AppText>
                  <AppText variant="caption">{item.category}</AppText>
                </View>
                <AppText variant="subheading" style={styles.amount}>C$ {item.amount.toLocaleString('es-NI')}</AppText>
                <Pressable onPress={() => removeBudgetItem(item.id)} accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name}`} style={styles.deleteButton}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  totalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  totalLabel: { color: colors.orange, letterSpacing: 1.4 },
  wallet: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(245,157,29,0.14)', alignItems: 'center', justifyContent: 'center' },
  formCard: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundSoft, color: colors.text, paddingHorizontal: spacing.md, fontFamily: font.semibold, fontSize: 16 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  category: { minHeight: 38, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.backgroundSoft, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  categoryActive: { backgroundColor: colors.sky, borderColor: colors.sky },
  categoryText: { color: colors.textMuted },
  categoryTextActive: { color: colors.white },
  message: { color: colors.emerald },
  listSection: { gap: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  itemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20,117,209,0.14)' },
  itemText: { flex: 1 },
  amount: { color: colors.orange },
  deleteButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
