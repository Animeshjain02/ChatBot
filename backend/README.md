
# MERN Stack AI Chatbot

This is an AI Chatbot application, inspired by ChatGPT, by using MERN Stack and OpenAI.

## Features
- Customized chatbot with message storage in MongoDB.
- Secure application using JWT Tokens, HTTP-Only Cookies, Signed Cookies, Password Encryption, and Middleware Chains.

## Deployment

### Environment Variables
To deploy the backend, ensure the following environment variables are set:
- `PORT`: Port to run the server (default: 8000).
- `MONGO_URL`: MongoDB Atlas connection string.
- `COOKIE_SECRET`: Secret for cookies.
- `JWT_SECRET`: Secret for JWT tokens.
- `PYTHON_API_URL`: URL of the deployed FastAPI backend (e.g., `https://your-python-app.onrender.com/ask`).
- `FRONTEND_URL`: URL of the deployed frontend to enable CORS (e.g., `https://your-frontend-app.vercel.app`).

### Build and Start
1. Install dependencies: `npm install`
2. Build TypeScript: `npm run build`
3. Start the server: `npm start`

Contributions are welcome.
