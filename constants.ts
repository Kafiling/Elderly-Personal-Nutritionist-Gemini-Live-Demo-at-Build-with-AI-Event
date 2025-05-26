export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_IMAGE_GEN_MODEL = "imagen-3.0-generate-002";

export const NUTRITIONAL_FOCUS_KEYS: string[] = [
  "calciumRich",
  "vitaminDBoost",
  "highProtein",
  "highFiber",
  "lowSodium",
  "easyToChew",
  "easyToDigest",
  "heartHealthy",
  "bloodSugarControl"
];

export const DEFAULT_USER_PREFERENCES = {
  healthConditions: [],
  allergies: [],
  nutritionalFocus: ["easyToChew", "highProtein"], // Using keys now
  likedFoods: [],
  dislikedFoods: [],
};