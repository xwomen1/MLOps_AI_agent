# DevOps AI Chat & Analysis

Complete stack: Next.js frontend with real-time SSE streaming from Go backend.

## Quick Start

### 1. Run Go Backend Locally

```powershell
cd backend
go mod tidy
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="your_api_key_here"
go run main.go
# Server runs on http://localhost:8080
```

### 2. Run Frontend

```powershell
npm run dev
# Open http://localhost:3000
```

### 3. Test Chat

- Go to http://localhost:3000 → Sign In
- Click "Chat" button
- Type a deployment question
- Watch real-time streaming response

## API Endpoint

`POST /api` — expects JSON:
```json
{
  "patient_name": "Chat User",
  "date_of_visit": "2025-12-24",
  "notes": "Your question/logs here"
}
```

Returns: `text/event-stream` with LLM response chunks.

## Pages

- `/` — Home & auth
- `/chat` — **NEW**: Live chat with streaming SSE
- `/product` — Deployment analyzer form

## Deployment Options

### Option A: Local + ngrok tunnel
```powershell
# Terminal 1: Go backend
cd backend
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="..."
go run main.go

# Terminal 2: Frontend
npm run dev

# Terminal 3: ngrok tunnel
# Download from https://ngrok.com
ngrok http 8080
# Copy the https://random.ngrok.io URL
# In chat UI, click API URL and paste ngrok URL
```

### Option B: Vercel frontend + local backend
Set `NEXT_PUBLIC_MOCK_API=true` in `.env.local` to test without backend.

## Environment Variables

Frontend (`.env.local`):
```
LLM_PROVIDER=gemini
GEMINI_API_KEY=...
OPENAI_API_KEY=...
CLERK_JWKS_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
NEXT_PUBLIC_MOCK_API=true  # set to true for mock mode
```

Backend (shell environment or `backend/.env`):
```
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
```

## Features

✅ Real-time SSE streaming chat
✅ Markdown rendering with syntax highlighting
✅ Dark mode support
✅ Configurable API URL (local or ngrok)
✅ Message history in session
✅ CORS-enabled for cross-origin requests
✅ DevOps-focused system prompt

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, ReactMarkdown
- **Backend**: Go, net/http, SSE streaming
- **Auth**: Clerk
- **LLM**: Gemini or OpenAI (selectable)
