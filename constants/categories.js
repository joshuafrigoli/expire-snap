export const CATEGORY_I18N_KEY = {
  'All': 'categories.all',
  'Dairy': 'categories.dairy',
  'Meat & Fish': 'categories.meat',
  'Fruits & Veggies': 'categories.produce',
  'Frozen': 'categories.frozen',
  'Pantry': 'categories.pantry',
};

// Maps any AI variation (case-insensitive) → canonical English value
const NORMALIZE_MAP = {
  'dairy': 'Dairy',
  'milk': 'Dairy',
  'latticini': 'Dairy',
  'prodotti caseari': 'Dairy',
  'meat & fish': 'Meat & Fish',
  'meat and fish': 'Meat & Fish',
  'meat': 'Meat & Fish',
  'fish': 'Meat & Fish',
  'seafood': 'Meat & Fish',
  'poultry': 'Meat & Fish',
  'carne e pesce': 'Meat & Fish',
  'carne': 'Meat & Fish',
  'pesce': 'Meat & Fish',
  'fruits & veggies': 'Fruits & Veggies',
  'fruits & vegetables': 'Fruits & Veggies',
  'fruits and vegetables': 'Fruits & Veggies',
  'produce': 'Fruits & Veggies',
  'vegetables': 'Fruits & Veggies',
  'fruits': 'Fruits & Veggies',
  'fresh produce': 'Fruits & Veggies',
  'frutta e verdura': 'Fruits & Veggies',
  'frutta': 'Fruits & Veggies',
  'verdura': 'Fruits & Veggies',
  'frozen': 'Frozen',
  'frozen foods': 'Frozen',
  'surgelati': 'Frozen',
  'pantry': 'Pantry',
  'canned': 'Pantry',
  'dry goods': 'Pantry',
  'grains': 'Pantry',
  'bakery': 'Pantry',
  'bread': 'Pantry',
  'staples': 'Pantry',
  'dispensa': 'Pantry',
};

export function normalizeCategory(raw) {
  if (!raw) return 'Pantry';
  const known = ['Dairy', 'Meat & Fish', 'Fruits & Veggies', 'Frozen', 'Pantry'];
  if (known.includes(raw)) return raw;
  return NORMALIZE_MAP[raw.toLowerCase().trim()] ?? 'Pantry';
}
