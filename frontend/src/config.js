// Configuration file for environment variables
const config = {
  // API URL with fallback for development
  apiUrl: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
};

export default config;
