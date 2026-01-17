// Image constraints
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_APARTMENT = 10;
export const MAX_IMAGES_PER_USER = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Location
export const DEFAULT_SEARCH_RADIUS = 10; // km
export const MAX_SEARCH_RADIUS = 50; // km

// Matching
export const APARTMENT_COMPATIBILITY_WEIGHT = 0.7;
export const ROOMMATE_COMPATIBILITY_WEIGHT = 0.3;
export const MIN_MATCH_SCORE_FOR_DISPLAY = 50;

// AI Tags
export const APARTMENT_VIBES = [
  'modern',
  'minimalist',
  'rustic',
  'bohemian',
  'industrial',
  'cozy',
  'bright',
  'luxury',
  'student-vibes',
  'family-friendly',
] as const;

export const PERSON_VIBES = [
  'extrovert',
  'introvert',
  'party-animal',
  'chill',
  'studious',
  'artistic',
  'fitness',
  'pet-lover',
  'gamer',
  'foodie',
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
