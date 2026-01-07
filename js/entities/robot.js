/**
 * Robot Entity Class
 * Handles robot state, animation, and combat mechanics
 */

class Robot {
    constructor(x, y, isPlayer = false) {
        // Position and physics
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;

        // Stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxEnergy = 100;
        this.energy = 100;
        this.energyRegenRate = 0.3;

        // Movement
        this.moveSpeed = 4;
        this.jumpPower = 15;
        this.isPlayer = isPlayer;

        // Combat
        this.isAttacking = false;
        this.isDodging = false;
        this.isBlocking = false;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.stunned = false;
        this.stunnedTime = 0;

        // Animation
        this.facing = 1; // 1 = right, -1 = left
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.currentAnimation = 'idle';
        this.animations = {
            idle: { frames: 4, speed: 8 },
            walk: { frames: 6, speed: 4 },
            jump: { frames: 3, speed: 6 },
            attack: { frames: 5, speed: 3 },
            hurt: { frames: 3, speed: 4 },
            dodge: { frames: 4, speed: 3 }
        };

        // Visual effects
        this.color = isPlayer ? '#00ff00' : '#ff0000';
        this.glowIntensity = 0;
        this.hitFlash = 0;

        // Weapon system
        this.weaponSystem = new WeaponSystem(this);

        // AI reference (for enemy robots)
        this.ai = null;
    }

    /**
     * Update robot state
     */
    update(deltaTime, physics) {
        // Regenerate energy
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * deltaTime);
        }

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }

        // Update stun
        if (this.stunned) {
            this.stunnedTime -= deltaTime;
            if (this.stunnedTime <= 0) {
                this.stunned = false;
            }
        }

        // Update hit flash
        if (this.hitFlash > 0) {
            this.hitFlash -= deltaTime;
        }

        // Update weapon system
        this.weaponSystem.update(deltaTime);

        // Update animation
        this.updateAnimation(deltaTime);

        // Apply physics
        physics.applyPhysics(this, deltaTime);
    }

    /**
     * Move robot
     */
    move(direction) {
        if (!this.stunned && !this.isDodging) {
            this.velocityX += direction * this.moveSpeed;
            this.facing = direction > 0 ? 1 : -1;
            this.setAnimation('walk');
        }
    }

    /**
     * Jump
     */
    jump() {
        if (this.isGrounded && !this.stunned && this.energy >= 5) {
            this.velocityY = -this.jumpPower;
            this.energy -= 5;
            this.setAnimation('jump');
        }
    }

    /**
     * Dodge/dash
     */
    dodge() {
        if (!this.isDodging && this.energy >= 20 && !this.stunned) {
            this.isDodging = true;
            this.invulnerable = true;
            this.invulnerabilityTime = 15;
            this.velocityX = this.facing * 10;
            this.energy -= 20;
            this.setAnimation('dodge');

            setTimeout(() => {
                this.isDodging = false;
            }, 200);
        }
    }

    /**
     * Perform melee attack
     */
    meleeAttack(targetX, targetY) {
        const result = this.weaponSystem.useMelee(targetX, targetY);
        if (result) {
            this.setAnimation('attack');
            this.isAttacking = true;
            setTimeout(() => {
                this.isAttacking = false;
            }, 200);
        }
        return result;
    }

    /**
     * Perform ranged attack
     */
    rangedAttack(targetX, targetY) {
        return this.weaponSystem.useRanged(targetX, targetY);
    }

    /**
     * Perform special attack
     */
    specialAttack(targetX, targetY) {
        return this.weaponSystem.useSpecial(targetX, targetY);
    }

    /**
     * Take damage
     */
    takeDamage(damage, knockbackX = 0, knockbackY = 0) {
        if (this.invulnerable || this.health <= 0) {
            return false;
        }

        // Reduce damage if blocking
        if (this.isBlocking) {
            damage *= 0.3;
            knockbackX *= 0.3;
            knockbackY *= 0.3;
        }

        this.health = Math.max(0, this.health - damage);
        this.velocityX += knockbackX;
        this.velocityY += knockbackY;

        // Visual feedback
        this.hitFlash = 10;
        this.setAnimation('hurt');

        // Stun on heavy hit
        if (damage > 20) {
            this.stunned = true;
            this.stunnedTime = damage * 0.5;
        }

        // Brief invulnerability
        this.invulnerable = true;
        this.invulnerabilityTime = 20;

        return true;
    }

    /**
     * Check if alive
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Set animation
     */
    setAnimation(name) {
        if (this.currentAnimation !== name && this.animations[name]) {
            this.currentAnimation = name;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }

    /**
     * Update animation
     */
    updateAnimation(deltaTime) {
        const anim = this.animations[this.currentAnimation];
        if (!anim) return;

        this.animationTimer += deltaTime;
        if (this.animationTimer >= anim.speed) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % anim.frames;
        }

        // Auto-return to idle
        if (!this.isGrounded) {
            if (this.currentAnimation !== 'jump' && this.currentAnimation !== 'attack') {
                this.setAnimation('jump');
            }
        } else if (Math.abs(this.velocityX) < 0.1 &&
                   this.currentAnimation !== 'attack' &&
                   this.currentAnimation !== 'hurt' &&
                   this.currentAnimation !== 'dodge') {
            this.setAnimation('idle');
        }
    }

    /**
     * Draw robot
     */
    draw(ctx) {
        ctx.save();

        // Flash effect when hit
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ffffff';
        } else if (this.invulnerable) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        }

        // Robot body (simplified representation)
        this.drawRobotBody(ctx);

        // Weapon effects
        this.weaponSystem.drawProjectiles(ctx);

        ctx.restore();
    }

    /**
     * Draw robot body with animation
     */
    drawRobotBody(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Glow effect
        if (this.glowIntensity > 0 || this.energy > 80) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
        }

        // Draw based on facing direction
        ctx.save();
        if (this.facing < 0) {
            ctx.scale(-1, 1);
            ctx.translate(-centerX * 2, 0);
        }

        // Head
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 15, this.y + 5, 30, 25);

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 20, this.y + 12, 8, 8);
        ctx.fillRect(this.x + 35, this.y + 12, 8, 8);

        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 10, this.y + 30, 40, 35);

        // Arms (animated)
        const armOffset = Math.sin(this.animationFrame * 0.5) * 5;
        ctx.fillRect(this.x - 5, this.y + 35 + armOffset, 15, 25);
        ctx.fillRect(this.x + 50, this.y + 35 - armOffset, 15, 25);

        // Legs (animated)
        const legOffset = Math.sin(this.animationFrame * 0.7) * 3;
        ctx.fillRect(this.x + 15, this.y + 65 + legOffset, 12, 15);
        ctx.fillRect(this.x + 33, this.y + 65 - legOffset, 12, 15);

        // Energy indicator
        if (this.weaponSystem.special.isCharging) {
            const chargeRatio = this.weaponSystem.special.chargeTime / this.weaponSystem.special.maxCharge;
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50, 0, Math.PI * 2 * chargeRatio);
            ctx.stroke();
        }

        // Status indicators
        if (this.isBlocking) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }

        if (this.stunned) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '20px Arial';
            ctx.fillText('*', this.x + this.width / 2 - 5, this.y - 10);
        }

        ctx.restore();
    }

    /**
     * Get hitbox for collision detection
     */
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            centerX: this.x + this.width / 2,
            centerY: this.y + this.height / 2
        };
    }

    /**
     * Get attack hitbox
     */
    getAttackHitbox() {
        if (!this.isAttacking) return null;

        return {
            x: this.x + (this.facing > 0 ? this.width : -40),
            y: this.y + 20,
            width: 40,
            height: 40
        };
    }
}
