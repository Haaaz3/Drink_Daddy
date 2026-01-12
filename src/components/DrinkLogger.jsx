import { useState, useMemo } from 'react';
import { PRESET_DRINKS, DRINK_CATEGORIES, CATEGORY_LABELS, searchDrinks } from '../data/drinks';
import { BUD_LIGHT_GRAMS } from '../utils/constants';
import { calculateAlcoholGrams } from '../utils/bacCalculator';

// Generate time options for the past 4 hours in 15-minute increments
function generateTimeOptions() {
  const options = [{ value: 'now', label: 'Just now' }];
  const now = new Date();

  for (let i = 15; i <= 240; i += 15) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    let label;
    if (i < 60) {
      label = `${i} min ago (${displayHours}:${displayMinutes} ${ampm})`;
    } else {
      const hoursAgo = Math.floor(i / 60);
      const minsAgo = i % 60;
      label = minsAgo > 0
        ? `${hoursAgo}h ${minsAgo}m ago (${displayHours}:${displayMinutes} ${ampm})`
        : `${hoursAgo}h ago (${displayHours}:${displayMinutes} ${ampm})`;
    }

    options.push({ value: time.getTime(), label });
  }

  return options;
}

export function DrinkLogger({ onAddDrink, onClose }) {
  const [mode, setMode] = useState('presets'); // 'presets' | 'custom' | 'search'
  const [category, setCategory] = useState(DRINK_CATEGORIES.BEER);
  const [searchQuery, setSearchQuery] = useState('');
  const [drinkTime, setDrinkTime] = useState('now');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  // Custom drink state
  const [customName, setCustomName] = useState('');
  const [customAbv, setCustomAbv] = useState(5);
  const [customVolume, setCustomVolume] = useState(12);

  const filteredDrinks = useMemo(() => {
    if (mode === 'search' && searchQuery.trim()) {
      return searchDrinks(searchQuery);
    }
    return PRESET_DRINKS.filter(d => d.category === category);
  }, [mode, category, searchQuery]);

  const getTimestamp = () => {
    return drinkTime === 'now' ? Date.now() : drinkTime;
  };

  const handleSelectPreset = (drink) => {
    onAddDrink({
      name: drink.name,
      category: drink.category,
      volumeOz: drink.volumeOz,
      abv: drink.abv,
      timestamp: getTimestamp(),
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onAddDrink({
      name: customName,
      volumeOz: customVolume,
      abv: customAbv / 100,
      timestamp: getTimestamp(),
    });
    onClose();
  };

  const selectedTimeLabel = timeOptions.find(opt => opt.value === drinkTime)?.label || 'Just now';

  const customBudLightEquiv = useMemo(() => {
    const grams = calculateAlcoholGrams(customVolume, customAbv / 100);
    return (grams / BUD_LIGHT_GRAMS).toFixed(1);
  }, [customVolume, customAbv]);

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Add a Drink</h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setMode('presets')}
          className={`flex-1 py-3 text-sm font-medium ${
            mode === 'presets' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400'
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setMode('search')}
          className={`flex-1 py-3 text-sm font-medium ${
            mode === 'search' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-3 text-sm font-medium ${
            mode === 'custom' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Time picker */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <button
          onClick={() => setShowTimePicker(!showTimePicker)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-400">When did you have this drink?</span>
          </div>
          <span className="text-sm font-medium text-amber-500">{selectedTimeLabel}</span>
        </button>

        {showTimePicker && (
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-slate-900">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setDrinkTime(option.value);
                  setShowTimePicker(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm ${
                  drinkTime === option.value
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'presets' && (
          <div className="p-4">
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    category === key
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Drink list */}
            <div className="space-y-2">
              {filteredDrinks.map(drink => (
                <DrinkButton key={drink.id} drink={drink} onSelect={handleSelectPreset} />
              ))}
            </div>
          </div>
        )}

        {mode === 'search' && (
          <div className="p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drinks..."
              autoFocus
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="space-y-2">
              {filteredDrinks.map(drink => (
                <DrinkButton key={drink.id} drink={drink} onSelect={handleSelectPreset} />
              ))}
              {searchQuery && filteredDrinks.length === 0 && (
                <p className="text-slate-400 text-center py-8">
                  No drinks found. Try the Custom tab.
                </p>
              )}
            </div>
          </div>
        )}

        {mode === 'custom' && (
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Drink Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Craft IPA"
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ABV: {customAbv}%
              </label>
              <input
                type="range"
                min="1"
                max="60"
                step="0.5"
                value={customAbv}
                onChange={(e) => setCustomAbv(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1%</span>
                <span>30%</span>
                <span>60%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Volume: {customVolume} oz
              </label>
              <input
                type="range"
                min="1"
                max="24"
                step="0.5"
                value={customVolume}
                onChange={(e) => setCustomVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1oz</span>
                <span>12oz</span>
                <span>24oz</span>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-500">{customBudLightEquiv}</div>
              <div className="text-sm text-slate-400">Bud Light Equivalents</div>
            </div>

            <button
              onClick={handleAddCustom}
              disabled={!customName.trim()}
              className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Drink
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DrinkButton({ drink, onSelect }) {
  const budLightEquiv = useMemo(() => {
    const grams = calculateAlcoholGrams(drink.volumeOz, drink.abv);
    return (grams / BUD_LIGHT_GRAMS).toFixed(1);
  }, [drink]);

  return (
    <button
      onClick={() => onSelect(drink)}
      className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-xl p-4 transition-colors"
    >
      <div className="text-left">
        <div className="font-medium text-white">{drink.name}</div>
        <div className="text-sm text-slate-400">
          {drink.volumeOz}oz · {(drink.abv * 100).toFixed(1)}%
        </div>
      </div>
      <div className="text-right">
        <div className="text-amber-500 font-bold">{budLightEquiv}</div>
        <div className="text-xs text-slate-500">BL eq.</div>
      </div>
    </button>
  );
}
