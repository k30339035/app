/**
 * Main Game Engine
 * Orchestrates all game systems
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.running = false;
        this.paused = false;
        this.initialized = false;

        // Game systems
        this.physics = new PhysicsEngine();
        this.particles = new ParticleSystem();
        this.soundManager = new SoundManager();

        // Entities
        this.player = null;
        this.enemy = null;
        this.enemyAI = null;

        // Input
        this.keys = {};
        this.mouse = { x: 0, y: 0, left: false, right: false };

        // Game stats
        this.score = 0;
        this.round = 1;
        this.fps = 60;
        this.lastFrameTime = 0;
        this.deltaTime = 1;

        // Camera
        this.camera = { x: 0, y: 0 };

        // Bounds
        this.bounds = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
    }

    /**
     * Initialize game
     */
    async init() {
        if (this.initialized) return;

        // Setup canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Setup input
        this.setupInput();

        // Setup UI
        this.setupUI();

        // Initialize sound system
        await this.soundManager.init();

        // Set bounds
        this.updateBounds();

        // Create entities
        this.createEntities();

        this.initialized = true;
        console.log('Game initialized');
    }

    /**
     * Resize canvas to fit window
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 200; // Leave space for UI
        this.updateBounds();
    }

    /**
     * Update game bounds
     */
    updateBounds() {
        this.bounds.left = 50;
        this.bounds.right = this.canvas.width - 50;
        this.bounds.top = 50;
        this.bounds.bottom = this.canvas.height - 50;

        // Update physics ground level
        this.physics.groundLevel = this.bounds.bottom - 80;
    }

    /**
     * Setup input handlers
     */
    setupInput() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // Prevent default for game keys
            if (['w', 'a', 's', 'd', ' ', 'e', 'q'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.left = true;
            if (e.button === 2) this.mouse.right = true;
            e.preventDefault();
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.left = false;
            if (e.button === 2) this.mouse.right = false;
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Setup UI controls
     */
    setupUI() {
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('toggle-audio').addEventListener('click', () => {
            const enabled = this.soundManager.toggle();
            document.getElementById('audio-status').textContent = enabled ? 'Enabled' : 'Disabled';
        });
    }

    /**
     * Create game entities
     */
    createEntities() {
        // Create player
        this.player = new Robot(this.canvas.width * 0.3, this.physics.groundLevel, true);

        // Create enemy
        this.enemy = new Robot(this.canvas.width * 0.7, this.physics.groundLevel, false);

        // Create AI for enemy
        this.enemyAI = new CombatAI(this.enemy, this.player);
        this.enemy.ai = this.enemyAI;
    }

    /**
     * Start game
     */
    start() {
        if (!this.initialized) {
            this.init().then(() => this.start());
            return;
        }

        this.running = true;
        this.paused = false;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    /**
     * Toggle pause
     */
    togglePause() {
        this.paused = !this.paused;
        if (!this.paused && this.running) {
            this.lastFrameTime = performance.now();
            this.gameLoop();
        }
    }

    /**
     * Reset game
     */
    reset() {
        this.running = false;
        this.paused = false;
        this.score = 0;
        this.round = 1;
        this.particles.clear();
        this.createEntities();
        this.updateUI();
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.running || this.paused) return;

        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Calculate FPS
        this.fps = Math.round(1000 / elapsed);
        this.deltaTime = Math.min(elapsed / 16.67, 2); // Cap at 2x for stability

        // Update
        this.update();

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game state
     */
    update() {
        // Handle player input
        this.handlePlayerInput();

        // Update AI
        if (this.enemy.isAlive()) {
            this.enemyAI.update(this.deltaTime);
        }

        // Update entities
        this.player.update(this.deltaTime, this.physics);
        this.enemy.update(this.deltaTime, this.physics);

        // Constrain to bounds
        this.physics.constrainToBounds(this.player, this.bounds);
        this.physics.constrainToBounds(this.enemy, this.bounds);

        // Check collisions
        this.checkCombat();

        // Update particles
        this.particles.update(this.deltaTime);

        // Update camera
        this.updateCamera();

        // Update listener position for 3D audio
        this.soundManager.updateListener(this.camera.x, this.camera.y);

        // Update UI
        this.updateUI();

        // Check win/lose conditions
        this.checkGameOver();
    }

    /**
     * Handle player input
     */
    handlePlayerInput() {
        if (!this.player.isAlive()) return;

        // Movement
        if (this.keys['a']) {
            this.player.move(-1);
        }
        if (this.keys['d']) {
            this.player.move(1);
        }

        // Jump
        if (this.keys[' '] || this.keys['w']) {
            this.player.jump();
            if (this.player.velocityY < 0) {
                this.soundManager.playJump(this.player.x, this.player.y);
            }
        }

        // Dodge
        if (this.keys['q']) {
            this.player.dodge();
        }

        // Special attack (charge)
        if (this.keys['e']) {
            if (!this.player.weaponSystem.special.isCharging) {
                this.player.weaponSystem.special.startCharge();
                this.soundManager.playCharge(this.player.x, this.player.y);
            }
        } else if (this.player.weaponSystem.special.isCharging) {
            // Release special
            const result = this.player.specialAttack(this.mouse.x, this.mouse.y);
            if (result) {
                this.handleSpecialAttack(this.player, this.enemy, result);
            }
        }

        // Melee attack
        if (this.mouse.left && !this.keys['e']) {
            const result = this.player.meleeAttack(this.mouse.x, this.mouse.y);
            if (result) {
                this.soundManager.playPunch(this.player.x, this.player.y);
            }
        }

        // Ranged attack
        if (this.mouse.right) {
            const result = this.player.rangedAttack(this.mouse.x, this.mouse.y);
            if (result) {
                this.soundManager.playLaser(this.player.x, this.player.y);
            }
            this.mouse.right = false;
        }
    }

    /**
     * Check combat interactions
     */
    checkCombat() {
        // Check melee hits
        this.checkMeleeHits(this.player, this.enemy);
        this.checkMeleeHits(this.enemy, this.player);

        // Check projectile hits
        this.checkProjectileHits(this.player.weaponSystem, this.enemy);
        this.checkProjectileHits(this.enemy.weaponSystem, this.player);

        // Check robot collision
        if (this.physics.checkCollision(this.player, this.enemy)) {
            this.physics.resolveCollision(this.player, this.enemy);
        }
    }

    /**
     * Check melee hits
     */
    checkMeleeHits(attacker, target) {
        const attackBox = attacker.getAttackHitbox();
        if (!attackBox) return;

        const targetBox = target.getHitbox();

        if (this.physics.checkCollision(attackBox, targetBox)) {
            const weapon = attacker.weaponSystem.melee;
            const damage = weapon.getDamage();
            const knockback = weapon.getKnockback();

            this.physics.applyKnockback(target, attacker.x, attacker.y, knockback);

            if (target.takeDamage(damage, 0, 0)) {
                // Hit successful
                this.particles.createPunchImpact(
                    target.x + target.width / 2,
                    target.y + target.height / 2,
                    { x: target.x - attacker.x, y: target.y - attacker.y },
                    damage / 15
                );

                this.soundManager.playHit(target.x, target.y, damage / 20);

                if (attacker.isPlayer) {
                    this.score += Math.floor(damage);
                }
            }
        }
    }

    /**
     * Check projectile hits
     */
    checkProjectileHits(weaponSystem, target) {
        const projectiles = weaponSystem.getProjectiles();

        projectiles.forEach(proj => {
            const targetBox = target.getHitbox();

            if (this.physics.checkCircularCollision(
                proj.x, proj.y, proj.size,
                targetBox.centerX, targetBox.centerY, target.width / 2
            )) {
                // Hit
                const damage = proj.damage;
                this.physics.applyKnockback(target, proj.x, proj.y, 5);

                if (target.takeDamage(damage, 0, 0)) {
                    // Create impact effect
                    this.particles.createExplosion(proj.x, proj.y, 0.8, '#00ffff');
                    this.soundManager.playExplosion(proj.x, proj.y, 0.5);

                    if (proj.owner && proj.owner.isPlayer) {
                        this.score += Math.floor(damage * 1.5);
                    }
                }

                weaponSystem.removeProjectile(proj);
            }
        });
    }

    /**
     * Handle special attack
     */
    handleSpecialAttack(attacker, target, attackData) {
        const distance = Math.sqrt(
            Math.pow(target.x - attacker.x, 2) +
            Math.pow(target.y - attacker.y, 2)
        );

        if (distance < attackData.range) {
            const damage = attackData.damage;
            this.physics.applyKnockback(target, attacker.x, attacker.y, attackData.knockback);

            if (target.takeDamage(damage, 0, 0)) {
                // Create massive explosion effect
                this.particles.createExplosion(
                    target.x + target.width / 2,
                    target.y + target.height / 2,
                    attackData.chargeRatio + 0.5,
                    '#ff00ff'
                );

                this.soundManager.playExplosion(target.x, target.y, attackData.chargeRatio);

                if (attacker.isPlayer) {
                    this.score += Math.floor(damage * 2);
                }
            }
        }
    }

    /**
     * Update camera position
     */
    updateCamera() {
        // Center camera between player and enemy
        const targetX = (this.player.x + this.enemy.x) / 2;
        const targetY = (this.player.y + this.enemy.y) / 2;

        this.camera.x = targetX;
        this.camera.y = targetY;
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Player stats
        document.getElementById('player-health').style.width =
            (this.player.health / this.player.maxHealth * 100) + '%';
        document.getElementById('player-hp').textContent =
            Math.round(this.player.health / this.player.maxHealth * 100);
        document.getElementById('player-energy').textContent =
            Math.round(this.player.energy / this.player.maxEnergy * 100);

        // Enemy stats
        document.getElementById('enemy-health').style.width =
            (this.enemy.health / this.enemy.maxHealth * 100) + '%';
        document.getElementById('enemy-hp').textContent =
            Math.round(this.enemy.health / this.enemy.maxHealth * 100);
        document.getElementById('enemy-energy').textContent =
            Math.round(this.enemy.energy / this.enemy.maxEnergy * 100);

        // Score and round
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('round-value').textContent = this.round;
        document.getElementById('fps-value').textContent = this.fps;
    }

    /**
     * Check win/lose conditions
     */
    checkGameOver() {
        if (!this.player.isAlive()) {
            this.gameOver(false);
        } else if (!this.enemy.isAlive()) {
            this.nextRound();
        }
    }

    /**
     * Next round
     */
    nextRound() {
        this.round++;
        this.score += 1000 * this.round;

        // Reset positions
        this.player.x = this.canvas.width * 0.3;
        this.player.y = this.physics.groundLevel;
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);

        // Create stronger enemy
        this.enemy = new Robot(this.canvas.width * 0.7, this.physics.groundLevel, false);
        this.enemy.maxHealth += this.round * 10;
        this.enemy.health = this.enemy.maxHealth;

        this.enemyAI = new CombatAI(this.enemy, this.player);
        this.enemyAI.skillLevel = Math.min(0.95, 0.6 + this.round * 0.05);
        this.enemyAI.aggressiveness = Math.min(0.9, 0.6 + this.round * 0.05);
        this.enemy.ai = this.enemyAI;

        this.particles.clear();
    }

    /**
     * Game over
     */
    gameOver(won) {
        this.running = false;

        setTimeout(() => {
            alert(won ?
                `Victory! Final Score: ${this.score}` :
                `Game Over! Final Score: ${this.score}`
            );
        }, 100);
    }

    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000814';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw arena background
        this.drawArena();

        // Draw entities
        this.enemy.draw(this.ctx);
        this.player.draw(this.ctx);

        // Draw particles
        this.particles.draw(this.ctx);

        // Draw debug info (optional)
        if (this.keys['`']) {
            this.drawDebug();
        }
    }

    /**
     * Draw arena background
     */
    drawArena() {
        // Grid floor
        this.ctx.strokeStyle = '#00ff0020';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Ground line
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.physics.groundLevel);
        this.ctx.lineTo(this.canvas.width, this.physics.groundLevel);
        this.ctx.stroke();

        // Boundaries
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            this.bounds.left,
            this.bounds.top,
            this.bounds.right - this.bounds.left,
            this.bounds.bottom - this.bounds.top
        );
    }

    /**
     * Draw debug info
     */
    drawDebug() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Particles: ${this.particles.getCount()}`, 10, 20);
        this.ctx.fillText(`AI State: ${this.enemyAI.getState()}`, 10, 40);
        this.ctx.fillText(`Player Vel: ${this.player.velocityX.toFixed(2)}, ${this.player.velocityY.toFixed(2)}`, 10, 60);
    }
}
