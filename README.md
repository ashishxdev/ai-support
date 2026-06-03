# Spur Customer Support Agent Widget

This repository contains the code for a live chat widget equipped with an AI Customer Support Agent. The project is divided into a robust, structured **Node.js + TypeScript + Express + Prisma** backend and a responsive, dynamic **Vite + React + TailwindCSS** frontend.

---

## Features

- **Real-Time AI Support Chat**: Interactive widget providing immediate, context-aware answers to user inquiries.
- **Strict FAQ Knowledge Base Grounding**: The AI only answers policy/support questions using the seeded database FAQ knowledge base, preventing hallucinations.
- **Fallback Conversational Warmth**: The AI responds naturally to general user messages (greetings, thanks, small talk).
- **Persistent Chat History**: Session-based conversation logs stored in a PostgreSQL/SQLite database to maintain full context.
- **Model Fallback Rate-Limit Protection**: Automatically rotates through fallback models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, and `gemini-3.5-flash`) if rate limits (`429`) or errors are hit.

---

## Tech Stack

- **Backend**: Node.js, TypeScript, Express, Prisma ORM
- **Database**: PostgreSQL (Production on Neon), SQLite (Optional for quick local setup)
- **LLM Provider**: Google Gemini API via the unified `@google/genai` SDK
- **Frontend**: React, TypeScript, Vite, CSS / TailwindCSS

---

## Project Structure

```
├── Backend/                 # Express API server
│   ├── prisma/              # Prisma schema and migrations
│   ├── src/
│   │   ├── controllers/     # Route request handlers
│   │   ├── lib/             # Third-party client initializations (Prisma)
│   │   ├── repositories/    # Database queries and data access layer
│   │   ├── routes/          # Express route definitions
│   │   ├── schemas/         # Zod schemas for request validation
│   │   ├── scripts/         # Utility scripts (FAQ Seeder)
│   │   ├── services/        # Business logic & LLM connection
│   │   └── index.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React Vite client
│   ├── src/
│   │   ├── components/      # UI components (Widget, ChatMessage, ChatInput)
│   │   ├── services/        # API client services
│   │   └── App.tsx          # Main entry page
│   ├── package.json
│   └── vite.config.ts
```

---

## Installation & Local Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Google AI Studio API Key (Get one free at [aistudio.google.com](https://aistudio.google.com))

---

### Step 1: Set Up the Backend

1. **Navigate to the Backend directory**:
   ```bash
   cd Backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `Backend` directory using the provided example:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your details:
   ```env
   # PostgreSQL connection string (or change provider to sqlite in prisma/schema.prisma)
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

   # Google AI Studio API Key
   GEMINI_API_KEY="your-gemini-api-key-here"

   # Local port
   PORT=8000
   ```

4. **Run Database Migrations**:
   Run the Prisma migration to set up the database tables:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the Database (FAQs)**:
   Seed the FAQ knowledge base:
   ```bash
   npm run seed:faq
   ```

6. **Start the Backend Server**:
   Start the development server with live reload:
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:8000`.

---

### Step 2: Set Up the Frontend

1. **Navigate to the Frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL="http://localhost:8000"
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173` (or the port specified in terminal).

---

## Short Architecture Overview

### Backend Design (Layers)
We structured the backend into distinct layers to enforce Separation of Concerns and facilitate testability:
1. **Routes & Validation**: Express routes define endpoints. Incoming request payloads are validated immediately using **Zod** schemas (`chat.schema.ts`) to prevent bad data from reaching downstream layers.
2. **Controllers**: Handlers (`chat.controller.ts`) receive the validated request, invoke business services, and format the HTTP response. Any thrown errors are caught and translated into proper HTTP status codes.
3. **Services**: Business logic resides here. `chat.service.ts` coordinates database transactions, FAQ fetches, and histories. `llm.service.ts` connects directly to the Google GenAI SDK.
4. **Repositories**: Data Access Objects (`conversation.repository.ts`) encapsulate all database interactions through **Prisma**. Downstream logic is decoupled from direct database drivers or ORM queries.

### Interesting Design Decisions
- **Automatic LLM Fallback (Resiliency)**: Free tier keys are prone to rate limits. We built an automated fallback loop inside `llm.service.ts`. If `gemini-2.5-flash` returns a `429 (Too Many Requests)` status, it intercepts the error and tries `gemini-2.0-flash`, `gemini-2.0-flash-lite`, and `gemini-3.5-flash` sequentially before failing.
- **Stateless/Session Hybrid**: We store sessions in the database (`SessionId`). New sessions are initialized automatically if none is provided, allowing full conversation state and history persistence.

---

## LLM Notes

### Provider
This project uses **Google Gemini** via the unified `@google/genai` SDK. Gemini was chosen due to its high free-tier rate limits, low latency, and large context windows.

### Prompting Strategy
The model configuration utilizes a system instruction that clearly boundaries the AI's persona:
1. **Knowledge Grounding**: The system instruction orders the AI to ONLY answer support questions (billing, cancellations, accounts, governing laws) using the provided FAQ block. If the answer is not found, it is instructed to respond with: `"I don't have that information — please reach out to support@spurnow.com."`
2. **Context Injection**: Each LLM query injects the relevant FAQ knowledge base context directly:
   ```
   [KNOWLEDGE BASE]
   Refund Policy: ...
   Support Contact: ...
   [END KNOWLEDGE BASE]
   ```
3. **Conversational Buffer**: The AI is instructed to be warm and direct for small talk/greetings, but strictly bounded for product/policy statements.
4. **Chat History Memory**: We construct the model call payload with prior conversation rounds (`HistoryTurn[]`) to maintain perfect context over multiple message exchanges.

---

## Trade-offs & "If I Had More Time..."

### Trade-offs
- **SQLite vs PostgreSQL**: For quick setup and evaluation, a local SQLite file is ideal. However, for seamless, zero-maintenance scaling on Render/Vercel, we utilized a hosted PostgreSQL database (via Neon).
- **Keyword FAQ Mapping vs Vector Search (RAG)**: We currently pull all FAQs from the database and feed them into the prompt. Because our FAQ set is compact, this is highly efficient and guarantees 100% recall. As the knowledge base grows to hundreds of pages, this will overflow context windows and increase token costs.

### If I Had More Time...
1. **Semantic Search / Vector Database (RAG)**: Implement PgVector or Pinecone to run embeddings on FAQs and inject only the top-N semantically relevant questions, optimizing token usage.
2. **Caching Layer (Redis)**: Introduce a Redis caching layer to cache the FAQ set, reducing database read latencies on incoming chat events.
3. **Session Expiry / Cleanup**: Set up a background cron/worker to archive or prune inactive/anonymous sessions older than 30 days.
4. **Advanced Analytics Dashboard**: Create a simple dashboard on the backend showing common questions, fallback rates, and customer sentiment markers.
