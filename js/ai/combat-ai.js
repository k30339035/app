/**
 * AI Combat System
 * Uses behavior trees and machine learning-inspired decision making
 */

class CombatAI {
    constructor(robot, player) {
        this.robot = robot;
        this.player = player;

        // AI State
        this.state = 'idle';
        this.previousState = 'idle';
        this.stateTimer = 0;

        // Decision making
        this.aggressiveness = 0.7; // 0-1, higher = more aggressive
        this.skillLevel = 0.8; // 0-1, affects reaction time and accuracy
        this.adaptability = 0.9; // Learning rate

        // Memory and learning
        this.memory = {
            playerAttackPatterns: [],
            successfulMoves: {},
            failedMoves: {},
            dodgeSuccess: 0,
            dodgeAttempts: 0
        };

        // Decision weights (adjusted through learning)
        this.weights = {
            attack: 1.0,
            defend: 1.0,
            dodge: 1.0,
            special: 0.5,
            distance: 1.0
        };

        // Reaction time (frames)
        this.reactionDelay = Math.floor(15 * (1.1 - this.skillLevel));
        this.decisionCooldown = 0;

        // Target prediction
        this.predictedPlayerX = player.x;
        this.predictedPlayerY = player.y;
    }

    /**
     * Main AI update loop
     */
    update(deltaTime) {
        this.stateTimer += deltaTime;
        this.decisionCooldown -= deltaTime;

        // Update player prediction
        this.updatePlayerPrediction();

        // Make decision
        if (this.decisionCooldown <= 0) {
            this.makeDecision();
            this.decisionCooldown = this.reactionDelay;
        }

        // Execute current state
        this.executeState(deltaTime);

        // Learn from experience
        this.learn();
    }

    /**
     * Predict player movement using velocity
     */
    updatePlayerPrediction() {
        const predictionFrames = 10;
        this.predictedPlayerX = this.player.x + this.player.velocityX * predictionFrames;
        this.predictedPlayerY = this.player.y + this.player.velocityY * predictionFrames;
    }

    /**
     * Main decision-making function using behavior tree
     */
    makeDecision() {
        const distance = this.getDistanceToPlayer();
        const playerHealth = this.player.health / this.player.maxHealth;
        const myHealth = this.robot.health / this.robot.maxHealth;
        const myEnergy = this.robot.energy / this.robot.maxEnergy;

        // Calculate threat level
        const threatLevel = this.calculateThreatLevel();

        // Decision tree with weighted scoring
        const scores = {
            aggressive: this.evaluateAggressiveAction(distance, myHealth, myEnergy),
            defensive: this.evaluateDefensiveAction(distance, myHealth, threatLevel),
            tactical: this.evaluateTacticalAction(distance, myEnergy, playerHealth)
        };

        // Add randomness based on skill level (less random = more skilled)
        const randomFactor = (1 - this.skillLevel) * 0.3;
        Object.keys(scores).forEach(key => {
            scores[key] *= (1 + (Math.random() - 0.5) * randomFactor);
        });

        // Choose best action
        const bestAction = Object.keys(scores).reduce((a, b) =>
            scores[a] > scores[b] ? a : b
        );

        this.selectState(bestAction, distance, myHealth, myEnergy);
    }

    /**
     * Evaluate aggressive actions
     */
    evaluateAggressiveAction(distance, health, energy) {
        let score = this.aggressiveness * this.weights.attack;

        // Prefer aggression when healthy
        score *= (0.5 + health * 0.5);

        // Need energy for attacks
        score *= (0.3 + energy * 0.7);

        // Distance factor
        if (distance < 100) {
            score *= 1.5; // Close range bonus
        } else if (distance > 300) {
            score *= 0.5; // Far range penalty
        }

        return score;
    }

    /**
     * Evaluate defensive actions
     */
    evaluateDefensiveAction(distance, health, threatLevel) {
        let score = (1 - this.aggressiveness) * this.weights.defend;

        // More defensive when low health
        score *= (2 - health);

        // React to threat
        score *= (1 + threatLevel);

        // Distance factor
        if (distance < 80) {
            score *= 1.3; // Defend more when close
        }

        return score;
    }

    /**
     * Evaluate tactical actions (positioning, special attacks)
     */
    evaluateTacticalAction(distance, energy, playerHealth) {
        let score = this.skillLevel * this.weights.special;

        // Use special when we have energy
        score *= energy;

        // Target weak opponents
        score *= (1.5 - playerHealth * 0.5);

        // Optimal distance for special
        if (distance > 100 && distance < 200) {
            score *= 1.3;
        }

        return score;
    }

    /**
     * Calculate current threat level from player
     */
    calculateThreatLevel() {
        let threat = 0;

        // Player is attacking
        if (this.player.isAttacking) {
            threat += 0.5;
        }

        // Player is close
        const distance = this.getDistanceToPlayer();
        if (distance < 100) {
            threat += 0.3;
        }

        // Player is charging special
        if (this.player.weaponSystem.special.isCharging) {
            threat += 0.4;
        }

        return Math.min(threat, 1.0);
    }

    /**
     * Select and set AI state based on decision
     */
    selectState(action, distance, health, energy) {
        switch (action) {
            case 'aggressive':
                if (distance < 100 && energy > 20) {
                    this.setState('melee_attack');
                } else if (energy > 30) {
                    this.setState('ranged_attack');
                } else {
                    this.setState('chase');
                }
                break;

            case 'defensive':
                if (distance < 120) {
                    if (Math.random() < this.memory.dodgeSuccess / (this.memory.dodgeAttempts + 1)) {
                        this.setState('dodge');
                    } else {
                        this.setState('retreat');
                    }
                } else {
                    this.setState('maintain_distance');
                }
                break;

            case 'tactical':
                if (energy > 50 && distance < 200) {
                    this.setState('special_attack');
                } else {
                    this.setState('strafe');
                }
                break;
        }
    }

    /**
     * Execute current state behavior
     */
    executeState(deltaTime) {
        switch (this.state) {
            case 'idle':
                this.executeIdle();
                break;
            case 'chase':
                this.executeChase();
                break;
            case 'retreat':
                this.executeRetreat();
                break;
            case 'strafe':
                this.executeStrafe();
                break;
            case 'melee_attack':
                this.executeMeleeAttack();
                break;
            case 'ranged_attack':
                this.executeRangedAttack();
                break;
            case 'special_attack':
                this.executeSpecialAttack();
                break;
            case 'dodge':
                this.executeDodge();
                break;
            case 'maintain_distance':
                this.executeMaintainDistance();
                break;
        }
    }

    /**
     * State execution methods
     */
    executeIdle() {
        // Do nothing, just observe
    }

    executeChase() {
        const direction = this.player.x > this.robot.x ? 1 : -1;
        this.robot.move(direction);

        // Jump over obstacles
        if (this.robot.isGrounded && Math.random() < 0.1) {
            this.robot.jump();
        }
    }

    executeRetreat() {
        const direction = this.player.x > this.robot.x ? -1 : 1;
        this.robot.move(direction);

        // Jump while retreating
        if (this.robot.isGrounded && Math.random() < 0.15) {
            this.robot.jump();
        }
    }

    executeStrafe() {
        const distance = this.getDistanceToPlayer();
        const optimalDistance = 150;

        if (distance < optimalDistance - 30) {
            this.executeRetreat();
        } else if (distance > optimalDistance + 30) {
            this.executeChase();
        } else {
            // Circle strafe
            const direction = Math.random() < 0.5 ? 1 : -1;
            this.robot.move(direction);
        }
    }

    executeMeleeAttack() {
        // Face player
        const direction = this.player.x > this.robot.x ? 1 : -1;
        this.robot.facing = direction;

        // Attack with prediction
        const result = this.robot.meleeAttack(this.predictedPlayerX, this.predictedPlayerY);

        if (result) {
            this.memory.successfulMoves.melee = (this.memory.successfulMoves.melee || 0) + 1;
        }

        this.setState('chase');
    }

    executeRangedAttack() {
        // Face player
        const direction = this.player.x > this.robot.x ? 1 : -1;
        this.robot.facing = direction;

        // Aim with prediction
        const result = this.robot.rangedAttack(
            this.predictedPlayerX + this.player.width / 2,
            this.predictedPlayerY + this.player.height / 2
        );

        if (result) {
            this.memory.successfulMoves.ranged = (this.memory.successfulMoves.ranged || 0) + 1;
        }

        this.setState('strafe');
    }

    executeSpecialAttack() {
        // Charge special
        if (!this.robot.weaponSystem.special.isCharging) {
            this.robot.weaponSystem.special.startCharge();
        }

        // Release at optimal charge
        if (this.robot.weaponSystem.special.chargeTime >= this.robot.weaponSystem.special.maxCharge * 0.8) {
            const result = this.robot.specialAttack(
                this.predictedPlayerX + this.player.width / 2,
                this.predictedPlayerY + this.player.height / 2
            );

            if (result) {
                this.memory.successfulMoves.special = (this.memory.successfulMoves.special || 0) + 1;
            }

            this.setState('retreat');
        }
    }

    executeDodge() {
        this.memory.dodgeAttempts++;
        this.robot.dodge();

        // Track success
        if (this.robot.invulnerable) {
            this.memory.dodgeSuccess++;
        }

        this.setState('strafe');
    }

    executeMaintainDistance() {
        const distance = this.getDistanceToPlayer();
        const optimalDistance = 120;

        if (distance < optimalDistance) {
            this.executeRetreat();
        } else if (distance > optimalDistance + 50) {
            this.executeChase();
        }
    }

    /**
     * Learning system - adjust weights based on performance
     */
    learn() {
        // Adjust weights based on success rates
        const totalMoves = Object.values(this.memory.successfulMoves).reduce((a, b) => a + b, 0);

        if (totalMoves > 10) {
            // Favor successful strategies
            if (this.memory.successfulMoves.melee > this.memory.successfulMoves.ranged) {
                this.weights.attack *= 1.01;
                this.aggressiveness = Math.min(1, this.aggressiveness * 1.005);
            } else if (this.memory.successfulMoves.ranged > this.memory.successfulMoves.melee) {
                this.weights.special *= 1.01;
            }

            // Improve dodge timing
            const dodgeRate = this.memory.dodgeSuccess / Math.max(this.memory.dodgeAttempts, 1);
            if (dodgeRate > 0.6) {
                this.weights.dodge *= 1.02;
            }
        }

        // Adapt to player health
        if (this.player.health < this.player.maxHealth * 0.3) {
            this.aggressiveness = Math.min(1, this.aggressiveness * 1.01);
        }
    }

    /**
     * Helper methods
     */
    getDistanceToPlayer() {
        const dx = this.player.x - this.robot.x;
        const dy = this.player.y - this.robot.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    setState(newState) {
        if (this.state !== newState) {
            this.previousState = this.state;
            this.state = newState;
            this.stateTimer = 0;
        }
    }

    getState() {
        return this.state;
    }
}
