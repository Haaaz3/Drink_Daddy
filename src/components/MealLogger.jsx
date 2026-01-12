import { useState } from 'react';

const MEAL_TYPES = [
  { id: 'snack', name: 'Snack', description: 'Small bite, appetizer', factor: 0.90, icon: '🍿' },
  { id: 'light', name: 'Light Meal', description: 'Salad, sandwich', factor: 0.80, icon: '🥗' },
  { id: 'medium', name: 'Medium Meal', description: 'Regular dinner', factor: 0.70, icon: '🍝' },
  { id: 'heavy', name: 'Heavy Meal', description: 'Large, high-fat meal', factor: 0.60, icon: '🍔' },
];

const WATER_OPTION = { id: 'water', name: 'Glass of Water', description: 'Hydration helps, but doesn\'t lower BAC', factor: 0.95, icon: '💧' };

export function MealLogger({ onAddMeal, onClose }) {
  const [selectedType, setSelectedType] = useState(null);

  const handleAdd = () => {
    if (!selectedType) return;
    const allOptions = [...MEAL_TYPES, WATER_OPTION];
    const meal = allOptions.find(m => m.id === selectedType);
    onAddMeal({
      type: meal.id,
      name: meal.name,
      factor: meal.factor,
      timestamp: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Log a Meal</h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-slate-400 text-sm mb-4">
          Meals slow alcohol absorption. Log what you've eaten to get more accurate estimates.
        </p>

        <div className="space-y-3">
          {MEAL_TYPES.map((meal) => (
            <button
              key={meal.id}
              onClick={() => setSelectedType(meal.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                selectedType === meal.id
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <span className="text-3xl">{meal.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{meal.name}</div>
                <div className={`text-sm ${
                  selectedType === meal.id ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {meal.description}
                </div>
              </div>
              <div className={`text-sm font-medium ${
                selectedType === meal.id ? 'text-slate-700' : 'text-green-500'
              }`}>
                -{Math.round((1 - meal.factor) * 100)}%
              </div>
            </button>
          ))}
        </div>

        {/* Water Section */}
        <div className="mt-6">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Hydration</p>
          <button
            onClick={() => setSelectedType(WATER_OPTION.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
              selectedType === WATER_OPTION.id
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <span className="text-3xl">{WATER_OPTION.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{WATER_OPTION.name}</div>
              <div className={`text-sm ${
                selectedType === WATER_OPTION.id ? 'text-blue-100' : 'text-slate-400'
              }`}>
                {WATER_OPTION.description}
              </div>
            </div>
            <div className={`text-sm font-medium ${
              selectedType === WATER_OPTION.id ? 'text-blue-100' : 'text-blue-400'
            }`}>
              -{Math.round((1 - WATER_OPTION.factor) * 100)}%
            </div>
          </button>
        </div>

        <div className="mt-6 bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-1">How does food help?</p>
          <p>Food in your stomach slows alcohol absorption, reducing peak BAC by 10-40% depending on meal size. Best effect when eaten before or while drinking.</p>
          <p className="mt-2"><span className="text-blue-400">Water</span> helps with hydration and can make you feel better, but doesn't significantly speed up alcohol metabolism.</p>
        </div>
      </div>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleAdd}
          disabled={!selectedType}
          className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Log Meal
        </button>
      </div>
    </div>
  );
}
