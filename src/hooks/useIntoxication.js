import { useState, useEffect, useMemo } from 'react';
import {
  calculateAlcoholGrams,
  gramsToBudLights,
  calculateBAC,
  getIntoxicationLevel,
  estimateTimeUntilSober,
  getEthnicityFactors,
  getAgeFactor,
  getBodyWaterRatio,
} from '../utils/bacCalculator';
import { METABOLISM_RATE, LBS_TO_GRAMS, BUD_LIGHT_GRAMS } from '../utils/constants';

// Legal BAC limit for driving (0.08%)
const LEGAL_DRIVING_LIMIT = 0.08;
// Conservative "don't drive" threshold (0.05%)
const SAFE_DRIVING_LIMIT = 0.05;
// Danger zone in Bud Light equivalents
const DANGER_THRESHOLD = 6;

export function useIntoxication(drinks, profile, getMealFactorForTime) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update time every 30 seconds for real-time calculation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const intoxication = useMemo(() => {
    const ethnicityFactors = getEthnicityFactors(profile.ethnicity);

    if (!profile.isSetup || drinks.length === 0) {
      return {
        effectiveGrams: 0,
        budLightEquivalents: 0,
        projectedPeak: 0,
        bac: 0,
        projectedBac: 0,
        level: getIntoxicationLevel(0, profile.sweetSpot),
        minutesUntilSober: 0,
        percentOfSweetSpot: 0,
        canDrive: true,
        shouldNotDrive: false,
        inDangerZone: false,
      };
    }

    const bodyWeightGrams = profile.weightLbs * LBS_TO_GRAMS;
    const r = getBodyWaterRatio(profile.sex);
    const ageFactor = getAgeFactor(profile.age);
    const adjustedMetabolismRate = METABOLISM_RATE * ageFactor * ethnicityFactors.metabolism;
    const gramsMetabolizedPerHour = adjustedMetabolismRate * bodyWeightGrams * r / 100;

    let totalEffectiveGrams = 0;
    let totalProjectedGrams = 0; // Assuming full absorption, no more metabolism

    drinks.forEach(drink => {
      const totalGrams = drink.gramsAlcohol || calculateAlcoholGrams(drink.volumeOz, drink.abv);
      const minutesSinceDrink = (currentTime - drink.timestamp) / 60000;
      const hoursSinceDrink = minutesSinceDrink / 60;

      if (hoursSinceDrink < 0) return;

      // Get meal factor for this specific drink's timestamp
      const mealFactor = getMealFactorForTime ? getMealFactorForTime(drink.timestamp) : 1.0;

      // Calculate absorption (sigmoid curve, peak at ~30-45 min without food)
      const peakTime = mealFactor < 0.8 ? 60 : 30; // Longer absorption with food
      const absorbed = minutesSinceDrink >= peakTime ? 1.0 : Math.pow(minutesSinceDrink / peakTime, 0.7);

      const absorbedGrams = totalGrams * absorbed * mealFactor;
      const gramsMetabolized = gramsMetabolizedPerHour * hoursSinceDrink;
      const effectiveGrams = Math.max(0, absorbedGrams - gramsMetabolized);

      totalEffectiveGrams += effectiveGrams;

      // Projected: full absorption of this drink, minus metabolism so far
      const projectedGrams = Math.max(0, totalGrams * mealFactor - gramsMetabolized);
      totalProjectedGrams += projectedGrams;
    });

    const budLightEquivalents = gramsToBudLights(totalEffectiveGrams, ethnicityFactors.sensitivity);
    const projectedPeak = gramsToBudLights(totalProjectedGrams, ethnicityFactors.sensitivity);
    const bac = calculateBAC(totalEffectiveGrams, profile);
    const projectedBac = calculateBAC(totalProjectedGrams, profile);
    const level = getIntoxicationLevel(budLightEquivalents, profile.sweetSpot);
    const minutesUntilSober = estimateTimeUntilSober(totalEffectiveGrams, profile);
    const percentOfSweetSpot = (budLightEquivalents / profile.sweetSpot) * 100;

    // Safety warnings
    const canDrive = bac < SAFE_DRIVING_LIMIT;
    const shouldNotDrive = bac >= SAFE_DRIVING_LIMIT || projectedBac >= LEGAL_DRIVING_LIMIT;
    const inDangerZone = budLightEquivalents >= DANGER_THRESHOLD || projectedPeak >= DANGER_THRESHOLD;

    return {
      effectiveGrams: totalEffectiveGrams,
      budLightEquivalents,
      projectedPeak,
      bac,
      projectedBac,
      level,
      minutesUntilSober,
      percentOfSweetSpot,
      canDrive,
      shouldNotDrive,
      inDangerZone,
    };
  }, [drinks, profile, getMealFactorForTime, currentTime]);

  // Force recalculation
  const recalculate = () => setCurrentTime(Date.now());

  return {
    ...intoxication,
    recalculate,
    currentTime,
  };
}
