/**
 * Weapon System for Robot Combat
 * Handles melee and ranged attacks
 */

class Weapon {
    constructor(type, damage, range, cooldown, energyCost) {
        this.type = type;
        this.damage = damage;
        this.range = range;
        this.cooldown = cooldown;
        this.currentCooldown = 0;
        this.energyCost = energyCost;
        this.isActive = false;
        this.activeTime = 0;
    }

    canUse() {
        return this.currentCooldown <= 0;
    }

    use() {
        if (this.canUse()) {
            this.currentCooldown = this.cooldown;
            this.isActive = true;
            this.activeTime = 0;
            return true;
        }
        return false;
    }

    update(deltaTime) {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= deltaTime;
        }

        if (this.isActive) {
            this.activeTime += deltaTime;
            if (this.activeTime > 10) { // Active for 10 frames
                this.isActive = false;
            }
        }
    }
}

class MeleeWeapon extends Weapon {
    constructor(damage = 15, range = 80, cooldown = 30) {
        super('melee', damage, range, cooldown, 5);
        this.comboCounter = 0;
        this.comboTimeout = 0;
        this.maxCombo = 3;
    }

    use() {
        if (super.use()) {
            // Combo system
            if (this.comboTimeout > 0) {
                this.comboCounter = Math.min(this.comboCounter + 1, this.maxCombo);
            } else {
                this.comboCounter = 1;
            }
            this.comboTimeout = 60; // Reset combo after 60 frames

            return true;
        }
        return false;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.comboTimeout > 0) {
            this.comboTimeout -= deltaTime;
            if (this.comboTimeout <= 0) {
                this.comboCounter = 0;
            }
        }
    }

    getDamage() {
        // Increase damage with combo
        return this.damage * (1 + (this.comboCounter - 1) * 0.3);
    }

    getKnockback() {
        return 8 + this.comboCounter * 3;
    }
}

class RangedWeapon extends Weapon {
    constructor(damage = 10, range = 500, cooldown = 45) {
        super('ranged', damage, range, cooldown, 15);
        this.projectileSpeed = 12;
    }

    createProjectile(x, y, targetX, targetY) {
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return {
            x,
            y,
            vx: (dx / distance) * this.projectileSpeed,
            vy: (dy / distance) * this.projectileSpeed,
            damage: this.damage,
            lifetime: 120,
            size: 8,
            color: '#00ffff',
            owner: null
        };
    }
}

class SpecialWeapon extends Weapon {
    constructor(damage = 35, range = 150, cooldown = 120) {
        super('special', damage, range, cooldown, 40);
        this.chargeTime = 0;
        this.maxCharge = 30;
        this.isCharging = false;
    }

    startCharge() {
        this.isCharging = true;
        this.chargeTime = 0;
    }

    updateCharge(deltaTime) {
        if (this.isCharging) {
            this.chargeTime = Math.min(this.chargeTime + deltaTime, this.maxCharge);
        }
    }

    release() {
        if (this.canUse() && this.isCharging) {
            const chargeRatio = this.chargeTime / this.maxCharge;
            this.currentCooldown = this.cooldown;
            this.isActive = true;
            this.isCharging = false;
            this.activeTime = 0;

            return {
                success: true,
                chargeRatio
            };
        }
        return { success: false };
    }

    getDamage() {
        const chargeRatio = Math.min(this.chargeTime / this.maxCharge, 1);
        return this.damage * (0.5 + chargeRatio * 0.5);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.updateCharge(deltaTime);
    }
}

class WeaponSystem {
    constructor(robot) {
        this.robot = robot;
        this.melee = new MeleeWeapon();
        this.ranged = new RangedWeapon();
        this.special = new SpecialWeapon();
        this.currentWeapon = this.melee;
        this.projectiles = [];
    }

    switchWeapon(weaponType) {
        switch (weaponType) {
            case 'melee':
                this.currentWeapon = this.melee;
                break;
            case 'ranged':
                this.currentWeapon = this.ranged;
                break;
            case 'special':
                this.currentWeapon = this.special;
                break;
        }
    }

    useMelee(targetX, targetY) {
        if (this.melee.use() && this.robot.energy >= this.melee.energyCost) {
            this.robot.energy -= this.melee.energyCost;
            return {
                type: 'melee',
                damage: this.melee.getDamage(),
                range: this.melee.range,
                knockback: this.melee.getKnockback(),
                x: this.robot.x,
                y: this.robot.y,
                combo: this.melee.comboCounter
            };
        }
        return null;
    }

    useRanged(targetX, targetY) {
        if (this.ranged.use() && this.robot.energy >= this.ranged.energyCost) {
            this.robot.energy -= this.ranged.energyCost;

            const projectile = this.ranged.createProjectile(
                this.robot.x + this.robot.width / 2,
                this.robot.y + this.robot.height / 2,
                targetX,
                targetY
            );
            projectile.owner = this.robot;
            this.projectiles.push(projectile);

            return {
                type: 'ranged',
                projectile
            };
        }
        return null;
    }

    useSpecial(targetX, targetY) {
        const result = this.special.release();
        if (result.success && this.robot.energy >= this.special.energyCost) {
            this.robot.energy -= this.special.energyCost;

            return {
                type: 'special',
                damage: this.special.getDamage(),
                range: this.special.range * (1 + result.chargeRatio * 0.5),
                knockback: 15 + result.chargeRatio * 10,
                x: this.robot.x,
                y: this.robot.y,
                chargeRatio: result.chargeRatio
            };
        }
        return null;
    }

    update(deltaTime) {
        this.melee.update(deltaTime);
        this.ranged.update(deltaTime);
        this.special.update(deltaTime);

        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => {
            proj.x += proj.vx * deltaTime;
            proj.y += proj.vy * deltaTime;
            proj.lifetime -= deltaTime;
            return proj.lifetime > 0;
        });
    }

    drawProjectiles(ctx) {
        this.projectiles.forEach(proj => {
            ctx.save();
            ctx.fillStyle = proj.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = proj.color;

            // Draw energy ball
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
            ctx.fill();

            // Draw glow
            const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, proj.size * 2);
            gradient.addColorStop(0, proj.color + '80');
            gradient.addColorStop(1, proj.color + '00');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    getProjectiles() {
        return this.projectiles;
    }

    removeProjectile(projectile) {
        const index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
    }
}
