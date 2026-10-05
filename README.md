# JarvisAI

JarvisAI is a full-stack AI workspace for chatting with specialized agents, attaching files, generating artifacts, and managing conversations. The project is split into two GitHub repositories:

- Frontend: [Jarvis-AI-Frontend](https://github.com/shivamprajapati123/Jarvis-AI-Frontend)
- Backend: [Jarvis-AI-Backend](https://github.com/shivamprajapati123/Jarvis-AI-Backend)

This workspace contains both applications for local development.

## Features

- Google authentication with Firebase
- Conversation history and conversation management
- AI agents for general chat, coding, PDF, PPT, vision, and web search workflows
- File uploads and generated images, PDFs, and presentations
- Markdown rendering and syntax-highlighted code
- Monaco-powered artifact/code preview
- Speech input and text-to-speech responses
- Razorpay billing and plan management
- Responsive desktop, tablet, and mobile layouts

## Architecture

```text
Browser
  |
  v
React + Vite frontend
  |
  v
Backend gateway
  |-------- Auth service ------ Firebase Admin, MongoDB, Redis
  |-------- Chat service ------ MongoDB
  |-------- Agent service ----- LLMs, Qdrant, file processing
  |-------- Billing service --- Razorpay
  |
  `-------- Redis ------------- shared service state/cache
```

### Frontend

The frontend is a React 19 application built with Vite and Tailwind CSS. It contains the chat interface, sidebar, composer, authentication flow, artifact viewer, and responsive mobile overlays.

### Backend

The backend is an Express-based service architecture:

- `gateway`: public API entry point, CORS, authentication middleware, and service proxying
- `services/auth`: Firebase token authentication, users, plans, and credits
- `services/chat`: conversations and message persistence
- `services/agent`: AI orchestration, file processing, embeddings, artifact generation, and object storage
- `services/billing`: Razorpay order and payment handling
- `shared/redis`: Redis client used by backend services

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop (recommended for Redis)
- MongoDB
- Firebase project
- API credentials for the AI, search, vector database, storage, and billing integrations used by the enabled agents

## Installation

Clone the frontend repository or this combined workspace:

```bash
git clone https://github.com/shivamprajapati123/Jarvis-AI-Frontend.git
cd Jarvis-AI-Frontend
```

If you are using the combined workspace, install dependencies in each application:

```bash
cd frontend
npm install

cd ../backend/gateway
npm install

cd ../services/auth
npm install

cd ../services/chat
npm install

cd ../services/agent
npm install

cd ../services/billing
npm install
```

## Environment configuration

Create local `.env` files. Do not commit credentials, private keys, or production configuration.

### Frontend

Create `frontend/.env` with the Firebase web configuration, Razorpay public key, and gateway URL:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_RAZORPAY_KEY_ID=
VITE_SERVER_URL=http://localhost:8000
```

### Gateway

Create `backend/gateway/.env`:

```env
PORT=8000
FRONTEND_URL=http://localhost:5173
AUTH_SERVICE=http://localhost:<auth-port>
CHAT_SERVICE=http://localhost:<chat-port>
AGENT_SERVICE=http://localhost:<agent-port>
BILLING_SERVICE=http://localhost:<billing-port>
```

### Services

Each backend service loads its own `.env`. The exact values depend on your deployment, but the service configuration includes:

- `PORT`
- `MONGODB_URI`
- `REDIS_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_MODEL` and the required LLM/search provider keys
- `QDRANT_URL`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Internal service URLs such as `AUTH_SERVICE` and `CHAT_SERVICE`

Keep private keys in environment variables and replace escaped Firebase private-key newlines with the format expected by the auth service.

## Running locally

### Start Redis

From `backend`:

```bash
docker compose up -d redis
```

### Start backend services

Run each service in its own terminal:

```bash
cd backend/gateway
npm run dev
```

```bash
cd backend/services/auth
npm run dev
```

```bash
cd backend/services/chat
npm run dev
```

```bash
cd backend/services/agent
npm run dev
```

```bash
cd backend/services/billing
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Frontend commands

Run these from `frontend`:

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

## Backend commands

Run these from each backend service directory:

```bash
npm run dev       # Start with nodemon
npm start         # Start with Node.js
```

## Production build

Build the frontend before deployment:

```bash
cd frontend
npm run build
```

The generated files are written to `frontend/dist`. Deploy the backend services independently and configure the gateway's service URLs and allowed frontend origin for the deployed environment.

## Security notes

- Never commit `.env` files, Firebase private keys, cloud credentials, or Razorpay secrets.
- Use a separate Firebase project and payment credentials for development.
- Restrict CORS to trusted frontend origins.
- Rotate credentials immediately if they are accidentally exposed.

## License

No project license has been specified yet.
