import { useState } from 'react';
import { useProfile } from './hooks/useProfile';
import { useDrinks } from './hooks/useDrinks';
import { useIntoxication } from './hooks/useIntoxication';
import { ProfileSetup } from './components/ProfileSetup';
import { Layout } from './components/Layout';
import { IntoxicationChart } from './components/IntoxicationChart';
import { DrinkLogger } from './components/DrinkLogger';
import { MealLogger } from './components/MealLogger';
import { DrinkList } from './components/DrinkList';
import { SafetyWarning } from './components/SafetyWarning';

function App() {
  const { profile, completeSetup, updateProfile, isSetup } = useProfile();
  const { drinks, meals, addDrink, addMeal, removeDrink, removeMeal, startNewSession, getMealFactorForTime } = useDrinks();
  const intoxication = useIntoxication(drinks, profile, getMealFactorForTime);

  const [showDrinkLogger, setShowDrinkLogger] = useState(false);
  const [showMealLogger, setShowMealLogger] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Show profile setup if not configured
  if (!isSetup) {
    return <ProfileSetup onComplete={completeSetup} initialProfile={profile} />;
  }

  // Show settings/profile editor
  if (showSettings) {
    return (
      <ProfileSetup
        onComplete={(data) => {
          updateProfile(data);
          setShowSettings(false);
        }}
        initialProfile={profile}
      />
    );
  }

  const handleNewSession = () => {
    if (drinks.length > 0 || meals.length > 0) {
      if (confirm('Start a new session? This will clear your current drinks and meals.')) {
        startNewSession();
      }
    }
  };

  return (
    <Layout
      onOpenSettings={() => setShowSettings(true)}
      onNewSession={handleNewSession}
    >
      <div className="p-4 space-y-4 pb-32">
        {/* Safety Warning */}
        <SafetyWarning
          shouldNotDrive={intoxication.shouldNotDrive}
          inDangerZone={intoxication.inDangerZone}
          bac={intoxication.bac}
          projectedBac={intoxication.projectedBac}
        />

        {/* Intoxication Chart */}
        <IntoxicationChart
          intoxication={intoxication}
          sweetSpot={profile.sweetSpot}
          drinks={drinks}
          meals={meals}
        />

        {/* Central Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowDrinkLogger(true)}
            className="flex items-center justify-center gap-3 py-4 px-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Drink
          </button>
          <button
            onClick={() => setShowMealLogger(true)}
            className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
          >
            <span className="text-xl">🍽️</span>
            Log Meal
          </button>
        </div>

        {/* Meals List */}
        {meals.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">Meals</h3>
            {meals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between bg-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {meal.mealType === 'snack' ? '🍿' : meal.mealType === 'light' ? '🥗' : meal.mealType === 'medium' ? '🍝' : '🍔'}
                  </span>
                  <div>
                    <div className="font-medium text-white">{meal.name}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(meal.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drink List */}
        <DrinkList
          drinks={drinks}
          onRemove={removeDrink}
        />
      </div>

      {/* Drink Logger Modal */}
      {showDrinkLogger && (
        <DrinkLogger
          onAddDrink={addDrink}
          onClose={() => setShowDrinkLogger(false)}
        />
      )}

      {/* Meal Logger Modal */}
      {showMealLogger && (
        <MealLogger
          onAddMeal={addMeal}
          onClose={() => setShowMealLogger(false)}
        />
      )}
    </Layout>
  );
}

export default App;
