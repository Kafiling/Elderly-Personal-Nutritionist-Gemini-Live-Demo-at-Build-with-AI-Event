import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserPreferences, Meal, Recipe } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_GEN_MODEL } from '../constants';
import { getEnglishTranslation } from "../src/i18n"; // Forcing English for some prompt parts
import { TranslationKey, Locale } from "../src/contexts/LanguageContext";


if (!process.env.API_KEY) {
  console.error("API_KEY environment variable is not set. Please ensure it's available.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! }); 

const parseJsonFromGeminiResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", responseText);
    const jsonStart = jsonStr.indexOf('[');
    const jsonEnd = jsonStr.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      try {
        return JSON.parse(jsonStr.substring(jsonStart, jsonEnd + 1)) as T;
      } catch (e2) {
         console.error("Secondary parsing attempt failed:", e2);
      }
    }
    const objStart = jsonStr.indexOf('{');
    const objEnd = jsonStr.lastIndexOf('}');
     if (objStart !== -1 && objEnd !== -1) {
      try {
        return JSON.parse(jsonStr.substring(objStart, objEnd + 1)) as T;
      } catch (e3) {
         console.error("Tertiary object parsing attempt failed:", e3);
      }
    }
    return null;
  }
};

export const analyzeRefrigeratorImage = async (base64ImageData: string, language: Locale): Promise<string[]> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', 
        data: base64ImageData,
      },
    };
    
    let languageInstruction = "";
    if (language === 'th') {
      languageInstruction = "The strings in the array should be in Thai. (สตริงในอาร์เรย์ควรเป็นภาษาไทย)";
    }

    const textPart = {
      text: `Analyze this image of an opened refrigerator. List all clearly identifiable edible food ingredients. 
             Prioritize common food items. Return the list as a JSON array of strings. For example: ["eggs", "milk", "carrots"]. 
             ${languageInstruction}
             If no ingredients are clearly identifiable or the image is not a refrigerator, return an empty array.`,
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL, 
      contents: { parts: [imagePart, textPart] },
      config: { responseMimeType: "application/json" } 
    });

    const ingredients = parseJsonFromGeminiResponse<string[]>(response.text);
    return ingredients || [];
  } catch (error) {
    console.error("Error analyzing refrigerator image:", error);
    throw new Error("Failed to analyze refrigerator image. Please ensure the API key is correctly configured and the image is valid.");
  }
};

export const generatePersonalizedMenu = async (ingredients: string[], preferences: UserPreferences, language: Locale): Promise<Meal[]> => {
  try {
    // Convert nutritional focus keys to English display names for the prompt's internal logic
    const nutritionalFocusEnglish = preferences.nutritionalFocus
      .map(key => getEnglishTranslation(`nutritionalFocusOptions_${key}` as TranslationKey))
      .join(', ');

    let languageInstruction = "";
    if (language === 'th') {
      languageInstruction = "All user-facing string values in the JSON (like 'name', 'description', and items in 'mainIngredients') should be in Thai. (ค่าสตริงที่ผู้ใช้เห็นทั้งหมดใน JSON เช่น 'name', 'description', และรายการใน 'mainIngredients' ควรเป็นภาษาไทย)";
    }

    const prompt = `
      You are an AI personal nutritionist for elderly individuals.
      Available ingredients: ${ingredients.join(', ') || 'Assorted common pantry items'}.
      User preferences:
      - Health conditions: ${preferences.healthConditions.join(', ') || 'None specified'}
      - Dietary restrictions (cannot eat): ${preferences.allergies.join(', ') || 'None specified'}
      - Nutritional focus for elderly: Emphasize ${nutritionalFocusEnglish || 'general well-being'}. Ensure meals are easy to digest and chew.
      - Liked foods: ${preferences.likedFoods.join(', ') || 'None specified'}
      - Disliked foods: ${preferences.dislikedFoods.join(', ') || 'None specified'}

      Based on the available ingredients and these preferences, suggest 2-3 simple, healthy, and appealing meal options suitable for an elderly person.
      For each meal, provide:
      1. A short, descriptive name.
      2. A brief description (1-2 sentences) highlighting why it's suitable for the elderly user.
      3. A list of main ingredients used from the available ones (or common staples if specific ones aren't listed as available).

      Return the suggestions as a JSON array of objects. Each object must have 'name' (string), 'description' (string), and 'mainIngredients' (array of strings) keys.
      ${languageInstruction}
      Example (if English):
      [
        {
          "name": "Baked Salmon with Steamed Asparagus",
          "description": "A heart-healthy meal rich in omega-3s and vitamins. Salmon is soft and easy to eat.",
          "mainIngredients": ["salmon fillet", "asparagus", "lemon", "olive oil"]
        }
      ]
      If no suitable meals can be created, return an empty array. Ensure the output is valid JSON.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const meals = parseJsonFromGeminiResponse<Meal[]>(response.text);
    return meals || [];
  } catch (error) {
    console.error("Error generating personalized menu:", error);
    throw new Error("Failed to generate personalized menu.");
  }
};

export const generateRecipe = async (mealName: string, ingredientsUsed: string[], language: Locale): Promise<Recipe | null> => {
  try {
    let languageInstruction = "";
    if (language === 'th') {
      languageInstruction = "All user-facing string values in the JSON (like 'mealName', ingredient 'name's, 'instructions', 'servingSuggestion') should be in Thai. Nutritional information keys and values can remain standard. (ค่าสตริงที่ผู้ใช้เห็นทั้งหมดใน JSON เช่น 'mealName', ชื่อส่วนผสม, 'instructions', 'servingSuggestion' ควรเป็นภาษาไทย คีย์และค่าข้อมูลโภชนาการสามารถคงไว้ตามมาตรฐานได้)";
    }

    const prompt = `
      You are an AI cooking assistant specialized in recipes for elderly individuals.
      Generate a simple, step-by-step recipe for "${mealName}".
      Assume the user has the following main ingredients available: ${ingredientsUsed.join(', ') || 'common pantry items'}. 
      List any other common pantry staples needed (e.g., salt, pepper, oil, small amounts of herbs) if necessary.
      The instructions should be very clear, concise, and easy for an elderly person to follow. Use simple language and short sentences.
      Break down steps into small, manageable actions.
      
      Provide estimated preparation time, cooking time, and key nutritional information. 
      For nutritional information, focus on: calories (approx.), protein (approx.), fiber (approx.), calcium (approx.), vitamin D (approx.), and sodium (approx.).
      If a nutrient is not significant, you can omit it or state 'low'.

      ${languageInstruction}

      Return the result as a JSON object with the following structure:
      {
        "mealName": "Name of the Meal",
        "ingredients": [
          { "name": "Ingredient Name", "quantity": "e.g., 1 cup, 200g, 1 tbsp, to taste" }
        ],
        "instructions": [
          "Step 1: ...",
          "Step 2: ..."
        ],
        "prepTime": "e.g., 15 minutes",
        "cookTime": "e.g., 20 minutes",
        "nutritionalInfo": {
          "calories": "approx. XXX kcal",
          "protein": "approx. XXg",
          "fiber": "approx. Xg",
          "calcium": "approx. XXmg",
          "vitaminD": "approx. Xmcg (or IU)",
          "sodium": "approx. XXmg"
        },
        "servingSuggestion": "Optional: A brief suggestion on how to serve the meal or variations."
      }
      Ensure the entire output is a single, valid JSON object.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return parseJsonFromGeminiResponse<Recipe>(response.text);
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe.");
  }
};

export const generateMealImage = async (mealName: string): Promise<string> => {
  try {
    // Image generation prompts generally work best in English.
    // The mealName itself might be in Thai if translated before this call.
    const response = await ai.models.generateImages({
      model: GEMINI_IMAGE_GEN_MODEL,
      prompt: `A clear, appetizing, well-lit photo of "${mealName}". Healthy home-cooked style. Focus on the food.`,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image generated or image data missing.");
  } catch (error) {
    console.error("Error generating meal image:", error);
    throw new Error(`Failed to generate image for ${mealName}.`);
  }
};