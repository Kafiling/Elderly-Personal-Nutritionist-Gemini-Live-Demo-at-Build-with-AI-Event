import React, { useState, useEffect } from 'react';
import { Meal } from '../types';
import Button from './shared/Button';
import { useLanguage } from '../src/contexts/LanguageContext';

interface MealCardProps {
  meal: Meal;
  onViewRecipe: (meal: Meal) => void;
  delay?: number;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onViewRecipe, delay = 0 }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex flex-col justify-between hover:-translate-y-1 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDuration: '500ms', transitionDelay: `${delay}ms`}}
    >
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mb-2">{meal.name}</h3> {/* Meal name from API, not translated here */}
        <p className="text-gray-600 text-sm mb-3">{meal.description}</p> {/* Meal description from API */}
        {meal.mainIngredients && meal.mainIngredients.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500 mb-1">{t('mainIngredients')}</p>
            <ul className="list-disc list-inside pl-1 space-y-0.5">
              {meal.mainIngredients.map((ingredient, index) => (
                <li key={index} className="text-sm text-gray-600">{ingredient}</li> // Ingredient from API
              ))}
            </ul>
          </div>
        )}
      </div>
      <Button onClick={() => onViewRecipe(meal)} variant="ghost" size="md" className="w-full mt-auto">
        {t('viewRecipeDetails')}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </Button>
    </div>
  );
};

export default MealCard;