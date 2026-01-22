const ExerciseGenerator = {
    // Generate a single exercise based on operation and complexity
    generateExercise(operation, complexity) {
        let a, b, answer;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            if (complexity === 'both_small') {
                // Both numbers < 10 (0-9)
                a = Math.floor(Math.random() * 10);
                b = Math.floor(Math.random() * 10);
            } else if (complexity === 'one_large') {
                // One number > 10, one < 10 (0-9)
                if (Math.random() < 0.5) {
                    a = Math.floor(Math.random() * 10);
                    b = Math.floor(Math.random() * 90) + 10; // 10-99
                } else {
                    a = Math.floor(Math.random() * 90) + 10; // 10-99
                    b = Math.floor(Math.random() * 10);
                }
            } else { // both_large
                // Both numbers > 10
                a = Math.floor(Math.random() * 89) + 10; // 10-98
                b = Math.floor(Math.random() * 89) + 10; // 10-98
            }

            // For subtraction, ensure a >= b to avoid negative results
            if (operation === '-') {
                if (a < b) {
                    [a, b] = [b, a]; // Swap to ensure a >= b
                }
            }

            answer = operation === '+' ? a + b : a - b;
            attempts++;
        } while (!this.validateResult(a, b, operation, answer) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // Fallback: generate a safe exercise
            if (operation === '+') {
                a = Math.floor(Math.random() * 50);
                b = Math.floor(Math.random() * (99 - a));
            } else {
                a = Math.floor(Math.random() * 99) + 1;
                b = Math.floor(Math.random() * a);
            }
            answer = operation === '+' ? a + b : a - b;
        }

        return {
            a: a,
            b: b,
            operation: operation,
            answer: answer,
            complexity: complexity
        };
    },

    // Validate that result meets requirements
    validateResult(a, b, operation, result) {
        if (result < 0) return false; // No negative results
        if (result >= 100) return false; // Result must be < 100
        if (operation === '-' && a < b) return false; // For subtraction, a must be >= b
        return true;
    },

    // Generate a block of 5 exercises with consistent operation and complexity
    generateBlock(operation, complexity) {
        const block = [];
        for (let i = 0; i < 5; i++) {
            block.push(this.generateExercise(operation, complexity));
        }
        return block;
    },

    // Select complexity based on exercise count (progressive difficulty)
    selectComplexity(exerciseCount) {
        const random = Math.random();
        
        if (exerciseCount <= 33) {
            // Early stage: 80% both_small, 20% one_large
            if (random < 0.8) {
                return 'both_small';
            } else {
                return 'one_large';
            }
        } else if (exerciseCount <= 66) {
            // Middle stage: 30% both_small, 50% one_large, 20% both_large
            if (random < 0.3) {
                return 'both_small';
            } else if (random < 0.8) {
                return 'one_large';
            } else {
                return 'both_large';
            }
        } else {
            // Late stage: 10% both_small, 30% one_large, 60% both_large
            if (random < 0.1) {
                return 'both_small';
            } else if (random < 0.4) {
                return 'one_large';
            } else {
                return 'both_large';
            }
        }
    },

    // Get next operation (alternating + and -)
    getNextOperation(currentOperation) {
        return currentOperation === '+' ? '-' : '+';
    }
};
