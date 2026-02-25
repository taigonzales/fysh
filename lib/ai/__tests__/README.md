# AI Module Tests

## Setup

Before running tests, ensure you have:

1. **Installed dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables** in `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run specific test file:
```bash
npm test lib/ai/__tests__/claude-client.test.ts
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Test Files

- `claude-client.test.ts` - Tests for ClaudeClient wrapper
  - Basic text analysis (`analyze` method)
  - Structured JSON output with Zod validation (`analyzeStructured` method)
  - Error handling

## Notes

- Tests make real API calls to Claude
- Requires valid ANTHROPIC_API_KEY
- Tests use small token limits to minimize API costs
- Timeout is set to 30 seconds for API calls
