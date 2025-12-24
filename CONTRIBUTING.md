Thank you for your interest in contributing to this project! Please follow these guidelines to make contributions smooth and effective.

1. Get the code

- Fork the repository and create your feature branch:

  git checkout -b feature/your-change

2. Development

- Install dependencies:

  npm install

- Run frontend locally:

  npm run dev

- Run backend locally (Go):

  cd backend
  go mod tidy
  go run main.go

- For SSE testing, you can use ngrok to expose your local backend:

  ngrok http 8080

3. Coding style

- Use TypeScript for frontend files and keep lint rules passing.
- Format code with Prettier and run ESLint before committing.

4. Tests

- Add tests where appropriate. Run frontend tests (if any) with your usual test runner.

5. Branching & PRs

- Keep PRs small and focused.
- Include a clear description, motivation, and screenshots if UI changes.
- Reference any related issue numbers in the PR description.

6. Environment variables

- Do not commit secrets or API keys. Use `.env.local` for local development.
- Add any new environment variables to `README.md` or `CHAT_README.md`.

7. Code review

- I will review PRs and request changes when needed. Please respond to review comments quickly to keep momentum.

8. Reporting issues

- Open an issue if you find a bug or want to propose a new feature. Provide steps to reproduce and any relevant logs.

Thanks — we appreciate your help!