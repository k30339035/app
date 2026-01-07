/**
 * Physics Engine for Robot Battle
 * Handles collision detection, physics simulation, and hit detection
 */

class PhysicsEngine {
    constructor() {
        this.gravity = 0.8;
        this.friction = 0.85;
        this.airResistance = 0.98;
        this.groundLevel = 0;
    }

    /**
     * Apply physics to an entity
     */
    applyPhysics(entity, deltaTime) {
        // Apply gravity if not on ground
        if (entity.y < this.groundLevel) {
            entity.velocityY += this.gravity * deltaTime;
        }

        // Apply air resistance
        entity.velocityX *= this.airResistance;
        entity.velocityY *= this.airResistance;

        // Apply friction if on ground
        if (entity.y >= this.groundLevel && Math.abs(entity.velocityY) < 1) {
            entity.velocityX *= this.friction;
            entity.velocityY = 0;
            entity.y = this.groundLevel;
            entity.isGrounded = true;
        } else {
            entity.isGrounded = false;
        }

        // Update position
        entity.x += entity.velocityX * deltaTime;
        entity.y += entity.velocityY * deltaTime;

        // Ground collision
        if (entity.y > this.groundLevel) {
            entity.y = this.groundLevel;
            entity.velocityY *= -0.3; // Bounce with energy loss
            if (Math.abs(entity.velocityY) < 0.5) {
                entity.velocityY = 0;
            }
        }
    }

    /**
     * Check collision between two rectangular entities
     */
    checkCollision(entity1, entity2) {
        return (
            entity1.x < entity2.x + entity2.width &&
            entity1.x + entity1.width > entity2.x &&
            entity1.y < entity2.y + entity2.height &&
            entity1.y + entity1.height > entity2.y
        );
    }

    /**
     * Check circular collision (for hitboxes)
     */
    checkCircularCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    }

    /**
     * Resolve collision between two entities
     */
    resolveCollision(entity1, entity2, impactForce = 1.0) {
        const dx = entity2.x - entity1.x;
        const dy = entity2.y - entity1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        // Normalize
        const nx = dx / distance;
        const ny = dy / distance;

        // Relative velocity
        const dvx = entity2.velocityX - entity1.velocityX;
        const dvy = entity2.velocityY - entity1.velocityY;

        // Relative velocity in collision normal direction
        const dvn = dvx * nx + dvy * ny;

        // Don't resolve if velocities are separating
        if (dvn > 0) return;

        // Calculate impulse scalar
        const restitution = 0.7; // Bounciness
        const impulse = -(1 + restitution) * dvn / 2;

        // Apply impulse
        const impulseX = impulse * nx * impactForce;
        const impulseY = impulse * ny * impactForce;

        entity1.velocityX -= impulseX;
        entity1.velocityY -= impulseY;
        entity2.velocityX += impulseX;
        entity2.velocityY += impulseY;

        // Separate entities to prevent overlap
        const overlap = (entity1.width / 2 + entity2.width / 2) - distance;
        if (overlap > 0) {
            const separationX = nx * overlap * 0.5;
            const separationY = ny * overlap * 0.5;
            entity1.x -= separationX;
            entity1.y -= separationY;
            entity2.x += separationX;
            entity2.y += separationY;
        }
    }

    /**
     * Calculate impact force based on velocity
     */
    calculateImpactForce(velocityX, velocityY) {
        return Math.sqrt(velocityX * velocityX + velocityY * velocityY) * 0.1;
    }

    /**
     * Ray casting for line of sight
     */
    raycast(x1, y1, x2, y2, obstacles = []) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / 10);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;

            for (const obstacle of obstacles) {
                if (
                    x >= obstacle.x &&
                    x <= obstacle.x + obstacle.width &&
                    y >= obstacle.y &&
                    y <= obstacle.y + obstacle.height
                ) {
                    return { hit: true, x, y, distance: distance * t };
                }
            }
        }

        return { hit: false, distance };
    }

    /**
     * Apply force to entity
     */
    applyForce(entity, forceX, forceY) {
        entity.velocityX += forceX;
        entity.velocityY += forceY;
    }

    /**
     * Calculate knockback based on hit direction and force
     */
    applyKnockback(entity, fromX, fromY, force) {
        const dx = entity.x - fromX;
        const dy = entity.y - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const nx = dx / distance;
        const ny = dy / distance;

        entity.velocityX += nx * force;
        entity.velocityY += ny * force * 0.5; // Less vertical knockback
    }

    /**
     * Calculate damage based on impact force and attack multiplier
     */
    calculateDamage(impactForce, attackPower, defenseModifier = 1.0) {
        const baseDamage = attackPower + impactForce * 5;
        return Math.max(1, Math.floor(baseDamage * defenseModifier));
    }

    /**
     * Check if point is within bounds
     */
    isInBounds(x, y, bounds) {
        return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
    }

    /**
     * Constrain entity within bounds
     */
    constrainToBounds(entity, bounds) {
        if (entity.x < bounds.left) {
            entity.x = bounds.left;
            entity.velocityX *= -0.5;
        }
        if (entity.x + entity.width > bounds.right) {
            entity.x = bounds.right - entity.width;
            entity.velocityX *= -0.5;
        }
        if (entity.y < bounds.top) {
            entity.y = bounds.top;
            entity.velocityY *= -0.5;
        }
        if (entity.y + entity.height > bounds.bottom) {
            entity.y = bounds.bottom - entity.height;
            entity.velocityY = 0;
        }
    }
}
