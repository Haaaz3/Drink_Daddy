// Preset drinks database
// ABV stored as decimal (e.g., 0.042 = 4.2%)
// Volume in ounces

export const DRINK_CATEGORIES = {
  BEER: 'beer',
  WINE: 'wine',
  SPIRITS: 'spirits',
  COCKTAILS: 'cocktails',
  SELTZERS: 'seltzers',
};

export const PRESET_DRINKS = [
  // === BEERS ===
  // Light Beers
  { id: 'bud-light', name: 'Bud Light', category: DRINK_CATEGORIES.BEER, abv: 0.042, volumeOz: 12 },
  { id: 'miller-lite', name: 'Miller Lite', category: DRINK_CATEGORIES.BEER, abv: 0.042, volumeOz: 12 },
  { id: 'coors-light', name: 'Coors Light', category: DRINK_CATEGORIES.BEER, abv: 0.042, volumeOz: 12 },
  { id: 'michelob-ultra', name: 'Michelob Ultra', category: DRINK_CATEGORIES.BEER, abv: 0.042, volumeOz: 12 },
  { id: 'corona-light', name: 'Corona Light', category: DRINK_CATEGORIES.BEER, abv: 0.041, volumeOz: 12 },
  { id: 'natural-light', name: 'Natural Light', category: DRINK_CATEGORIES.BEER, abv: 0.042, volumeOz: 12 },
  { id: 'busch-light', name: 'Busch Light', category: DRINK_CATEGORIES.BEER, abv: 0.041, volumeOz: 12 },

  // Regular Beers
  { id: 'budweiser', name: 'Budweiser', category: DRINK_CATEGORIES.BEER, abv: 0.05, volumeOz: 12 },
  { id: 'coors-banquet', name: 'Coors Banquet', category: DRINK_CATEGORIES.BEER, abv: 0.05, volumeOz: 12 },
  { id: 'corona-extra', name: 'Corona Extra', category: DRINK_CATEGORIES.BEER, abv: 0.046, volumeOz: 12 },
  { id: 'heineken', name: 'Heineken', category: DRINK_CATEGORIES.BEER, abv: 0.05, volumeOz: 12 },
  { id: 'stella-artois', name: 'Stella Artois', category: DRINK_CATEGORIES.BEER, abv: 0.05, volumeOz: 12 },
  { id: 'modelo-especial', name: 'Modelo Especial', category: DRINK_CATEGORIES.BEER, abv: 0.044, volumeOz: 12 },
  { id: 'dos-equis', name: 'Dos Equis Lager', category: DRINK_CATEGORIES.BEER, abv: 0.046, volumeOz: 12 },
  { id: 'pbr', name: 'Pabst Blue Ribbon', category: DRINK_CATEGORIES.BEER, abv: 0.047, volumeOz: 12 },
  { id: 'yuengling', name: 'Yuengling Lager', category: DRINK_CATEGORIES.BEER, abv: 0.048, volumeOz: 12 },
  { id: 'blue-moon', name: 'Blue Moon', category: DRINK_CATEGORIES.BEER, abv: 0.054, volumeOz: 12 },
  { id: 'sam-adams', name: 'Sam Adams Boston Lager', category: DRINK_CATEGORIES.BEER, abv: 0.05, volumeOz: 12 },
  { id: 'guinness', name: 'Guinness Draught', category: DRINK_CATEGORIES.BEER, abv: 0.042, volumeOz: 12 },

  // IPAs & Craft
  { id: 'ipa-generic', name: 'IPA (Craft)', category: DRINK_CATEGORIES.BEER, abv: 0.065, volumeOz: 12 },
  { id: 'double-ipa', name: 'Double IPA', category: DRINK_CATEGORIES.BEER, abv: 0.08, volumeOz: 12 },
  { id: 'lagunitas-ipa', name: 'Lagunitas IPA', category: DRINK_CATEGORIES.BEER, abv: 0.062, volumeOz: 12 },
  { id: 'sierra-nevada-pa', name: 'Sierra Nevada Pale Ale', category: DRINK_CATEGORIES.BEER, abv: 0.057, volumeOz: 12 },
  { id: 'voodoo-ranger', name: 'Voodoo Ranger IPA', category: DRINK_CATEGORIES.BEER, abv: 0.07, volumeOz: 12 },

  // === WINE ===
  { id: 'red-wine', name: 'Red Wine (Glass)', category: DRINK_CATEGORIES.WINE, abv: 0.135, volumeOz: 5 },
  { id: 'white-wine', name: 'White Wine (Glass)', category: DRINK_CATEGORIES.WINE, abv: 0.12, volumeOz: 5 },
  { id: 'rose-wine', name: 'Rosé (Glass)', category: DRINK_CATEGORIES.WINE, abv: 0.12, volumeOz: 5 },
  { id: 'champagne', name: 'Champagne/Prosecco', category: DRINK_CATEGORIES.WINE, abv: 0.12, volumeOz: 5 },
  { id: 'port-wine', name: 'Port Wine', category: DRINK_CATEGORIES.WINE, abv: 0.20, volumeOz: 3 },

  // === SPIRITS (Standard Pour = 1.5oz) ===
  { id: 'vodka-shot', name: 'Vodka (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.40, volumeOz: 1.5 },
  { id: 'whiskey-shot', name: 'Whiskey (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.40, volumeOz: 1.5 },
  { id: 'bourbon-shot', name: 'Bourbon (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.45, volumeOz: 1.5 },
  { id: 'rum-shot', name: 'Rum (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.40, volumeOz: 1.5 },
  { id: 'tequila-shot', name: 'Tequila (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.40, volumeOz: 1.5 },
  { id: 'gin-shot', name: 'Gin (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.40, volumeOz: 1.5 },
  { id: 'scotch-shot', name: 'Scotch (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.43, volumeOz: 1.5 },
  { id: 'fireball', name: 'Fireball (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.33, volumeOz: 1.5 },
  { id: 'jagermeister', name: 'Jägermeister (Shot)', category: DRINK_CATEGORIES.SPIRITS, abv: 0.35, volumeOz: 1.5 },

  // === COCKTAILS (Estimated ABV based on typical recipes) ===
  { id: 'margarita', name: 'Margarita', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.13, volumeOz: 6 },
  { id: 'mojito', name: 'Mojito', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.10, volumeOz: 8 },
  { id: 'martini', name: 'Martini', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.28, volumeOz: 4 },
  { id: 'manhattan', name: 'Manhattan', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.25, volumeOz: 4 },
  { id: 'old-fashioned', name: 'Old Fashioned', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.32, volumeOz: 4 },
  { id: 'whiskey-sour', name: 'Whiskey Sour', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.15, volumeOz: 5 },
  { id: 'long-island', name: 'Long Island Iced Tea', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.22, volumeOz: 10 },
  { id: 'cosmopolitan', name: 'Cosmopolitan', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.20, volumeOz: 4 },
  { id: 'moscow-mule', name: 'Moscow Mule', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.11, volumeOz: 8 },
  { id: 'gin-tonic', name: 'Gin & Tonic', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.12, volumeOz: 8 },
  { id: 'rum-coke', name: 'Rum & Coke', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.10, volumeOz: 8 },
  { id: 'vodka-soda', name: 'Vodka Soda', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.12, volumeOz: 6 },
  { id: 'screwdriver', name: 'Screwdriver', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.10, volumeOz: 8 },
  { id: 'bloody-mary', name: 'Bloody Mary', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.10, volumeOz: 8 },
  { id: 'mimosa', name: 'Mimosa', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.08, volumeOz: 6 },
  { id: 'pina-colada', name: 'Piña Colada', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.12, volumeOz: 8 },
  { id: 'daiquiri', name: 'Daiquiri', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.20, volumeOz: 4 },
  { id: 'negroni', name: 'Negroni', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.24, volumeOz: 4 },
  { id: 'aperol-spritz', name: 'Aperol Spritz', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.08, volumeOz: 6 },
  { id: 'espresso-martini', name: 'Espresso Martini', category: DRINK_CATEGORIES.COCKTAILS, abv: 0.20, volumeOz: 4 },

  // === HARD SELTZERS ===
  { id: 'white-claw', name: 'White Claw', category: DRINK_CATEGORIES.SELTZERS, abv: 0.05, volumeOz: 12 },
  { id: 'truly', name: 'Truly', category: DRINK_CATEGORIES.SELTZERS, abv: 0.05, volumeOz: 12 },
  { id: 'high-noon', name: 'High Noon', category: DRINK_CATEGORIES.SELTZERS, abv: 0.045, volumeOz: 12 },
  { id: 'bud-light-seltzer', name: 'Bud Light Seltzer', category: DRINK_CATEGORIES.SELTZERS, abv: 0.05, volumeOz: 12 },
  { id: 'vizzy', name: 'Vizzy', category: DRINK_CATEGORIES.SELTZERS, abv: 0.05, volumeOz: 12 },
];

// Get drinks by category
export function getDrinksByCategory(category) {
  return PRESET_DRINKS.filter(drink => drink.category === category);
}

// Search drinks by name
export function searchDrinks(query) {
  const lowerQuery = query.toLowerCase();
  return PRESET_DRINKS.filter(drink =>
    drink.name.toLowerCase().includes(lowerQuery)
  );
}

// Get a drink by ID
export function getDrinkById(id) {
  return PRESET_DRINKS.find(drink => drink.id === id);
}

// Category display names
export const CATEGORY_LABELS = {
  [DRINK_CATEGORIES.BEER]: 'Beers',
  [DRINK_CATEGORIES.WINE]: 'Wine',
  [DRINK_CATEGORIES.SPIRITS]: 'Spirits',
  [DRINK_CATEGORIES.COCKTAILS]: 'Cocktails',
  [DRINK_CATEGORIES.SELTZERS]: 'Hard Seltzers',
};
