module.exports = {
    /* Database configuration */

    MONGO_HOST: process.env.DB_HOST || "mongodb://127.0.0.1:27017/",
    MONGO_DATABASE: process.env.DB_DATABASE || "triviadb",
    MONGO_USERNAME: process.env.DB_USERNAME || "",
    MONGO_PASSWORD: process.env.DB_PASSWORD || "",
  
    /* Server configuration */

    PORT: process.env.PORT || 5000,
    ENVIRONMENT:process.env.NODE_ENV = process.env.NODE_ENV || 'dev',
  
    /* Security configuration */
    
    JWT_SECRET: process.env.JWT_SECRET || "trivia_secret_key",
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || "365d",
  };