import { useState } from 'react';
import { ETHNICITY_FACTORS } from '../utils/constants';

const ETHNICITY_OPTIONS = Object.entries(ETHNICITY_FACTORS).map(([key, value]) => ({
  key,
  label: value.label,
  metabolism: value.metabolism,
  sensitivity: value.sensitivity,
}));

export function ProfileSetup({ onComplete, initialProfile }) {
  const [weight, setWeight] = useState(initialProfile?.weightLbs || 160);
  const [sex, setSex] = useState(initialProfile?.sex || 'male');
  const [age, setAge] = useState(initialProfile?.age || 25);
  const [ethnicity, setEthnicity] = useState(initialProfile?.ethnicity || 'NONE');
  const [sweetSpot, setSweetSpot] = useState(initialProfile?.sweetSpot || 3);
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    onComplete({
      weightLbs: weight,
      sex,
      age,
      ethnicity,
      sweetSpot,
    });
  };

  const selectedEthnicity = ETHNICITY_OPTIONS.find(e => e.key === ethnicity);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">DrinkDaddy</h1>
          <p className="text-slate-400">Let's set up your profile</p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Weight
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="80"
                  max="350"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xl font-bold w-20 text-right">{weight} lbs</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Biological Sex
              </label>
              <p className="text-xs text-slate-500 mb-3">
                This affects how your body processes alcohol
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSex('male')}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                    sex === 'male'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setSex('female')}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                    sex === 'female'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Age
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xl font-bold w-16 text-right">{age}</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors mt-8"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Ethnicity */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ethnicity (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Genetic variations in alcohol-metabolizing enzymes (ALDH2, ADH) vary by ancestry.
                This helps us estimate how quickly you process alcohol.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {ETHNICITY_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setEthnicity(option.key)}
                    className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                      ethnicity === option.key
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.key !== 'NONE' && (
                      <div className={`text-xs mt-1 ${
                        ethnicity === option.key ? 'text-slate-700' : 'text-slate-500'
                      }`}>
                        {option.metabolism < 1 && 'Slower metabolism'}
                        {option.metabolism > 1 && 'Faster metabolism'}
                        {option.metabolism === 1 && option.sensitivity > 1 && 'Higher sensitivity'}
                        {option.metabolism === 1 && option.sensitivity === 1 && 'Standard processing'}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedEthnicity && selectedEthnicity.key !== 'NONE' && (
                <div className="mt-4 bg-slate-800/50 rounded-lg p-4 text-sm">
                  <p className="text-slate-400">
                    {selectedEthnicity.metabolism < 1 && (
                      <>Your ethnicity is associated with slower alcohol metabolism. Alcohol may stay in your system longer.</>
                    )}
                    {selectedEthnicity.metabolism > 1 && (
                      <>Your ethnicity is associated with faster alcohol metabolism. You may process alcohol more quickly.</>
                    )}
                    {selectedEthnicity.sensitivity > 1 && (
                      <> You may feel more intoxicated at lower BAC levels.</>
                    )}
                    {selectedEthnicity.metabolism === 1 && selectedEthnicity.sensitivity === 1 && (
                      <>Standard alcohol metabolism rates will be used.</>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Note: These are population averages. Individual variation exists.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sweet Spot */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Sweet Spot
              </label>
              <p className="text-xs text-slate-500 mb-4">
                How many Bud Lights worth of alcohol makes you feel your best?
                This is your target zone.
              </p>

              <div className="bg-slate-800 rounded-xl p-6 mb-4">
                <div className="text-center mb-4">
                  <span className="text-5xl font-bold text-amber-500">{sweetSpot}</span>
                  <p className="text-slate-400 mt-1">Bud Light equivalents</p>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={sweetSpot}
                  onChange={(e) => setSweetSpot(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">What's a Bud Light equivalent?</p>
                <p>One 12oz Bud Light at 4.2% ABV. Other drinks are converted to this baseline.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition-colors"
              >
                Start Tracking
              </button>
            </div>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-8">
          <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-amber-500' : 'bg-slate-600'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-amber-500' : 'bg-slate-600'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-amber-500' : 'bg-slate-600'}`} />
        </div>
      </div>
    </div>
  );
}
