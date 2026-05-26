module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiry: '7d',
  grokApiKey: process.env.GROK_API_KEY,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  nlpServiceUrl: process.env.NLP_SERVICE_URL || 'http://localhost:8000',
  mongoUri: process.env.MONGO_URI,
};