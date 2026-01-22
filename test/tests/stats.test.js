QUnit.module('Stats', (hooks) => {
    hooks.beforeEach(() => {
        Storage.clearAll();
    });

    QUnit.test('calculateStarRating requires 90% correct for any stars', (assert) => {
        // 89% correct - should get 0 stars
        assert.equal(Stats.calculateStarRating(89, 11, 200000), 0, '89% correct gets 0 stars');
        
        // 90% correct - should get at least 1 star
        const stars90 = Stats.calculateStarRating(90, 10, 200000);
        assert.ok(stars90 >= 1, '90% correct gets at least 1 star');
        
        // 100% correct - should get stars
        const stars100 = Stats.calculateStarRating(100, 0, 200000);
        assert.ok(stars100 >= 1, '100% correct gets at least 1 star');
    });

    QUnit.test('calculateStarRating applies penalty correctly', (assert) => {
        // 100 correct, 0 incorrect, fast time
        const stars1 = Stats.calculateStarRating(100, 0, 200000); // 200 seconds
        
        // 100 correct, 10 incorrect, same base time
        // Adjusted time = 200000 + (10 * 1000) = 210000 = 210 seconds
        const stars2 = Stats.calculateStarRating(100, 10, 200000);
        
        // stars2 should be <= stars1 due to penalty
        assert.ok(stars2 <= stars1, 'Penalty reduces star rating');
    });

    QUnit.test('calculateStarRating gives 3 stars for excellent performance', (assert) => {
        // 100 correct, 0 incorrect, 240 seconds (2.4s per exercise)
        const stars = Stats.calculateStarRating(100, 0, 240000);
        assert.equal(stars, 3, 'Excellent performance gets 3 stars');
    });

    QUnit.test('calculateStarRating gives 2 stars for good performance', (assert) => {
        // 100 correct, 0 incorrect, 300 seconds (3s per exercise)
        const stars = Stats.calculateStarRating(100, 0, 300000);
        assert.equal(stars, 2, 'Good performance gets 2 stars');
    });

    QUnit.test('calculateStarRating gives 1 star for acceptable performance', (assert) => {
        // 95 correct, 5 incorrect, 400 seconds
        // Adjusted = 400000 + 5000 = 405000 = 405 seconds
        const stars = Stats.calculateStarRating(95, 5, 400000);
        assert.equal(stars, 1, 'Acceptable performance gets 1 star');
    });

    QUnit.test('calculateRoundStats calculates correctly', (assert) => {
        const exerciseHistory = [
            { exercise: { a: 1, b: 2, operation: '+', answer: 3 }, time: 2000, correct: true },
            { exercise: { a: 3, b: 4, operation: '+', answer: 7 }, time: 1500, correct: true },
            { exercise: { a: 5, b: 6, operation: '+', answer: 11 }, time: 3000, correct: false },
        ];

        const stats = Stats.calculateRoundStats(exerciseHistory);

        assert.equal(stats.total, 3, 'Total count is correct');
        assert.equal(stats.correct, 2, 'Correct count is correct');
        assert.equal(stats.incorrect, 1, 'Incorrect count is correct');
        assert.equal(stats.correctnessRate, (2/3)*100, 'Correctness rate is correct');
        assert.equal(stats.totalTime, 6500, 'Total time is correct');
        assert.equal(stats.avgTime, 6500/3, 'Average time is correct');
        assert.equal(stats.adjustedTime, 6500 + 1000, 'Adjusted time includes penalty');
    });

    QUnit.test('calculateRoundStats handles empty history', (assert) => {
        const stats = Stats.calculateRoundStats([]);

        assert.equal(stats.total, 0, 'Total is 0');
        assert.equal(stats.correct, 0, 'Correct is 0');
        assert.equal(stats.incorrect, 0, 'Incorrect is 0');
        assert.equal(stats.starRating, 0, 'Star rating is 0');
    });

    QUnit.test('calculateAllTimeStats calculates correctly', (assert) => {
        // Add some rounds
        Storage.saveRound({
            totalTime: 200000,
            avgTime: 2000,
            correct: 95,
            incorrect: 5,
            correctnessRate: 95,
            adjustedTime: 205000,
            starRating: 3
        });

        Storage.saveRound({
            totalTime: 250000,
            avgTime: 2500,
            correct: 90,
            incorrect: 10,
            correctnessRate: 90,
            adjustedTime: 260000,
            starRating: 2
        });

        const stats = Stats.calculateAllTimeStats();

        assert.equal(stats.totalRounds, 2, 'Total rounds is correct');
        assert.equal(stats.totalExercises, 200, 'Total exercises is correct (95+5+90+10)');
        assert.equal(stats.totalTime, 450000, 'Total time is correct');
        assert.equal(stats.avgStarRating, 2.5, 'Average star rating is correct');
        assert.equal(stats.totalCorrect, 185, 'Total correct is correct');
        assert.equal(stats.totalIncorrect, 15, 'Total incorrect is correct');
    });

    QUnit.test('calculateAllTimeStats handles no rounds', (assert) => {
        const stats = Stats.calculateAllTimeStats();

        assert.equal(stats.totalRounds, 0, 'Total rounds is 0');
        assert.equal(stats.totalExercises, 0, 'Total exercises is 0');
        assert.equal(stats.avgStarRating, 0, 'Average star rating is 0');
    });

    QUnit.test('getStreakInfo returns streak data', (assert) => {
        Storage.updateStreak();
        const streak = Stats.getStreakInfo();

        assert.ok(typeof streak.current === 'number', 'Returns current streak number');
        assert.ok(streak.lastActivity !== null, 'Returns last activity timestamp');
    });

    QUnit.test('star rating with penalty edge cases', (assert) => {
        // Exactly 90% correct, fast time
        const stars1 = Stats.calculateStarRating(90, 10, 200000);
        assert.ok(stars1 >= 1, 'Exactly 90% gets at least 1 star');

        // 90% correct, but slow (with penalty)
        // Adjusted = 400000 + 10000 = 410000 = 410 seconds
        const stars2 = Stats.calculateStarRating(90, 10, 400000);
        assert.equal(stars2, 1, '90% correct with penalty gets 1 star');

        // 100% correct, very fast
        const stars3 = Stats.calculateStarRating(100, 0, 200000);
        assert.equal(stars3, 3, '100% correct, fast gets 3 stars');
    });
});
