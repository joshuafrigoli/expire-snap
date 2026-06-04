export function mockScanReceipt(imageBase64) {
  const data = {
    transaction_date: '2026-06-04',
    items: [
      { id: 'mock-001', name: 'Fresh Whole Milk', category: 'Dairy', estimated_expiry_date: '2026-06-10', confidence_days: 1 },
      { id: 'mock-002', name: 'Free Range Chicken Breast', category: 'Meat & Fish', estimated_expiry_date: '2026-06-07', confidence_days: 1 },
      { id: 'mock-003', name: 'Greek Yogurt', category: 'Dairy', estimated_expiry_date: '2026-06-24', confidence_days: 2 },
      { id: 'mock-004', name: 'Sourdough Bread', category: 'Pantry', estimated_expiry_date: '2026-06-08', confidence_days: 1 },
    ]
  };
  return new Promise(resolve => setTimeout(() => resolve(data), 2000));
}
