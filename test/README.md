# Math Trainer Test Suite

This directory contains comprehensive tests for the Math Trainer application using [QUnit](https://qunitjs.com/).

## Running the Tests

### Option 1: Open in Browser
Simply open `test/index.html` in your web browser. The QUnit test runner will automatically execute all tests.

### Option 2: Using a Local Server
If you're already running the app on a local server, navigate to:
```
http://localhost:8000/test/index.html
```

## Test Coverage

### Storage Tests (`tests/storage.test.js`)
- Default data structure
- State save/load functionality
- Exercise history management
- Round history management
- Daily streak tracking (including grace period)
- Data clearing

### Exercise Generator Tests (`tests/exerciseGenerator.test.js`)
- Exercise generation for all operations and complexities
- Result validation (< 100, >= 0)
- Zero as a valid number
- Block generation consistency
- Progressive complexity selection
- Operation alternation

### Timer Tests (`tests/timer.test.js`)
- Exercise timing
- Round timing
- Time formatting (milliseconds, seconds, minutes)
- Edge cases (no start, etc.)

### Stats Tests (`tests/stats.test.js`)
- Star rating calculation (0-3 stars)
- 90% correctness requirement
- Penalty application (1 second per wrong answer)
- Round statistics calculation
- All-time statistics calculation
- Streak information retrieval

### Integration Tests (`tests/integration.test.js`)
- Complete round flow
- Progressive complexity throughout round
- Block consistency
- State persistence
- Multi-day streak tracking
- Multiple rounds with statistics
- Exercise validation constraints

## Test Structure

Each test file follows QUnit conventions:
- `QUnit.module()` - Groups related tests
- `QUnit.test()` - Individual test cases
- `hooks.beforeEach()` - Setup before each test
- `assert.*()` - Assertions for test validation

## Running Specific Tests

You can filter tests in the QUnit UI by:
- Module name
- Test name
- Status (pass/fail)

## Expected Results

All tests should pass when the application is working correctly. The test suite validates:
- ✅ All exercise constraints (answers < 100, >= 0)
- ✅ Progressive complexity system
- ✅ Star rating system
- ✅ Storage persistence
- ✅ Timer accuracy
- ✅ Statistics calculations
- ✅ Streak tracking

## Adding New Tests

When adding new features, add corresponding tests:
1. Create or update the appropriate test file
2. Follow the existing test structure
3. Use descriptive test names
4. Test both success and edge cases
