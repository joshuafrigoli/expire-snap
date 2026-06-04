import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';

function Select({ label, value, options = [], onChange, testID }) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : '';

  function handleSelect(opt) {
    onChange && onChange(opt.value);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable testID={testID} style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.selectedText}>{selectedLabel}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === value && <Text style={styles.check}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4 },
  label: { fontSize: 14, marginBottom: 4, color: '#64748b', fontWeight: '600' },
  trigger: {
    borderWidth: 2,
    borderColor: '#001a3d',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  selectedText: { fontSize: 15, color: '#001a3d', fontWeight: '500' },
  chevron: { fontSize: 20, color: '#005bc4', fontWeight: '700', paddingLeft: 8, transform: [{ scaleX: 2.2 }] },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,26,61,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: '#001a3d',
    paddingTop: 8,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionActive: { backgroundColor: '#eff6ff' },
  optionText: { fontSize: 15, color: '#001a3d' },
  optionTextActive: { fontWeight: '700', color: '#005bc4' },
  check: { fontSize: 16, color: '#005bc4', fontWeight: '700' },
});

export { Select };
export default Select;
