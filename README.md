# PDFStudy AI (MERN)

A full-stack AI-powered tool for document-based studying, built with React, Vite, Express, and MongoDB.

## What this project includes
- AI chat that uses user documents and saved chat history
- PDF upload and ingestion with text chunking, search, and summaries
- AI-generated flashcards and multiple-choice quizzes
- Quiz submission, scoring, review, and progress tracking
- User authentication with protected frontend routes

## Tech stack
- Frontend: React, Vite, Tailwind CSS, React Router, React Markdown
- Backend: Node.js, Express, JWT authentication, Multer uploads
- Database: MongoDB Atlas or any MongoDB-compatible cluster
- AI: Google Gemini API for quiz and flashcard generation

## Project structure
- `/backend` — Express API server, controllers, routes, models, and utilities
- `/src` — React app source code, components, pages, services, and context
- `/public` — Static frontend assets

## Environment setup
Create a `.env` file inside `backend/` with the following values:

```
MONGO_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_google_generative_ai_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
PORT=8000
NODE_ENV=development
```

## Run locally
1. Install frontend dependencies from the project root:
   ```bash
   npm install
   ```
2. Install backend dependencies inside the backend folder:
   ```bash
   cd backend
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
4. Start the frontend app from the root folder:
   ```bash
   npm run dev
   ```
5. Visit the Vite URL displayed in the terminal to open the app.

## Notes
- The frontend and backend run separately during development.
- Confirm the frontend axios base URL matches the backend API URL if you deploy to another host.
- If quiz or flashcard generation fails, verify the Gemini API key is valid.

## Deployment guidance
- Deploy the backend to a Node.js host and configure the backend `.env` values.
- Build the frontend with `npm run build` and deploy it as a static site.
- Use MongoDB Atlas or another hosted MongoDB service for production storage.
- Point the frontend to the deployed backend API endpoint.
