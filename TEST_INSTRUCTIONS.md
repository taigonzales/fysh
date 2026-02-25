# Test Instructions for Task 2: Claude API Client

## Prerequisites

You need to complete these steps before running the tests:

### 1. Install New Dependencies

The following packages were added to `package.json`:
- `jest` - Test runner
- `ts-jest` - TypeScript support for Jest
- `@types/jest` - TypeScript types for Jest

Install them by running:
```bash
pnpm install
```

### 2. Verify Environment Variables

Ensure your `.env.local` file contains:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test lib/ai/__tests__/claude-client.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

## Expected Test Results

The test suite includes 3 tests:

1. **Basic text analysis** - Tests the `analyze()` method
   - Makes a real API call to Claude
   - Verifies response is a non-empty string
   - Uses minimal tokens (maxTokens: 50)

2. **Structured JSON output** - Tests the `analyzeStructured()` method
   - Makes a real API call to Claude
   - Requests JSON response
   - Validates with Zod schema
   - Tests betting analysis use case

3. **Error handling** - Tests API error handling
   - Uses invalid API key
   - Verifies error is thrown appropriately

## TDD Steps Completed

This implementation followed Test-Driven Development:

- ✅ Step 1: Write failing test for basic analyze method
- ✅ Step 2: Run test to verify it fails (requires manual run)
- ✅ Step 3: Create minimal Claude client implementation
- ✅ Step 4: Run test to verify it passes (requires manual run)
- ✅ Step 5: Write failing test for structured analysis with Zod
- ✅ Step 6: Run test to verify it fails (requires manual run)
- ✅ Step 7: Implement analyzeStructured method
- ✅ Step 8: Run test to verify it passes (requires manual run)
- ✅ Step 9: Add error handling test
- ✅ Step 10: Run test to verify error handling (requires manual run)
- ⏳ Step 11: Commit (ready for user to execute)

## Notes

- Tests make **real API calls** to Claude (will consume API credits)
- Tests use small token limits to minimize costs
- First two tests require valid ANTHROPIC_API_KEY
- Third test intentionally uses invalid key to test error handling
- Jest is configured in `jest.config.js` with ts-jest preset

## Troubleshooting

If tests fail:
1. Verify `pnpm install` completed successfully
2. Check `.env.local` has valid ANTHROPIC_API_KEY
3. Ensure you have internet connection (for API calls)
4. Check Claude API status if all else is correct

## What Was Implemented

### `lib/ai/claude-client.ts`
- `ClaudeClient` class wrapping Anthropic SDK
- `analyze()` - Basic text analysis method
- `analyzeStructured()` - JSON output with Zod validation and retry logic

### `lib/ai/__tests__/claude-client.test.ts`
- Complete test suite with 3 test cases
- Uses Jest (adapted from Vitest spec)
- Tests both methods and error handling
