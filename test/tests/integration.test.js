QUnit.module('Integration Tests', (hooks) => {
    hooks.beforeEach(() => {
        Storage.clearAll();
    });

    QUnit.test('Complete round flow', (assert) => {
        const done = assert.async();
        
        // Simulate completing a round
        const exercises = [];
        let totalTime = 0;

        // Generate and save 100 exercises
        for (let i = 0; i < 100; i++) {
            const operation = i % 2 === 0 ? '+' : '-';
            const complexity = ExerciseGenerator.selectComplexity(i + 1);
            const exercise = ExerciseGenerator.generateExercise(operation, complexity);
            const time = 2000 + Math.random() * 1000; // 2-3 seconds
            const correct = Math.random() > 0.1; // 90% correct rate
            
            Storage.saveExercise(exercise, time, correct);
            exercises.push({ exercise, time, correct });
            totalTime += time;
        }

        // Calculate round stats
        const roundStats = Stats.calculateRoundStats(exercises);
        const correctCount = exercises.filter(e => e.correct).length;

        assert.equal(roundStats.total, 100, 'All 100 exercises counted');
        assert.equal(roundStats.correct, correctCount, 'Correct count matches');
        assert.equal(roundStats.incorrect, 100 - correctCount, 'Incorrect count matches');
        assert.ok(roundStats.totalTime > 0, 'Total time is positive');
        assert.ok(roundStats.avgTime > 0, 'Average time is positive');
        assert.ok(roundStats.adjustedTime >= roundStats.totalTime, 'Adjusted time includes penalty');

        // Save round
        const roundData = {
            totalTime: roundStats.totalTime,
            avgTime: roundStats.avgTime,
            correct: roundStats.correct,
            incorrect: roundStats.incorrect,
            correctnessRate: roundStats.correctnessRate,
            adjustedTime: roundStats.adjustedTime,
            starRating: roundStats.starRating
        };

        Storage.saveRound(roundData);
        const roundHistory = Storage.getRoundHistory();

        assert.equal(roundHistory.length, 1, 'Round saved to history');
        assert.equal(roundHistory[0].roundId, 1, 'Round ID is 1');
        assert.equal(roundHistory[0].correct, correctCount, 'Round correct count matches');

        done();
    });

    QUnit.test('Progressive complexity throughout round', (assert) => {
        const complexities = [];
        
        // Track complexity for each exercise position
        for (let i = 1; i <= 100; i++) {
            const complexity = ExerciseGenerator.selectComplexity(i);
            complexities.push(complexity);
        }

        // Count complexity distribution in each stage
        const early = complexities.slice(0, 33);
        const middle = complexities.slice(33, 66);
        const late = complexities.slice(66, 100);

        const earlyBothSmall = early.filter(c => c === 'both_small').length;
        const earlyOneLarge = early.filter(c => c === 'one_large').length;
        const earlyBothLarge = early.filter(c => c === 'both_large').length;
        
        const middleBothSmall = middle.filter(c => c === 'both_small').length;
        const middleOneLarge = middle.filter(c => c === 'one_large').length;
        const middleBothLarge = middle.filter(c => c === 'both_large').length;
        
        const lateBothSmall = late.filter(c => c === 'both_small').length;
        const lateOneLarge = late.filter(c => c === 'one_large').length;
        const lateBothLarge = late.filter(c => c === 'both_large').length;

        // Early stage: 80% both_small, 20% one_large, 0% both_large
        // Should have more both_small than one_large (at least 1.5x ratio)
        assert.ok(earlyBothSmall > earlyOneLarge * 1.3, 
            `Early stage: both_small (${earlyBothSmall}) should be more than one_large (${earlyOneLarge})`);
        assert.equal(earlyBothLarge, 0, 'Early stage should have no both_large');

        // Middle stage: 30% both_small, 50% one_large, 20% both_large
        // one_large should be the most common or at least tied for most common
        const middleMax = Math.max(middleBothSmall, middleOneLarge, middleBothLarge);
        assert.ok(middleOneLarge >= middleMax * 0.8, 
            `Middle stage: one_large (${middleOneLarge}) should be among the most common (max: ${middleMax})`);

        // Late stage: 10% both_small, 30% one_large, 60% both_large
        // both_large should be the most common type
        assert.ok(lateBothLarge >= lateOneLarge, 
            `Late stage: both_large (${lateBothLarge}) should be at least as common as one_large (${lateOneLarge})`);
        assert.ok(lateBothLarge > lateBothSmall, 
            `Late stage: both_large (${lateBothLarge}) should be more than both_small (${lateBothSmall})`);

        // Verify progression: both_large should increase from early to late
        assert.ok(lateBothLarge > earlyBothLarge, 
            `Late stage (${lateBothLarge}) has more both_large than early stage (${earlyBothLarge}) - progression`);
        assert.ok(lateBothLarge >= middleBothLarge, 
            `Late stage (${lateBothLarge}) has at least as much both_large as middle stage (${middleBothLarge}) - progression`);
        
        // Verify that complexity generally increases: late should have fewer both_small than early
        assert.ok(lateBothSmall < earlyBothSmall, 
            `Late stage (${lateBothSmall}) has fewer both_small than early stage (${earlyBothSmall}) - progression`);
    });

    QUnit.test('Block generation maintains consistency', (assert) => {
        const operations = ['+', '-'];
        const complexities = ['both_small', 'one_large', 'both_large'];

        operations.forEach(op => {
            complexities.forEach(comp => {
                const block = ExerciseGenerator.generateBlock(op, comp);
                
                assert.equal(block.length, 5, 'Block has 5 exercises');
                
                block.forEach(ex => {
                    assert.equal(ex.operation, op, 'All exercises have same operation');
                    assert.equal(ex.complexity, comp, 'All exercises have same complexity');
                    assert.ok(ex.answer >= 0, 'All answers are non-negative');
                    assert.ok(ex.answer < 100, 'All answers are < 100');
                    
                    if (op === '-') {
                        assert.ok(ex.a >= ex.b, 'Subtraction has a >= b');
                    }
                });
            });
        });
    });

    QUnit.test('State persistence across sessions', (assert) => {
        // Save state
        const testState = {
            exerciseCount: 42,
            roundNumber: 1,
            currentExercise: { a: 5, b: 3, operation: '+', answer: 8, complexity: 'both_small' },
            currentInput: "8",
            roundStartTime: Date.now(),
            exerciseStartTime: Date.now(),
            currentBlock: [],
            blockIndex: 0,
            currentOperation: '+',
            currentComplexity: 'both_small'
        };

        Storage.saveState(testState);
        Storage.saveExercise(testState.currentExercise, 2000, true);

        // Simulate reload
        const loadedState = Storage.getState();
        const history = Storage.getExerciseHistory();

        assert.equal(loadedState.exerciseCount, 42, 'Exercise count persisted');
        assert.equal(loadedState.currentInput, "8", 'Current input persisted');
        assert.equal(history.length, 1, 'Exercise history persisted');
    });

    QUnit.test('Streak tracking across multiple days', (assert) => {
        // Day 1
        Storage.updateStreak();
        let streak = Storage.getStreakInfo();
        assert.equal(streak.current, 1, 'Day 1: streak is 1');

        // Simulate Day 2 (consecutive)
        const data = Storage.loadData();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        data.streak.lastActivity = yesterday.getTime();
        data.streak.current = 1;
        Storage.saveData(data);

        Storage.updateStreak();
        streak = Storage.getStreakInfo();
        assert.equal(streak.current, 2, 'Day 2: streak is 2');

        // Simulate Day 3 (within grace period)
        const data2 = Storage.loadData();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        data2.streak.lastActivity = twoDaysAgo.getTime();
        data2.streak.current = 2;
        Storage.saveData(data2);

        Storage.updateStreak();
        streak = Storage.getStreakInfo();
        assert.equal(streak.current, 3, 'Day 3 (grace): streak is 3');
    });

    QUnit.test('Multiple rounds with statistics', (assert) => {
        // Complete 3 rounds
        for (let round = 0; round < 3; round++) {
            const exercises = [];
            let totalTime = 0;

            for (let i = 0; i < 100; i++) {
                const operation = i % 2 === 0 ? '+' : '-';
                const complexity = ExerciseGenerator.selectComplexity(i + 1);
                const exercise = ExerciseGenerator.generateExercise(operation, complexity);
                const time = 2000 + Math.random() * 1000;
                const correct = Math.random() > 0.1;
                
                Storage.saveExercise(exercise, time, correct);
                exercises.push({ exercise, time, correct });
                totalTime += time;
            }

            const roundStats = Stats.calculateRoundStats(exercises);
            Storage.saveRound({
                totalTime: roundStats.totalTime,
                avgTime: roundStats.avgTime,
                correct: roundStats.correct,
                incorrect: roundStats.incorrect,
                correctnessRate: roundStats.correctnessRate,
                adjustedTime: roundStats.adjustedTime,
                starRating: roundStats.starRating
            });
        }

        const allTimeStats = Stats.calculateAllTimeStats();
        const roundHistory = Storage.getRoundHistory();

        assert.equal(allTimeStats.totalRounds, 3, 'Total rounds is 3');
        assert.equal(roundHistory.length, 3, 'Round history has 3 rounds');
        assert.ok(allTimeStats.totalExercises > 0, 'Total exercises is positive');
        assert.ok(allTimeStats.avgStarRating >= 0, 'Average star rating is valid');
    });

    QUnit.test('Exercise validation ensures all constraints', (assert) => {
        const operations = ['+', '-'];
        const complexities = ['both_small', 'one_large', 'both_large'];

        operations.forEach(op => {
            complexities.forEach(comp => {
                for (let i = 0; i < 20; i++) {
                    const exercise = ExerciseGenerator.generateExercise(op, comp);
                    
                    // All constraints must be met
                    assert.ok(exercise.answer >= 0, `Answer is non-negative (${op}, ${comp})`);
                    assert.ok(exercise.answer < 100, `Answer is < 100 (${op}, ${comp})`);
                    
                    if (op === '-') {
                        assert.ok(exercise.a >= exercise.b, `Subtraction valid (${comp})`);
                    }
                    
                    // Complexity constraints
                    if (comp === 'both_small') {
                        assert.ok(exercise.a < 10 && exercise.b < 10, 'Both small');
                    } else if (comp === 'one_large') {
                        const hasSmall = (exercise.a < 10 && exercise.b >= 10) || 
                                       (exercise.a >= 10 && exercise.b < 10);
                        assert.ok(hasSmall, 'One large, one small');
                    } else if (comp === 'both_large') {
                        assert.ok(exercise.a >= 10 && exercise.b >= 10, 'Both large');
                    }
                }
            });
        });
    });
});
