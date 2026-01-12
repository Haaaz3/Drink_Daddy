import { useState, useEffect, useCallback } from 'react';
import { getDrinks, saveDrinks, getSession, saveSession, clearSession } from '../utils/storage';
import { calculateAlcoholGrams } from '../utils/bacCalculator';

export function useDrinks() {
  const [drinks, setDrinks] = useState(() => getDrinks());
  const [session, setSession] = useState(() => getSession());

  // Persist drinks to localStorage
  useEffect(() => {
    saveDrinks(drinks);
  }, [drinks]);

  // Persist session to localStorage
  useEffect(() => {
    saveSession(session);
  }, [session]);

  const addDrink = useCallback((drink) => {
    const newDrink = {
      id: `drink-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'drink',
      name: drink.name,
      category: drink.category,
      volumeOz: drink.volumeOz,
      abv: drink.abv,
      timestamp: drink.timestamp || Date.now(),
      gramsAlcohol: calculateAlcoholGrams(drink.volumeOz, drink.abv),
    };

    setDrinks(prev => [...prev, newDrink]);

    // Set session start time if this is the first drink
    setSession(prev => {
      if (!prev.startTime) {
        return { ...prev, startTime: newDrink.timestamp };
      }
      return prev;
    });

    return newDrink;
  }, []);

  const addMeal = useCallback((meal) => {
    const newMeal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'meal',
      name: meal.name,
      mealType: meal.type,
      factor: meal.factor,
      timestamp: meal.timestamp || Date.now(),
    };

    setSession(prev => ({
      ...prev,
      meals: [...(prev.meals || []), newMeal],
    }));

    return newMeal;
  }, []);

  const removeMeal = useCallback((mealId) => {
    setSession(prev => ({
      ...prev,
      meals: (prev.meals || []).filter(m => m.id !== mealId),
    }));
  }, []);

  const removeDrink = useCallback((drinkId) => {
    setDrinks(prev => prev.filter(d => d.id !== drinkId));
  }, []);

  const updateDrink = useCallback((drinkId, updates) => {
    setDrinks(prev => prev.map(d => {
      if (d.id === drinkId) {
        const updated = { ...d, ...updates };
        if (updates.volumeOz !== undefined || updates.abv !== undefined) {
          updated.gramsAlcohol = calculateAlcoholGrams(updated.volumeOz, updated.abv);
        }
        return updated;
      }
      return d;
    }));
  }, []);

  const startNewSession = useCallback(() => {
    clearSession();
    setDrinks([]);
    setSession({ startTime: null, meals: [] });
  }, []);

  // Get the most relevant meal factor for a given timestamp
  // Meals affect drinks consumed within 2 hours after eating
  const getMealFactorForTime = useCallback((timestamp) => {
    const meals = session.meals || [];
    if (meals.length === 0) return 1.0;

    // Find meals eaten within 2 hours before this drink
    const relevantMeals = meals.filter(meal => {
      const timeSinceMeal = timestamp - meal.timestamp;
      return timeSinceMeal >= 0 && timeSinceMeal <= 2 * 60 * 60 * 1000; // 2 hours in ms
    });

    if (relevantMeals.length === 0) return 1.0;

    // Use the strongest meal effect (lowest factor)
    return Math.min(...relevantMeals.map(m => m.factor));
  }, [session.meals]);

  return {
    drinks,
    session,
    meals: session.meals || [],
    addDrink,
    addMeal,
    removeDrink,
    removeMeal,
    updateDrink,
    startNewSession,
    getMealFactorForTime,
    drinkCount: drinks.length,
  };
}
