import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { NUTRITIONAL_FOCUS_KEYS, DEFAULT_USER_PREFERENCES } from '../constants';
import Button from './shared/Button';
import { useLanguage, TranslationKey } from '../src/contexts/LanguageContext';

interface PreferenceFormProps {
  initialPreferences?: UserPreferences;
  onSubmit: (preferences: UserPreferences) => void;
  isLoading: boolean;
}

const InputField: React.FC<{
  labelKey: TranslationKey;
  name: keyof UserPreferences;
  value: string[];
  onChange: (field: keyof UserPreferences, value: string) => void;
  placeholderKey: TranslationKey;
  hintKey: TranslationKey;
  ariaDescribedBy?: string;
}> = ({ labelKey, name, value, onChange, placeholderKey, hintKey, ariaDescribedBy }) => {
  const { t } = useLanguage();
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{t(labelKey)}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value.join(', ')}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={t(placeholderKey)}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        aria-describedby={ariaDescribedBy || `${name}-description`}
      />
      <p id={`${name}-description`} className="text-xs text-gray-500 mt-1">{t(hintKey)}</p>
    </div>
  );
};

const PreferenceForm: React.FC<PreferenceFormProps> = ({ initialPreferences = DEFAULT_USER_PREFERENCES, onSubmit, isLoading }) => {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);
  
  const handleTextArrayChange = (field: keyof UserPreferences, value: string) => {
     setPreferences(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()).filter(s => s) }));
  };

  const handleNutritionalFocusChange = (focusKey: string) => {
    setPreferences(prev => {
      const newFocus = prev.nutritionalFocus.includes(focusKey)
        ? prev.nutritionalFocus.filter(f => f !== focusKey)
        : [...prev.nutritionalFocus, focusKey];
      return { ...prev, nutritionalFocus: newFocus };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField 
        labelKey="healthConditionsLabel"
        name="healthConditions"
        value={preferences.healthConditions}
        onChange={handleTextArrayChange}
        placeholderKey="healthConditionsPlaceholder"
        hintKey="commaSeparatedHint"
      />
      <InputField 
        labelKey="allergiesLabel"
        name="allergies"
        value={preferences.allergies}
        onChange={handleTextArrayChange}
        placeholderKey="allergiesPlaceholder"
        hintKey="commaSeparatedHint"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('nutritionalFocusLabel')}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {NUTRITIONAL_FOCUS_KEYS.map(focusKey => (
            <label key={focusKey} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.nutritionalFocus.includes(focusKey)}
                onChange={() => handleNutritionalFocusChange(focusKey)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{t(`nutritionalFocusOptions_${focusKey}` as TranslationKey)}</span>
            </label>
          ))}
        </div>
      </div>

      <InputField 
        labelKey="likedFoodsLabel"
        name="likedFoods"
        value={preferences.likedFoods}
        onChange={handleTextArrayChange}
        placeholderKey="likedFoodsPlaceholder"
        hintKey="commaSeparatedHint"
      />
      <InputField 
        labelKey="dislikedFoodsLabel"
        name="dislikedFoods"
        value={preferences.dislikedFoods}
        onChange={handleTextArrayChange}
        placeholderKey="dislikedFoodsPlaceholder"
        hintKey="commaSeparatedHint"
      />

      <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full sm:w-auto" size="lg">
        {t('getMealSuggestions')}
      </Button>
    </form>
  );
};

export default PreferenceForm;