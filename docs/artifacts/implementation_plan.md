# ESLint Configuration Fix

The current `tsconfig.json` excludes test files to prevent them from being compiled into the `dist` folder. However, ESLint is configured to use this same `tsconfig.json` to parse all `.ts` files, including tests. This causes a parsing error because TypeScript doesn't "know" about the test files in that context.

## Proposed Changes

### Backend

#### [NEW] [tsconfig.eslint.json](file:///k:/LETS/ANT/lets-roll-cursor/backend/tsconfig.eslint.json)

Create a new TSConfig file specifically for ESLint. This will extend the main config but ensure test files are included.

#### [MODIFY] [eslint.config.js](file:///k:/LETS/ANT/lets-roll-cursor/backend/eslint.config.js)

Update the `parserOptions.project` to point to the new `tsconfig.eslint.json` instead of `tsconfig.json`.

## Verification Plan

### Automated Tests

- Run `npm run lint` (if available) or `npx eslint "src/services/__tests__/ritualService.test.ts"` in the backend directory to confirm the error is gone.
- Run `npm run build` (or `tsc`) to ensure the main build still excludes test files (by checking that `dist` doesn't contain `__tests__` or that `tsc` uses `tsconfig.json` by default).

### Manual Verification

- The user can open the file in their editor and see if the red squiggle disappears (implied).
