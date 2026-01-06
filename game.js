// ============================================================
// SPACE DRONE WARS 2026 - 차세대 우주 전투 시뮬레이터
// ============================================================

class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? new Vector2D(this.x / mag, this.y / mag) : new Vector2D(0, 0);
    }

    distance(v) {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }
}

// ============================================================
// 파티클 시스템 (2026 트렌드: 실시간 물리 시뮬레이션)
// ============================================================
class Particle {
    constructor(x, y, color, velocity, lifetime = 1) {
        this.position = new Vector2D(x, y);
        this.velocity = velocity;
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = Math.random() * 3 + 2;
    }

    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.lifetime -= deltaTime;
        this.velocity = this.velocity.multiply(0.98); // 감쇠
    }

    draw(ctx) {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createExplosion(x, y, color = '#ff6600', count = 30) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 200 + 100;
            const velocity = new Vector2D(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            this.particles.push(new Particle(x, y, color, velocity, Math.random() * 0.5 + 0.5));
        }
    }

    createThruster(x, y, angle, color = '#00d4ff') {
        const spread = 0.3;
        const velocity = new Vector2D(
            Math.cos(angle + Math.PI + (Math.random() - 0.5) * spread) * (Math.random() * 50 + 50),
            Math.sin(angle + Math.PI + (Math.random() - 0.5) * spread) * (Math.random() * 50 + 50)
        );
        this.particles.push(new Particle(x, y, color, velocity, Math.random() * 0.3 + 0.2));
    }

    update(deltaTime) {
        this.particles = this.particles.filter(p => {
            p.update(deltaTime);
            return !p.isDead();
        });
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

// ============================================================
// 무기 시스템
// ============================================================
class Projectile {
    constructor(x, y, angle, speed, damage, owner, color = '#00ff00') {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.damage = damage;
        this.owner = owner;
        this.color = color;
        this.size = 4;
        this.lifetime = 3; // 3초
    }

    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.lifetime -= deltaTime;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 레이저 트레일
        const trailLength = 15;
        const trailEnd = this.position.subtract(this.velocity.normalize().multiply(trailLength));
        const gradient = ctx.createLinearGradient(
            this.position.x, this.position.y,
            trailEnd.x, trailEnd.y
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(trailEnd.x, trailEnd.y);
        ctx.stroke();
        ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

// ============================================================
// 드론 베이스 클래스
// ============================================================
class Drone {
    constructor(x, y, color = '#00d4ff') {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.angle = 0;
        this.size = 15;
        this.maxSpeed = 300;
        this.acceleration = 500;
        this.friction = 0.95;
        this.rotationSpeed = 5;
        this.health = 100;
        this.maxHealth = 100;
        this.color = color;
        this.shootCooldown = 0;
        this.shootRate = 0.2; // 초당 5발
    }

    updatePhysics(deltaTime) {
        this.velocity = this.velocity.multiply(this.friction);
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // 화면 경계 처리 (wrap around)
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
        if (this.position.y > canvas.height) this.position.y = 0;

        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
    }

    applyForce(force) {
        this.velocity = this.velocity.add(force);
        const speed = this.velocity.magnitude();
        if (speed > this.maxSpeed) {
            this.velocity = this.velocity.normalize().multiply(this.maxSpeed);
        }
    }

    shoot(projectiles, particleSystem) {
        if (this.shootCooldown <= 0) {
            const spawnDist = this.size + 5;
            const projectile = new Projectile(
                this.position.x + Math.cos(this.angle) * spawnDist,
                this.position.y + Math.sin(this.angle) * spawnDist,
                this.angle,
                600,
                20,
                this,
                this.color
            );
            projectiles.push(projectile);
            this.shootCooldown = this.shootRate;

            // 발사 이펙트
            particleSystem.createExplosion(projectile.position.x, projectile.position.y, this.color, 5);
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }

    draw(ctx, particleSystem) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        // 드론 본체
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, this.size / 2);
        ctx.lineTo(-this.size / 2, 0);
        ctx.lineTo(-this.size, -this.size / 2);
        ctx.closePath();
        ctx.fill();

        // 코어
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();

        // 추진기 효과
        if (this.velocity.magnitude() > 50) {
            particleSystem.createThruster(
                -this.size - 5,
                0,
                this.angle,
                this.color
            );
        }

        ctx.restore();

        // 체력 바
        this.drawHealthBar(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = 40;
        const barHeight = 4;
        const x = this.position.x - barWidth / 2;
        const y = this.position.y - this.size - 15;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff0066';
        ctx.fillStyle = healthColor;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
}

// ============================================================
// 플레이어 드론
// ============================================================
class PlayerDrone extends Drone {
    constructor(x, y, playerNumber = 1) {
        const colors = ['#00d4ff', '#ff00ff'];
        super(x, y, colors[playerNumber - 1]);
        this.playerNumber = playerNumber;
        this.score = 0;
        this.kills = 0;
    }

    update(deltaTime, inputs, projectiles, particleSystem) {
        // 회전
        if (inputs.left) this.angle -= this.rotationSpeed * deltaTime;
        if (inputs.right) this.angle += this.rotationSpeed * deltaTime;

        // 전진
        if (inputs.up) {
            const force = new Vector2D(
                Math.cos(this.angle) * this.acceleration * deltaTime,
                Math.sin(this.angle) * this.acceleration * deltaTime
            );
            this.applyForce(force);
        }

        // 후진
        if (inputs.down) {
            const force = new Vector2D(
                -Math.cos(this.angle) * this.acceleration * deltaTime * 0.5,
                -Math.sin(this.angle) * this.acceleration * deltaTime * 0.5
            );
            this.applyForce(force);
        }

        // 발사
        if (inputs.shoot) {
            this.shoot(projectiles, particleSystem);
        }

        this.updatePhysics(deltaTime);
    }
}

// ============================================================
// AI 적 드론 (2026 트렌드: AI-Powered)
// ============================================================
class EnemyDrone extends Drone {
    constructor(x, y, difficulty = 1) {
        super(x, y, '#ff3366');
        this.target = null;
        this.difficulty = difficulty;
        this.health = 50 + difficulty * 20;
        this.maxHealth = this.health;
        this.aiState = 'patrol';
        this.patrolAngle = Math.random() * Math.PI * 2;
        this.aggroRange = 400;
        this.shootRange = 350;
        this.evadeTimer = 0;
        this.shootRate = 0.5 - difficulty * 0.05;
        this.size = 12 + difficulty * 2;
        this.scoreValue = 100 * difficulty;
    }

    update(deltaTime, players, projectiles, particleSystem) {
        this.findTarget(players);
        this.updateAI(deltaTime, projectiles, particleSystem);
        this.updatePhysics(deltaTime);
    }

    findTarget(players) {
        let closest = null;
        let closestDist = Infinity;

        players.forEach(player => {
            const dist = this.position.distance(player.position);
            if (dist < closestDist) {
                closestDist = dist;
                closest = player;
            }
        });

        this.target = closest;
    }

    updateAI(deltaTime, projectiles, particleSystem) {
        if (!this.target) {
            this.patrol(deltaTime);
            return;
        }

        const distToTarget = this.position.distance(this.target.position);

        if (distToTarget > this.aggroRange) {
            this.patrol(deltaTime);
        } else if (distToTarget > this.shootRange * 0.7) {
            this.pursue(deltaTime, particleSystem);
        } else {
            this.combat(deltaTime, projectiles, particleSystem);
        }

        if (this.evadeTimer > 0) {
            this.evadeTimer -= deltaTime;
        }
    }

    patrol(deltaTime) {
        this.aiState = 'patrol';
        this.patrolAngle += (Math.random() - 0.5) * deltaTime;
        this.angle = this.patrolAngle;

        const force = new Vector2D(
            Math.cos(this.angle) * this.acceleration * deltaTime * 0.3,
            Math.sin(this.angle) * this.acceleration * deltaTime * 0.3
        );
        this.applyForce(force);
    }

    pursue(deltaTime, particleSystem) {
        this.aiState = 'pursue';
        const dirToTarget = this.target.position.subtract(this.position).normalize();
        this.angle = dirToTarget.angle();

        const force = dirToTarget.multiply(this.acceleration * deltaTime * 0.8);
        this.applyForce(force);
    }

    combat(deltaTime, projectiles, particleSystem) {
        this.aiState = 'combat';
        const dirToTarget = this.target.position.subtract(this.position);
        const targetAngle = dirToTarget.angle();

        // 스마트 조준 (난이도에 따라 정확도 증가)
        const aimAccuracy = 0.5 + this.difficulty * 0.1;
        this.angle += (targetAngle - this.angle) * deltaTime * 3 * aimAccuracy;

        // 회피 기동
        if (this.evadeTimer <= 0 && Math.random() < 0.02) {
            this.evadeTimer = Math.random() * 2 + 1;
        }

        if (this.evadeTimer > 0) {
            const evadeDir = new Vector2D(
                Math.cos(this.angle + Math.PI / 2),
                Math.sin(this.angle + Math.PI / 2)
            );
            const evadeForce = evadeDir.multiply(this.acceleration * deltaTime * (Math.random() < 0.5 ? 1 : -1));
            this.applyForce(evadeForce);
        }

        // 거리 유지
        const distToTarget = dirToTarget.magnitude();
        if (distToTarget < this.shootRange * 0.5) {
            const backForce = dirToTarget.normalize().multiply(-this.acceleration * deltaTime * 0.5);
            this.applyForce(backForce);
        } else if (distToTarget > this.shootRange * 0.9) {
            const forwardForce = dirToTarget.normalize().multiply(this.acceleration * deltaTime * 0.5);
            this.applyForce(forwardForce);
        }

        // 발사
        const angleDiff = Math.abs(targetAngle - this.angle);
        if (angleDiff < 0.3 && Math.random() < this.difficulty * 0.1) {
            this.shoot(projectiles, particleSystem);
        }
    }
}

// ============================================================
// 입력 관리
// ============================================================
class InputManager {
    constructor() {
        this.player1 = { up: false, down: false, left: false, right: false, shoot: false };
        this.player2 = { up: false, down: false, left: false, right: false, shoot: false };
        this.mousePos = new Vector2D(0, 0);
        this.mouseDown = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mousedown', () => this.mouseDown = true);
        canvas.addEventListener('mouseup', () => this.mouseDown = false);
    }

    handleKeyDown(e) {
        // Player 1 (WASD + Arrows + Space)
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.player1.up = true;
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.player1.down = true;
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.player1.left = true;
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.player1.right = true;
        if (e.key === ' ') {
            e.preventDefault();
            this.player1.shoot = true;
        }

        // Player 2 (IJKL + Enter)
        if (e.key === 'i' || e.key === 'I') this.player2.up = true;
        if (e.key === 'k' || e.key === 'K') this.player2.down = true;
        if (e.key === 'j' || e.key === 'J') this.player2.left = true;
        if (e.key === 'l' || e.key === 'L') this.player2.right = true;
        if (e.key === 'Enter') {
            e.preventDefault();
            this.player2.shoot = true;
        }

        // Pause
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
            if (game.gameState === 'playing') {
                game.pause();
            }
        }
    }

    handleKeyUp(e) {
        // Player 1
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.player1.up = false;
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.player1.down = false;
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.player1.left = false;
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.player1.right = false;
        if (e.key === ' ') this.player1.shoot = false;

        // Player 2
        if (e.key === 'i' || e.key === 'I') this.player2.up = false;
        if (e.key === 'k' || e.key === 'K') this.player2.down = false;
        if (e.key === 'j' || e.key === 'J') this.player2.left = false;
        if (e.key === 'l' || e.key === 'L') this.player2.right = false;
        if (e.key === 'Enter') this.player2.shoot = false;
    }

    handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    }
}

// ============================================================
// 별 배경 (우주 분위기)
// ============================================================
class StarField {
    constructor(count = 200) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 2 + 1
            });
        }
    }

    update(deltaTime) {
        this.stars.forEach(star => {
            star.brightness += Math.sin(Date.now() * 0.001 * star.twinkleSpeed) * deltaTime * 0.5;
            star.brightness = Math.max(0, Math.min(1, star.brightness));
        });
    }

    draw(ctx) {
        this.stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// ============================================================
// 메인 게임 클래스
// ============================================================
class Game {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.gameMode = 'single'; // single, multi
        this.players = [];
        this.enemies = [];
        this.projectiles = [];
        this.particleSystem = new ParticleSystem();
        this.inputManager = new InputManager();
        this.starField = new StarField();
        this.wave = 1;
        this.enemiesPerWave = 3;
        this.waveTimer = 0;
        this.waveDelay = 5;
        this.score = 0;
        this.lastTime = 0;

        this.loadStats();
        this.updateStatsDisplay();
    }

    init() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.starField = new StarField();
        });

        this.gameLoop(0);
    }

    startSinglePlayer() {
        this.gameMode = 'single';
        this.startGame();
    }

    startMultiplayer() {
        this.gameMode = 'multi';
        this.startGame();
    }

    startGame() {
        this.gameState = 'playing';
        this.players = [];
        this.enemies = [];
        this.projectiles = [];
        this.wave = 1;
        this.waveTimer = this.waveDelay;

        // 플레이어 생성
        this.players.push(new PlayerDrone(canvas.width / 3, canvas.height / 2, 1));
        if (this.gameMode === 'multi') {
            this.players.push(new PlayerDrone(canvas.width * 2 / 3, canvas.height / 2, 2));
        }

        this.spawnWave();
        this.showScreen('game-screen');
    }

    spawnWave() {
        const enemyCount = this.enemiesPerWave + Math.floor(this.wave * 1.5);
        const difficulty = Math.min(5, 1 + Math.floor(this.wave / 3));

        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                const side = Math.floor(Math.random() * 4);
                let x, y;

                switch (side) {
                    case 0: x = Math.random() * canvas.width; y = -50; break;
                    case 1: x = canvas.width + 50; y = Math.random() * canvas.height; break;
                    case 2: x = Math.random() * canvas.width; y = canvas.height + 50; break;
                    case 3: x = -50; y = Math.random() * canvas.height; break;
                }

                this.enemies.push(new EnemyDrone(x, y, difficulty));
            }, i * 500);
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // 별 배경 업데이트
        this.starField.update(deltaTime);

        // 플레이어 업데이트
        this.players.forEach((player, index) => {
            const inputs = index === 0 ? this.inputManager.player1 : this.inputManager.player2;

            // 마우스 조준 (플레이어 1만)
            if (index === 0 && this.inputManager.mouseDown) {
                inputs.shoot = true;
                const dirToMouse = this.inputManager.mousePos.subtract(player.position);
                player.angle = dirToMouse.angle();
            }

            player.update(deltaTime, inputs, this.projectiles, this.particleSystem);
        });

        // 적 업데이트
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.players, this.projectiles, this.particleSystem);
        });

        // 발사체 업데이트 및 충돌 감지
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime);

            if (projectile.isDead()) return false;

            // 화면 밖 체크
            if (projectile.position.x < -100 || projectile.position.x > canvas.width + 100 ||
                projectile.position.y < -100 || projectile.position.y > canvas.height + 100) {
                return false;
            }

            // 충돌 체크
            if (projectile.owner instanceof PlayerDrone) {
                // 플레이어의 발사체 -> 적과 충돌
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    if (projectile.position.distance(enemy.position) < enemy.size + projectile.size) {
                        if (enemy.takeDamage(projectile.damage)) {
                            // 적 파괴
                            this.particleSystem.createExplosion(enemy.position.x, enemy.position.y, '#ff3366', 50);
                            projectile.owner.score += enemy.scoreValue;
                            projectile.owner.kills++;
                            this.enemies.splice(i, 1);
                        }
                        return false;
                    }
                }
            } else {
                // 적의 발사체 -> 플레이어와 충돌
                for (let player of this.players) {
                    if (projectile.position.distance(player.position) < player.size + projectile.size) {
                        if (player.takeDamage(projectile.damage)) {
                            this.gameOver();
                        } else {
                            this.particleSystem.createExplosion(player.position.x, player.position.y, player.color, 20);
                        }
                        this.updateHUD();
                        return false;
                    }
                }
            }

            return true;
        });

        // 적과 플레이어 충돌
        this.players.forEach(player => {
            this.enemies.forEach(enemy => {
                if (player.position.distance(enemy.position) < player.size + enemy.size) {
                    if (player.takeDamage(30)) {
                        this.gameOver();
                    }
                    if (enemy.takeDamage(50)) {
                        this.particleSystem.createExplosion(enemy.position.x, enemy.position.y, '#ff3366', 30);
                        this.enemies = this.enemies.filter(e => e !== enemy);
                    }
                    this.updateHUD();
                }
            });
        });

        // 파티클 업데이트
        this.particleSystem.update(deltaTime);

        // 웨이브 관리
        if (this.enemies.length === 0) {
            this.waveTimer -= deltaTime;
            if (this.waveTimer <= 0) {
                this.wave++;
                this.waveTimer = this.waveDelay;
                this.spawnWave();
            }
        }

        this.updateHUD();
    }

    draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // 별 배경
            this.starField.draw(ctx);

            // 파티클
            this.particleSystem.draw(ctx);

            // 발사체
            this.projectiles.forEach(p => p.draw(ctx));

            // 적
            this.enemies.forEach(e => e.draw(ctx, this.particleSystem));

            // 플레이어
            this.players.forEach(p => p.draw(ctx, this.particleSystem));

            // 웨이브 알림
            if (this.enemies.length === 0 && this.waveTimer > 0) {
                ctx.save();
                ctx.fillStyle = '#00d4ff';
                ctx.font = 'bold 48px sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00d4ff';
                ctx.fillText(`웨이브 ${this.wave} 준비 중...`, canvas.width / 2, canvas.height / 2);
                ctx.fillText(`${Math.ceil(this.waveTimer)}`, canvas.width / 2, canvas.height / 2 + 60);
                ctx.restore();
            }
        }
    }

    updateHUD() {
        const totalScore = this.players.reduce((sum, p) => sum + p.score, 0);
        const totalKills = this.players.reduce((sum, p) => sum + p.kills, 0);
        const avgHealth = this.players.reduce((sum, p) => sum + p.health, 0) / this.players.length;

        document.getElementById('score').textContent = totalScore;
        document.getElementById('health').textContent = Math.round(avgHealth);
        document.getElementById('health-fill').style.width = `${avgHealth}%`;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('kills').textContent = totalKills;
    }

    gameOver() {
        this.gameState = 'gameover';
        const totalScore = this.players.reduce((sum, p) => sum + p.score, 0);
        const totalKills = this.players.reduce((sum, p) => sum + p.kills, 0);

        document.getElementById('final-score').textContent = totalScore;
        document.getElementById('final-kills').textContent = totalKills;
        document.getElementById('final-wave').textContent = this.wave;
        document.getElementById('game-over').classList.remove('hidden');

        this.saveStats(totalScore, totalKills);
    }

    pause() {
        this.gameState = 'paused';
        document.getElementById('pause-menu').classList.remove('hidden');
    }

    resume() {
        this.gameState = 'playing';
        document.getElementById('pause-menu').classList.add('hidden');
    }

    restart() {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
        this.startGame();
    }

    showMainMenu() {
        this.gameState = 'menu';
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
        this.showScreen('main-menu');
        this.updateStatsDisplay();
    }

    showSettings() {
        alert('설정 기능은 향후 업데이트에서 추가됩니다!\n\n현재 조작법:\n플레이어 1: WASD/화살표 이동, Space/마우스 클릭 발사\n플레이어 2: IJKL 이동, Enter 발사');
    }

    showTrends() {
        this.showScreen('trends-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    saveStats(score, kills) {
        const stats = this.loadStats();
        stats.highScore = Math.max(stats.highScore, score);
        stats.totalKills += kills;
        stats.playTime += 1;
        localStorage.setItem('spaceDroneWarsStats', JSON.stringify(stats));
        this.updateStatsDisplay();
    }

    loadStats() {
        const defaultStats = { highScore: 0, totalKills: 0, playTime: 0 };
        try {
            const saved = localStorage.getItem('spaceDroneWarsStats');
            return saved ? JSON.parse(saved) : defaultStats;
        } catch {
            return defaultStats;
        }
    }

    updateStatsDisplay() {
        const stats = this.loadStats();
        document.getElementById('high-score').textContent = stats.highScore;
        document.getElementById('total-kills').textContent = stats.totalKills;
        document.getElementById('play-time').textContent = stats.playTime + 'h';
    }

    gameLoop(currentTime) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// ============================================================
// 게임 시작
// ============================================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const game = new Game();

window.addEventListener('load', () => {
    game.init();
});
