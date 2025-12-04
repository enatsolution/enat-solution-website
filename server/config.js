// Configuration for the application
// You can change these values or use environment variables

module.exports = {
  // The password to access the application
  // Change this to your desired password!
  APP_PASSWORD: process.env.APP_PASSWORD || 'candidate123',

  // Session secret for secure cookies
  SESSION_SECRET: process.env.SESSION_SECRET || 'candidate-profile-search-secret-key-2024',

  // Server port
  PORT: process.env.PORT || 3001,

  // Google Custom Search API (FREE - 100 queries/day, or $5/1000 queries with billing)
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'AIzaSyD26B64gYPEbLgNN9gAzeuoahh-HIFpHsI',
  GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID || '1132a4de88dc249b3'
};

