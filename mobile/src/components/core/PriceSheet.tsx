import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ItiniBottomSheet } from '@/components/core/ItiniBottomSheet';
import { verifiedPrices } from '@/data/core';
import { font } from '@/constants/theme';
import { useAppData } from '@/providers/AppDataProvider';
import type { BudgetCategory } from '@/types/domain';

type Tab = 'Verificados' | 'Calculadora' | 'Recomendación';

export function PriceSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { budgetItems, addBudgetItem, removeBudgetItem } = useAppData();
  const [tab, setTab] = useState<Tab>('Verificados');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [budget, setBudget] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const total = useMemo(() => budgetItems.reduce((sum, item) => sum + item.amount, 0), [budgetItems]);

  const addManualCost = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!itemName.trim() || !Number.isFinite(value) || value <= 0) return;
    await addBudgetItem(itemName, value, 'Otro');
    setItemName('');
    setAmount('');
  };

  const buildRecommendation = () => {
    const available = Number(budget.replace(',', '.'));
    if (!Number.isFinite(available) || available <= 0) return;
    if (available >= 1000) {
      setRecommendation('Con C$ 1,000 podés visitar La Estanzuela, almorzar en La Garnacha, cubrir transporte y reservar un guía certificado. Estimado: C$ 940.');
    } else if (available >= 550) {
      setRecommendation('Con este presupuesto, ITINI recomienda Cascada La Estanzuela: entrada, transporte colectivo y una comida local. Estimado: C$ 290.');
    } else {
      setRecommendation('Para aprovechar mejor tu presupuesto, elegí una ruta fácil cercana y compartí traslado. ITINI te mostrará opciones verificadas debajo de C$ 300.');
    }
  };

  return (
    <ItiniBottomSheet visible={visible} onClose={onClose} title="Calculadora" badge="PRESUPUESTO EXACTO" icon="calculator-variant-outline" accent="#FF6D1B">
      <View style={styles.tabs}>
        {(['Verificados', 'Calculadora', 'Recomendación'] as Tab[]).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}>
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'Verificados' && (
        <View style={styles.section}>
          <Text style={styles.helper}>Precios reales auditados por guías ITINI:</Text>
          {verifiedPrices.map((item) => (
            <View style={styles.priceCard} key={item.id}>
              <View style={styles.priceCopy}>
                <Text style={styles.priceName}>{item.name}</Text>
                <Text style={styles.verified}>◉ ITINI Verified</Text>
              </View>
              <Pressable onPress={() => addBudgetItem(item.name, item.amount, item.category)} style={styles.addVerified}>
                <Text style={styles.addVerifiedText}>+ C$ {item.amount}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {tab === 'Calculadora' && (
        <View style={styles.section}>
          {budgetItems.map((item) => (
            <Pressable key={item.id} onLongPress={() => removeBudgetItem(item.id)} style={styles.calculatorRow} accessibilityLabel={`Mantén presionado para eliminar ${item.name}`}>
              <Text style={styles.priceName}>{item.name}</Text>
              <Text style={styles.amount}>C$ {item.amount.toLocaleString('es-NI')}</Text>
            </Pressable>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimado:</Text>
            <Text style={styles.total}>C$ {total.toLocaleString('es-NI')}</Text>
          </View>
          <View style={styles.manualRow}>
            <TextInput value={itemName} onChangeText={setItemName} placeholder="Ej. Transporte local" placeholderTextColor="#9AA8BA" style={[styles.input, styles.nameInput]} />
            <TextInput value={amount} onChangeText={setAmount} placeholder="C$" placeholderTextColor="#9AA8BA" keyboardType="decimal-pad" style={[styles.input, styles.amountInput]} />
            <Pressable onPress={addManualCost} style={styles.plusButton} accessibilityRole="button" accessibilityLabel="Agregar costo">
              <MaterialCommunityIcons name="plus" size={25} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={styles.hint}>Mantené presionado un gasto para eliminarlo.</Text>
        </View>
      )}

      {tab === 'Recomendación' && (
        <View style={styles.section}>
          <Text style={styles.helper}>Ingresá tu presupuesto total disponible:</Text>
          <View style={styles.recommendRow}>
            <TextInput value={budget} onChangeText={setBudget} placeholder="Ej. 1000 C$" placeholderTextColor="#9AA8BA" keyboardType="decimal-pad" style={[styles.input, styles.budgetInput]} />
            <Pressable onPress={buildRecommendation} style={styles.recommendButton}><Text style={styles.recommendText}>Recomendar</Text></Pressable>
          </View>
          {recommendation && <View style={styles.recommendation}><Text style={styles.recommendationTitle}>Plan ITINI sugerido</Text><Text style={styles.recommendationText}>{recommendation}</Text></View>}
        </View>
      )}
    </ItiniBottomSheet>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#EEF2F6', padding: 3, borderRadius: 12 },
  tab: { flex: 1, minHeight: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#66778C', shadowOpacity: 0.18, shadowRadius: 4, elevation: 2 },
  tabText: { color: '#71829A', fontFamily: font.bold, fontSize: 10, textAlign: 'center' },
  tabTextActive: { color: '#FF6412' },
  section: { marginTop: 13, gap: 8 },
  helper: { color: '#6A7B92', fontFamily: font.regular, fontSize: 12 },
  priceCard: { minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: '#D6E0EB', backgroundColor: '#F7F9FB', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceCopy: { flex: 1 },
  priceName: { color: '#34445A', fontFamily: font.semibold, fontSize: 12, lineHeight: 16 },
  verified: { color: '#159EE6', marginTop: 2, fontFamily: font.bold, fontSize: 9 },
  addVerified: { minHeight: 25, paddingHorizontal: 9, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6D1B' },
  addVerifiedText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 10 },
  calculatorRow: { minHeight: 35, borderRadius: 11, borderWidth: 1, borderColor: '#D6E0EB', backgroundColor: '#F7F9FB', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount: { color: '#FF6412', fontFamily: font.extraBold, fontSize: 13 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#D6E0EB', marginTop: 4, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: '#34445A', fontFamily: font.extraBold, fontSize: 13 },
  total: { color: '#FF6412', fontFamily: font.extraBold, fontSize: 16 },
  manualRow: { flexDirection: 'row', gap: 6 },
  input: { minHeight: 35, borderRadius: 11, borderWidth: 1, borderColor: '#D6E0EB', backgroundColor: '#F7F9FB', paddingHorizontal: 10, color: '#34445A', fontFamily: font.semibold, fontSize: 11, outlineStyle: 'none' } as never,
  nameInput: { flex: 1 },
  amountInput: { width: 63 },
  plusButton: { width: 35, height: 35, borderRadius: 11, backgroundColor: '#FF6D1B', alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#8B99AA', fontFamily: font.regular, fontSize: 9 },
  recommendRow: { flexDirection: 'row', gap: 8 },
  budgetInput: { flex: 1 },
  recommendButton: { minHeight: 35, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6D1B' },
  recommendText: { color: '#FFFFFF', fontFamily: font.extraBold, fontSize: 11 },
  recommendation: { borderRadius: 12, padding: 11, backgroundColor: '#ECFFF7', borderWidth: 1, borderColor: '#9EEBCD' },
  recommendationTitle: { color: '#07834B', fontFamily: font.extraBold, fontSize: 12 },
  recommendationText: { marginTop: 4, color: '#466276', fontFamily: font.regular, fontSize: 11, lineHeight: 16 },
});
