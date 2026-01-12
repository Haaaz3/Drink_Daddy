const FOOD_OPTIONS = [
  { value: 'NONE', label: 'Empty', description: 'No food' },
  { value: 'LIGHT', label: 'Light', description: 'Snack/light meal' },
  { value: 'FULL', label: 'Full', description: 'Full meal' },
];

export function FoodToggle({ value, onChange }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-300">Food Status</span>
        <span className="text-xs text-slate-500">Affects absorption rate</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {FOOD_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`py-3 px-2 rounded-lg text-center transition-colors ${
              value === option.value
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div className="font-medium text-sm">{option.label}</div>
            <div className={`text-xs mt-0.5 ${
              value === option.value ? 'text-slate-700' : 'text-slate-500'
            }`}>
              {option.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
