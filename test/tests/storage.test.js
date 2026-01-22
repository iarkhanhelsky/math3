QUnit.module('Storage', (hooks) => {
    hooks.beforeEach(() => {
        // Clear storage before each test
        Storage.clearAll();
    });

    QUnit.test('getDefaultData returns correct structure', (assert) => {
        const data = Storage.getDefaultData();
        
        assert.ok(data.currentState, 'Has currentState');
        assert.ok(data.exerciseHistory, 'Has exerciseHistory');
        assert.ok(data.roundHistory, 'Has roundHistory');
        assert.ok(data.streak, 'Has streak');
        assert.equal(data.currentState.exerciseCount, 0, 'Initial exercise count is 0');
        assert.equal(data.currentState.roundNumber, 1, 'Initial round number is 1');
    });

    QUnit.test('saveState and getState work correctly', (assert) => {
        const testState = {
            exerciseCount: 5,
            roundNumber: 1,
            currentExercise: { a: 5, b: 3, operation: '+', answer: 8 },
            currentInput: "8",
            roundStartTime: Date.now(),
            exerciseStartTime: Date.now(),
            currentBlock: [],
            blockIndex: 0,
            currentOperation: '+',
            currentComplexity: 'both_small'
        };

        Storage.saveState(testState);
        const loadedState = Storage.getState();

        assert.equal(loadedState.exerciseCount, 5, 'Exercise count saved correctly');
        assert.equal(loadedState.currentInput, "8", 'Current input saved correctly');
        assert.equal(loadedState.currentExercise.a, 5, 'Current exercise saved correctly');
    });

    QUnit.test('saveExercise and getExerciseHistory work correctly', (assert) => {
        const exercise = { a: 5, b: 3, operation: '+', answer: 8, complexity: 'both_small' };
        const time = 1500;
        const correct = true;

        Storage.saveExercise(exercise, time, correct);
        const history = Storage.getExerciseHistory();

        assert.equal(history.length, 1, 'Exercise added to history');
        assert.equal(history[0].exercise.a, 5, 'Exercise data saved correctly');
        assert.equal(history[0].time, 1500, 'Time saved correctly');
        assert.equal(history[0].correct, true, 'Correctness saved correctly');
        assert.ok(history[0].timestamp, 'Timestamp added');
    });

    QUnit.test('saveRound and getRoundHistory work correctly', (assert) => {
        const roundData = {
            totalTime: 250000,
            avgTime: 2500,
            correct: 95,
            incorrect: 5,
            correctnessRate: 95,
            adjustedTime: 255000,
            starRating: 3
        };

        Storage.saveRound(roundData);
        const history = Storage.getRoundHistory();

        assert.equal(history.length, 1, 'Round added to history');
        assert.equal(history[0].roundId, 1, 'Round ID set correctly');
        assert.equal(history[0].correct, 95, 'Correct count saved');
        assert.equal(history[0].incorrect, 5, 'Incorrect count saved');
        assert.equal(history[0].starRating, 3, 'Star rating saved');
        assert.ok(history[0].date, 'Date added');
    });

    QUnit.test('updateStreak handles first activity', (assert) => {
        Storage.updateStreak();
        const streak = Storage.getStreakInfo();

        assert.equal(streak.current, 1, 'First activity sets streak to 1');
        assert.ok(streak.lastActivity, 'Last activity timestamp set');
    });

    QUnit.test('updateStreak handles consecutive days', (assert) => {
        const data = Storage.loadData();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        data.streak.lastActivity = yesterday.getTime();
        data.streak.current = 5;
        Storage.saveData(data);

        Storage.updateStreak();
        const streak = Storage.getStreakInfo();

        assert.equal(streak.current, 6, 'Consecutive day increments streak');
    });

    QUnit.test('updateStreak handles grace period (48 hours)', (assert) => {
        const data = Storage.loadData();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        data.streak.lastActivity = twoDaysAgo.getTime();
        data.streak.current = 10;
        Storage.saveData(data);

        Storage.updateStreak();
        const streak = Storage.getStreakInfo();

        assert.equal(streak.current, 11, 'Within grace period maintains streak');
    });

    QUnit.test('updateStreak resets after grace period', (assert) => {
        const data = Storage.loadData();
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        data.streak.lastActivity = threeDaysAgo.getTime();
        data.streak.current = 10;
        Storage.saveData(data);

        Storage.updateStreak();
        const streak = Storage.getStreakInfo();

        assert.equal(streak.current, 1, 'Beyond grace period resets streak to 1');
    });

    QUnit.test('clearAll removes all data', (assert) => {
        Storage.saveExercise({ a: 1, b: 2, operation: '+', answer: 3 }, 1000, true);
        Storage.saveRound({ totalTime: 100000, avgTime: 1000, correct: 100, incorrect: 0, 
                           correctnessRate: 100, adjustedTime: 100000, starRating: 3 });

        Storage.clearAll();
        const data = Storage.loadData();

        assert.equal(data.exerciseHistory.length, 0, 'Exercise history cleared');
        assert.equal(data.roundHistory.length, 0, 'Round history cleared');
        assert.equal(data.streak.current, 0, 'Streak reset');
    });
});
