// Bud Light specifications (our baseline unit)
export const BUD_LIGHT_OZ = 12;
export const BUD_LIGHT_ABV = 0.042; // 4.2%
export const ALCOHOL_DENSITY = 0.789; // g/ml
export const OZ_TO_ML = 29.5735;

// Grams of pure alcohol in one 12oz Bud Light
export const BUD_LIGHT_GRAMS = BUD_LIGHT_OZ * OZ_TO_ML * BUD_LIGHT_ABV * ALCOHOL_DENSITY;
// = 12 * 29.5735 * 0.042 * 0.789 ≈ 11.77g

// Metabolism rate (BAC percentage points per hour)
export const METABOLISM_RATE = 0.016;

// Body water ratios (Widmark r-factor)
export const BODY_WATER_MALE = 0.68;
export const BODY_WATER_FEMALE = 0.55;

// Age adjustment factors (metabolism slows with age)
export const AGE_FACTORS = {
  UNDER_25: 1.0,    // Baseline
  AGE_25_35: 0.95,  // 5% slower
  AGE_35_45: 0.90,  // 10% slower
  AGE_45_55: 0.85,  // 15% slower
  OVER_55: 0.80,    // 20% slower
};

// Ethnicity factors - based on genetic variations in alcohol-metabolizing enzymes
// ALDH2*2 variant prevalence and ADH variants affect metabolism
// These are population averages; individual variation exists
export const ETHNICITY_FACTORS = {
  // No selection / prefer not to say - uses baseline
  NONE: { metabolism: 1.0, sensitivity: 1.0, label: 'Prefer not to say' },

  // European/Caucasian - baseline reference population for Widmark formula
  EUROPEAN: { metabolism: 1.0, sensitivity: 1.0, label: 'European/Caucasian' },

  // East Asian - ~30-50% have ALDH2*2 variant causing slower acetaldehyde processing
  // Results in higher sensitivity (faster intoxication feeling) despite similar BAC
  EAST_ASIAN: { metabolism: 0.85, sensitivity: 1.25, label: 'East Asian' },

  // South Asian - moderate ALDH2 variant prevalence (~5-10%)
  SOUTH_ASIAN: { metabolism: 0.95, sensitivity: 1.05, label: 'South Asian' },

  // African/Black - generally higher ADH activity, faster initial metabolism
  AFRICAN: { metabolism: 1.05, sensitivity: 0.95, label: 'African/Black' },

  // Hispanic/Latino - similar to European baseline with slight variation
  HISPANIC: { metabolism: 1.0, sensitivity: 1.0, label: 'Hispanic/Latino' },

  // Native American/Indigenous - some studies suggest variant ADH patterns
  NATIVE_AMERICAN: { metabolism: 0.90, sensitivity: 1.10, label: 'Native American/Indigenous' },

  // Middle Eastern - lower ALDH2 variant prevalence
  MIDDLE_EASTERN: { metabolism: 1.0, sensitivity: 1.0, label: 'Middle Eastern' },

  // Pacific Islander - limited data, using conservative estimate
  PACIFIC_ISLANDER: { metabolism: 0.95, sensitivity: 1.05, label: 'Pacific Islander' },

  // Mixed/Other
  MIXED: { metabolism: 1.0, sensitivity: 1.0, label: 'Mixed/Other' },
};

// Food impact multipliers (on peak BAC)
export const FOOD_FACTORS = {
  NONE: 1.0,        // Full absorption
  LIGHT: 0.80,      // 20% reduction in peak BAC
  FULL: 0.65,       // 35% reduction in peak BAC
};

// Absorption timing (minutes to peak BAC)
export const ABSORPTION_TIME = {
  NONE: 30,         // Empty stomach
  LIGHT: 60,        // Light meal
  FULL: 90,         // Full meal
};

// Weight conversion
export const LBS_TO_GRAMS = 453.592;

// LocalStorage keys
export const STORAGE_KEYS = {
  PROFILE: 'drinkdaddy_profile',
  DRINKS: 'drinkdaddy_drinks',
  SESSION: 'drinkdaddy_session',
};
