/**
 * Particle System for Visual Effects
 * Handles explosions, sparks, smoke, and impact effects
 */

class Particle {
    constructor(x, y, vx, vy, color, life, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.alpha = 1.0;
        this.gravity = 0.2;
        this.friction = 0.98;
    }

    update(deltaTime) {
        this.vx *= this.friction;
        this.vy += this.gravity * deltaTime;
        this.vy *= this.friction;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        this.life -= deltaTime;
        this.alpha = this.life / this.maxLife;

        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 1000;
    }

    /**
     * Create explosion effect
     */
    createExplosion(x, y, intensity = 1.0, color = '#ff6600') {
        const particleCount = Math.floor(20 * intensity);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 4 * intensity;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 30 + Math.random() * 30;
            const size = 3 + Math.random() * 4;

            this.addParticle(x, y, vx, vy, color, life, size);
        }

        // Add some random particles for variety
        for (let i = 0; i < particleCount / 2; i++) {
            const vx = (Math.random() - 0.5) * 10 * intensity;
            const vy = (Math.random() - 0.5) * 10 * intensity;
            const life = 20 + Math.random() * 20;
            const size = 2 + Math.random() * 3;

            this.addParticle(x, y, vx, vy, '#ffaa00', life, size);
        }
    }

    /**
     * Create impact sparks
     */
    createImpactSparks(x, y, direction, intensity = 1.0) {
        const particleCount = Math.floor(15 * intensity);
        const baseAngle = Math.atan2(direction.y, direction.x);
        const spread = Math.PI / 3;

        for (let i = 0; i < particleCount; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * spread;
            const speed = 4 + Math.random() * 6 * intensity;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 15 + Math.random() * 15;
            const size = 2 + Math.random() * 3;

            // Mix of colors for realism
            const colors = ['#ffffff', '#ffff00', '#ff6600', '#ff0000'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.addParticle(x, y, vx, vy, color, life, size);
        }
    }

    /**
     * Create energy blast effect
     */
    createEnergyBlast(x, y, targetX, targetY, color = '#00ffff') {
        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);

        for (let i = 0; i < 30; i++) {
            const offsetAngle = angle + (Math.random() - 0.5) * 0.5;
            const speed = 8 + Math.random() * 4;
            const vx = Math.cos(offsetAngle) * speed;
            const vy = Math.sin(offsetAngle) * speed;
            const life = 20 + Math.random() * 20;
            const size = 3 + Math.random() * 4;

            this.addParticle(x, y, vx, vy, color, life, size);
        }
    }

    /**
     * Create punch impact effect
     */
    createPunchImpact(x, y, direction, intensity = 1.0) {
        // Main impact flash
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 10 + Math.random() * 10;
            const size = 4 + Math.random() * 3;

            this.addParticle(x, y, vx, vy, '#ffffff', life, size);
        }

        // Directional sparks
        this.createImpactSparks(x, y, direction, intensity);
    }

    /**
     * Create smoke trail
     */
    createSmoke(x, y, intensity = 1.0) {
        const particleCount = Math.floor(3 * intensity);

        for (let i = 0; i < particleCount; i++) {
            const vx = (Math.random() - 0.5) * 1;
            const vy = -1 - Math.random() * 2;
            const life = 40 + Math.random() * 40;
            const size = 5 + Math.random() * 5;

            const grayValue = Math.floor(50 + Math.random() * 100);
            const color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;

            this.addParticle(x, y, vx, vy, color, life, size);
        }
    }

    /**
     * Create blood/oil splatter (for robots - oil/hydraulic fluid)
     */
    createSplatter(x, y, direction, intensity = 1.0) {
        const particleCount = Math.floor(10 * intensity);
        const baseAngle = Math.atan2(direction.y, direction.x);

        for (let i = 0; i < particleCount; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * Math.PI;
            const speed = 2 + Math.random() * 4 * intensity;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 1;
            const life = 30 + Math.random() * 30;
            const size = 2 + Math.random() * 3;

            // Dark oil color
            const color = '#1a0a00';

            const particle = new Particle(x, y, vx, vy, color, life, size);
            particle.gravity = 0.5; // More gravity for liquid effect
            this.particles.push(particle);
        }
    }

    /**
     * Create shield impact effect
     */
    createShieldImpact(x, y, intensity = 1.0) {
        const particleCount = Math.floor(20 * intensity);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 15 + Math.random() * 15;
            const size = 2 + Math.random() * 3;

            const color = '#00ffff';

            this.addParticle(x, y, vx, vy, color, life, size);
        }
    }

    /**
     * Add particle to system
     */
    addParticle(x, y, vx, vy, color, life, size) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }

        this.particles.push(new Particle(x, y, vx, vy, color, life, size));
    }

    /**
     * Update all particles
     */
    update(deltaTime) {
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
    }

    /**
     * Draw all particles
     */
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Get particle count
     */
    getCount() {
        return this.particles.length;
    }
}
