import React from 'react';
import { Recipe } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage, TranslationKey } from '../src/contexts/LanguageContext';

interface RecipeDisplayProps {
  recipe: Recipe | null;
  mealImage: string | null;
  isLoadingImage: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, mealImage, isLoadingImage }) => {
  const { t } = useLanguage();

  if (!recipe) {
    return <p className="text-center text-gray-500">{t('noRecipeAvailable')}</p>;
  }

  // Helper to get nutrient translation key
  const getNutrientTranslationKey = (nutrientKey: string): TranslationKey => {
    const key = `nutrient_${nutrientKey.toLowerCase()}` as TranslationKey;
    // Check if this specific key exists, otherwise use a general formatter or fallback.
    // For simplicity, we assume specific keys like nutrient_calories, nutrient_protein are defined.
    // A more robust solution would check `t(key) !== key` or have a list of known nutrient keys.
    return key;
  };


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">{recipe.mealName}</h2> {/* From API */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-6">
          {isLoadingImage && <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"><LoadingSpinner message={t('loadingImage')} /></div>}
          {!isLoadingImage && mealImage && (
            <img 
              src={mealImage} 
              alt={recipe.mealName} 
              className="w-full h-auto object-cover rounded-xl shadow-lg aspect-square transition-opacity duration-500 ease-in-out opacity-100" 
            />
          )}
          {!isLoadingImage && !mealImage && (
             <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
             </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{t('quickInfo')}</h3>
            <p className="text-sm text-gray-700"><strong>{t('prepTime')}</strong> {recipe.prepTime}</p>
            <p className="text-sm text-gray-700"><strong>{t('cookTime')}</strong> {recipe.cookTime}</p>
            {recipe.servingSuggestion && <p className="text-sm text-gray-700 mt-2"><strong>{t('servingSuggestion')}</strong> {recipe.servingSuggestion}</p>}
          </div>

          {recipe.nutritionalInfo && (
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">{t('nutritionalInfoTitle')}</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {Object.entries(recipe.nutritionalInfo).map(([key, value]) => {
                  if (!value) return null;
                  const translationKey = getNutrientTranslationKey(key);
                  let displayKey = t(translationKey);
                  if (displayKey === translationKey) { // Fallback if specific translation not found
                    displayKey = t('nutrient_default_format' as TranslationKey, { key: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) });
                  }
                  return (
                    <li key={key}>
                      <span className="font-medium">{displayKey}:</span> {value}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('ingredients')}</h3>
            <ul className="list-disc list-outside pl-5 space-y-1 text-gray-600">
              {recipe.ingredients.map((ing, index) => (
                <li key={index}>
                  <span className="font-medium">{ing.name}:</span> {ing.quantity} {/* From API */}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('instructions')}</h3>
            <ol className="list-decimal list-outside pl-5 space-y-3 text-gray-700">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li> /* From API */
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;