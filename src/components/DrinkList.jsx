import { useMemo, useEffect, useState } from 'react';
import { BUD_LIGHT_GRAMS } from '../utils/constants';

export function DrinkList({ drinks, onRemove }) {
  // Sort by timestamp, newest first - must be before any conditional returns
  const sortedDrinks = useMemo(() => {
    return [...drinks].sort((a, b) => b.timestamp - a.timestamp);
  }, [drinks]);

  if (drinks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No drinks logged yet</p>
        <p className="text-sm mt-1">Tap the + button to add your first drink</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-400 mb-3">
        Session Drinks ({drinks.length})
      </h3>
      {sortedDrinks.map(drink => (
        <DrinkItem key={drink.id} drink={drink} onRemove={onRemove} />
      ))}
    </div>
  );
}

function DrinkItem({ drink, onRemove }) {
  const budLightEquiv = (drink.gramsAlcohol / BUD_LIGHT_GRAMS).toFixed(1);

  // Use state to track current time, updating every minute for time ago display
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const timeAgo = useMemo(() => {
    const minutes = Math.floor((now - drink.timestamp) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m ago`;
  }, [now, drink.timestamp]);

  return (
    <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4">
      <div className="flex-1">
        <div className="font-medium text-white">{drink.name}</div>
        <div className="text-sm text-slate-400">
          {drink.volumeOz}oz · {(drink.abv * 100).toFixed(1)}% · {timeAgo}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-amber-500 font-bold">{budLightEquiv}</div>
          <div className="text-xs text-slate-500">BL eq.</div>
        </div>
        <button
          onClick={() => onRemove(drink.id)}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
