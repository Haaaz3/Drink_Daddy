import {
  BUD_LIGHT_GRAMS,
  METABOLISM_RATE,
  BODY_WATER_MALE,
  BODY_WATER_FEMALE,
  AGE_FACTORS,
  ETHNICITY_FACTORS,
  FOOD_FACTORS,
  ABSORPTION_TIME,
  LBS_TO_GRAMS,
  ALCOHOL_DENSITY,
  OZ_TO_ML,
} from './constants';

/**
 * Calculate grams of pure alcohol in a drink
 * @param {number} volumeOz - Volume in ounces
 * @param {number} abv - ABV as decimal (e.g., 0.042 for 4.2%)
 * @returns {number} Grams of pure alcohol
 */
export function calculateAlcoholGrams(volumeOz, abv) {
  return volumeOz * OZ_TO_ML * abv * ALCOHOL_DENSITY;
}

/**
 * Get age factor for metabolism adjustment
 * @param {number} age - User's age
 * @returns {number} Metabolism factor (1.0 = baseline)
 */
export function getAgeFactor(age) {
  if (age < 25) return AGE_FACTORS.UNDER_25;
  if (age < 35) return AGE_FACTORS.AGE_25_35;
  if (age < 45) return AGE_FACTORS.AGE_35_45;
  if (age < 55) return AGE_FACTORS.AGE_45_55;
  return AGE_FACTORS.OVER_55;
}

/**
 * Get body water ratio based on biological sex
 * @param {string} sex - 'male' or 'female'
 * @returns {number} Body water ratio (Widmark r-factor)
 */
export function getBodyWaterRatio(sex) {
  return sex === 'male' ? BODY_WATER_MALE : BODY_WATER_FEMALE;
}

/**
 * Get ethnicity factors for metabolism and sensitivity adjustments
 * @param {string} ethnicity - Ethnicity key from ETHNICITY_FACTORS
 * @returns {object} { metabolism: number, sensitivity: number }
 */
export function getEthnicityFactors(ethnicity) {
  return ETHNICITY_FACTORS[ethnicity] || ETHNICITY_FACTORS.NONE;
}

/**
 * Calculate absorption percentage based on time since drink and food status
 * @param {number} minutesSinceDrink - Minutes since the drink was consumed
 * @param {string} foodStatus - 'NONE', 'LIGHT', or 'FULL'
 * @returns {number} Absorption percentage (0 to 1)
 */
export function calculateAbsorption(minutesSinceDrink, foodStatus) {
  const peakTime = ABSORPTION_TIME[foodStatus] || ABSORPTION_TIME.NONE;

  if (minutesSinceDrink >= peakTime) {
    return 1.0; // Fully absorbed
  }

  // Sigmoid-like absorption curve
  const progress = minutesSinceDrink / peakTime;
  return Math.pow(progress, 0.7); // Faster initial absorption, slowing near peak
}

/**
 * Calculate effective alcohol from a single drink considering absorption and metabolism
 * @param {object} drink - Drink object with timestamp, volumeOz, abv
 * @param {object} profile - User profile with weightLbs, sex, age, ethnicity
 * @param {string} foodStatus - 'NONE', 'LIGHT', or 'FULL'
 * @param {number} currentTime - Current timestamp
 * @returns {number} Effective alcohol grams still in system
 */
export function calculateEffectiveAlcohol(drink, profile, foodStatus, currentTime) {
  const totalGrams = calculateAlcoholGrams(drink.volumeOz, drink.abv);
  const minutesSinceDrink = (currentTime - drink.timestamp) / 60000;
  const hoursSinceDrink = minutesSinceDrink / 60;

  if (hoursSinceDrink < 0) return 0; // Future drink

  // Calculate absorption
  const absorbed = calculateAbsorption(minutesSinceDrink, foodStatus);
  const absorbedGrams = totalGrams * absorbed;

  // Apply food factor to peak BAC
  const foodFactor = FOOD_FACTORS[foodStatus] || FOOD_FACTORS.NONE;
  const effectiveAbsorbed = absorbedGrams * foodFactor;

  // Calculate metabolism (how much has been processed)
  const bodyWeightGrams = profile.weightLbs * LBS_TO_GRAMS;
  const r = getBodyWaterRatio(profile.sex);
  const ageFactor = getAgeFactor(profile.age);
  const ethnicityFactors = getEthnicityFactors(profile.ethnicity);

  // Adjusted metabolism rate based on age and ethnicity
  const adjustedMetabolismRate = METABOLISM_RATE * ageFactor * ethnicityFactors.metabolism;

  // Convert metabolism rate from BAC %/hour to grams/hour
  // BAC = grams / (bodyWeight * r) => grams = BAC * bodyWeight * r
  const gramsMetabolizedPerHour = adjustedMetabolismRate * bodyWeightGrams * r / 100;
  const gramsMetabolized = gramsMetabolizedPerHour * hoursSinceDrink;

  // Return effective alcohol (can't go below 0)
  return Math.max(0, effectiveAbsorbed - gramsMetabolized);
}

/**
 * Calculate total effective alcohol from all drinks
 * @param {array} drinks - Array of drink objects
 * @param {object} profile - User profile
 * @param {string} foodStatus - Current food status
 * @param {number} currentTime - Current timestamp
 * @returns {number} Total effective alcohol grams
 */
export function calculateTotalEffectiveAlcohol(drinks, profile, foodStatus, currentTime = Date.now()) {
  return drinks.reduce((total, drink) => {
    return total + calculateEffectiveAlcohol(drink, profile, foodStatus, currentTime);
  }, 0);
}

/**
 * Convert alcohol grams to Bud Light equivalents
 * @param {number} grams - Grams of alcohol
 * @param {number} sensitivityFactor - Ethnicity sensitivity multiplier (default 1.0)
 * @returns {number} Number of Bud Light equivalents (adjusted for sensitivity)
 */
export function gramsToBudLights(grams, sensitivityFactor = 1.0) {
  // Sensitivity factor adjusts how "drunk" you feel at a given alcohol level
  // Higher sensitivity = feels like more drinks at the same BAC
  return (grams / BUD_LIGHT_GRAMS) * sensitivityFactor;
}

/**
 * Calculate BAC from alcohol grams
 * @param {number} grams - Effective grams of alcohol
 * @param {object} profile - User profile with weightLbs and sex
 * @returns {number} BAC as percentage
 */
export function calculateBAC(grams, profile) {
  const bodyWeightGrams = profile.weightLbs * LBS_TO_GRAMS;
  const r = getBodyWaterRatio(profile.sex);
  return (grams / (bodyWeightGrams * r)) * 100;
}

/**
 * Get intoxication level description
 * @param {number} budLights - Current Bud Light equivalents
 * @param {number} sweetSpot - User's sweet spot
 * @returns {object} Level info with zone and description
 */
export function getIntoxicationLevel(budLights, sweetSpot) {
  const ratio = budLights / sweetSpot;

  if (budLights === 0) {
    return { zone: 'sober', label: 'Sober', color: 'gray' };
  }
  if (ratio < 0.5) {
    return { zone: 'warming', label: 'Warming Up', color: 'blue' };
  }
  if (ratio < 0.85) {
    return { zone: 'approaching', label: 'Approaching Sweet Spot', color: 'green' };
  }
  if (ratio <= 1.15) {
    return { zone: 'sweetspot', label: 'Sweet Spot', color: 'gold' };
  }
  if (ratio <= 1.5) {
    return { zone: 'over', label: 'Past Sweet Spot', color: 'orange' };
  }
  return { zone: 'danger', label: 'Take It Easy', color: 'red' };
}

/**
 * Estimate time until sober (0 Bud Lights)
 * @param {number} currentGrams - Current effective alcohol grams
 * @param {object} profile - User profile
 * @returns {number} Minutes until sober
 */
export function estimateTimeUntilSober(currentGrams, profile) {
  if (currentGrams <= 0) return 0;

  const bodyWeightGrams = profile.weightLbs * LBS_TO_GRAMS;
  const r = getBodyWaterRatio(profile.sex);
  const ageFactor = getAgeFactor(profile.age);
  const ethnicityFactors = getEthnicityFactors(profile.ethnicity);
  const adjustedMetabolismRate = METABOLISM_RATE * ageFactor * ethnicityFactors.metabolism;

  const gramsMetabolizedPerHour = adjustedMetabolismRate * bodyWeightGrams * r / 100;
  const hoursUntilSober = currentGrams / gramsMetabolizedPerHour;

  return Math.ceil(hoursUntilSober * 60);
}
