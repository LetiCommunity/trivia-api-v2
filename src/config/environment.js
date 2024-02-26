module.exports = {
    /* 
    Function: Database configuration
    Description: Contains the configuration for the database connection
    Input: 
        - MONGO_HOST: string (optional) - the host URL for the MongoDB database
        - MONGO_DATABASE: string (optional) - the name of the MongoDB database
        - MONGO_USERNAME: string (optional) - the username for the MongoDB database
        - MONGO_PASSWORD: string (optional) - the password for the MongoDB database
    Output: N/A
    */

    MONGO_HOST: process.env.DB_HOST || "mongodb://127.0.0.1:27017/",
    MONGO_DATABASE: process.env.DB_DATABASE || "triviadbtest",
    MONGO_USERNAME: process.env.DB_USERNAME || "",
    MONGO_PASSWORD: process.env.DB_PASSWORD || "",
  
    /* 
    Function: Server configuration
    Description: Contains the configuration for the server
    Input: 
        - PORT: number (optional) - the port number for the server
        - ENVIRONMENT: string (optional) - the environment for the server
    Output: N/A
    */

    PORT: process.env.PORT || 5000,
    ENVIRONMENT:process.env.NODE_ENV = process.env.NODE_ENV || 'dev',
  
    /* 
    Function: Security configuration
    Description: Contains the configuration for security settings
    Input: 
        - JWT_SECRET: string (optional) - the secret key for JWT
        - TOKEN_EXPIRATION: string (optional) - the expiration time for the token
    Output: N/A
    */
    
    JWT_SECRET: process.env.JWT_SECRET || "trivia_secret_key",
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || "365d",
  };
