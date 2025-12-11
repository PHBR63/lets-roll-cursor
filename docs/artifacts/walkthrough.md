# ESLint Configuration Fix Walkthrough

I have resolved the ESLint parsing error for test files by creating a specific TypeScript configuration for linting.

## Changes

- **Created** `backend/tsconfig.eslint.json`: A new TSConfig that extends the base config but explicitly includes test files (`src/**/*.test.ts`, `src/**/__tests__/*`).
- **Updated** `backend/eslint.config.js`: Pointed `parserOptions.project` to the new `tsconfig.eslint.json` instead of the default `tsconfig.json`.

## Verification Results

Ran `npx eslint src/services/__tests__/ritualService.test.ts` in the backend directory.

**Output:**

```
Exit code: 0
```

This confirms that ESLint can now correctly parse the test files without the "TSConfig does not include this file" error.
