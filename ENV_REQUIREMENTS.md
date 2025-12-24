# Environment Variables Required for This Project

## Required Environment Variables

### 1. Clerk Authentication (REQUIRED for app to work)
These are needed for `ClerkProvider` in `pages/_app.tsx`:

- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** (Public - used in browser)
  - Format: `pk_test_...` or `pk_live_...`
  - Required for: Authentication UI components (SignInButton, UserButton, etc.)
  - Scope: Browser (public)

- **`CLERK_SECRET_KEY`** (Secret - server-side only)
  - Format: `sk_test_...` or `sk_live_...`
  - Required for: Server-side authentication verification
  - Scope: Server only

### 2. Google Generative AI (REQUIRED for API route)
Used in `pages/api/consultation.ts`:

- **`GOOGLE_API_KEY`** (Secret - server-side only)
  - Format: `AIza...`
  - Required for: `/api/consultation` endpoint to generate AI responses
  - Scope: Server only

## Optional Environment Variables

### 3. Python Backend (NOT USED - can be ignored)
The Python files in `api/` directory are not used in the Next.js deployment:
- `CLERK_JWKS_URL` - Only needed if using the Python FastAPI backend

## Setup Instructions

### Local Development (.env.local)
Create a `.env.local` file in the `saas/` directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
GOOGLE_API_KEY=AIza_your_api_key_here
```

### Vercel Deployment
Add these variables in Vercel Dashboard:
1. Go to: **Settings → Environment Variables**
2. Add all three variables above
3. Select environments: **Production**, **Preview**, and **Development**
4. Redeploy your project

## Notes
- `.env.local` is gitignored (won't be committed)
- Vercel does NOT automatically read `.env.local` files
- All environment variables must be manually added in Vercel Dashboard
- Missing Clerk variables will cause the app to fail with 404 or initialization errors
- Missing `GOOGLE_API_KEY` will cause `/api/consultation` to return 500 error

