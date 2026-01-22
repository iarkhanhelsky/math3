QUnit.module('Timer', () => {
    QUnit.test('startExercise and endExercise work correctly', (assert) => {
        const done = assert.async();
        
        Timer.startExercise();
        
        // Simulate some time passing
        const startTime = Date.now();
        
        setTimeout(() => {
            const endTime = Timer.endExercise();
            const elapsed = Date.now() - startTime;
            
            // Allow some tolerance for timing
            assert.ok(endTime > 0, 'Returns positive time');
            assert.ok(endTime >= elapsed - 50, 'Time is approximately correct (within 50ms)');
            assert.ok(endTime <= elapsed + 50, 'Time is approximately correct (within 50ms)');
            
            // After ending, should return 0 if called again
            const secondCall = Timer.endExercise();
            assert.equal(secondCall, 0, 'Returns 0 if no exercise is timing');
            
            done();
        }, 100);
    });

    QUnit.test('startRound and getRoundTime work correctly', (assert) => {
        const done = assert.async();
        
        Timer.startRound();
        
        const startTime = Date.now();
        
        setTimeout(() => {
            const roundTime = Timer.getRoundTime();
            const elapsed = Date.now() - startTime;
            
            assert.ok(roundTime > 0, 'Returns positive time');
            assert.ok(roundTime >= elapsed - 50, 'Time is approximately correct');
            assert.ok(roundTime <= elapsed + 50, 'Time is approximately correct');
            
            done();
        }, 100);
    });

    QUnit.test('getCompletedRoundTime calculates correctly', (assert) => {
        const startTime = 1000;
        const endTime = 5000;
        const duration = Timer.getCompletedRoundTime(startTime, endTime);
        
        assert.equal(duration, 4000, 'Calculates duration correctly');
    });

    QUnit.test('formatTime formats milliseconds correctly', (assert) => {
        assert.equal(Timer.formatTime(500), '500ms', 'Formats < 1 second as milliseconds');
        assert.equal(Timer.formatTime(1500), '1s', 'Formats seconds correctly');
        assert.equal(Timer.formatTime(65000), '1m 5s', 'Formats minutes and seconds');
        assert.equal(Timer.formatTime(125000), '2m 5s', 'Formats multiple minutes');
    });

    QUnit.test('formatTimeSeconds formats with decimals', (assert) => {
        assert.equal(Timer.formatTimeSeconds(1500), '1.50s', 'Formats with 2 decimals');
        assert.equal(Timer.formatTimeSeconds(2500), '2.50s', 'Formats 2.5 seconds');
        assert.equal(Timer.formatTimeSeconds(100), '0.10s', 'Formats small values');
    });

    QUnit.test('endExercise without start returns 0', (assert) => {
        // Don't start exercise
        const time = Timer.endExercise();
        assert.equal(time, 0, 'Returns 0 if no exercise was started');
    });

    QUnit.test('getRoundTime without start returns 0', (assert) => {
        // Don't start round
        Timer.roundStartTime = null;
        const time = Timer.getRoundTime();
        assert.equal(time, 0, 'Returns 0 if no round was started');
    });
});
