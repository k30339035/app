// Space Drone Wars 2026 - AAA Edition
// 상용 게임 수준의 완전한 3D 우주 전투 시뮬레이터

class SpaceDroneWarsGame {
    constructor() {
        this.gameState = 'loading';
        this.credits = parseInt(localStorage.getItem('credits') || '0');
        this.level = 1;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.kills = 0;
        this.wave = 1;
        this.gameTime = 0;

        // 업그레이드
        this.upgrades = JSON.parse(localStorage.getItem('upgrades') || JSON.stringify({
            health: 0,
            shield: 0,
            damage: 0,
            fireRate: 0,
            speed: 0,
            missile: false,
            railgun: false
        }));

        // 업적
        this.achievements = JSON.parse(localStorage.getItem('achievements') || '{}');

        // 게임 설정
        this.settings = {
            masterVolume: parseFloat(localStorage.getItem('masterVolume') || '0.7'),
            musicVolume: parseFloat(localStorage.getItem('musicVolume') || '0.5'),
            sfxVolume: parseFloat(localStorage.getItem('sfxVolume') || '0.8'),
            graphics: localStorage.getItem('graphics') || 'high'
        };

        // Babylon.js
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.player = null;
        this.enemies = [];
        this.bosses = [];
        this.projectiles = [];
        this.powerups = [];
        this.particles = [];

        // 게임 상태
        this.playerHealth = 100;
        this.playerShield = 100;
        this.playerEnergy = 100;
        this.currentWeapon = 'laser';
        this.weaponAmmo = { missile: 10, railgun: 5 };
        this.lastFireTime = 0;
        this.fireRate = 200; // ms
        this.comboTimer = 0;
        this.isPaused = false;

        // 사운드
        this.audioContext = null;
        this.sounds = {};
    }

    async init() {
        await this.fakeLoading();
        this.initAudio();
        this.showMainMenu();
    }

    async fakeLoading() {
        const stages = [
            { progress: 20, text: '엔진 초기화...' },
            { progress: 40, text: '3D 씬 생성...' },
            { progress: 60, text: '머티리얼 로딩...' },
            { progress: 80, text: '오디오 시스템...' },
            { progress: 100, text: '완료!' }
        ];

        for (const stage of stages) {
            await new Promise(resolve => setTimeout(resolve, 200));
            document.getElementById('loading-progress').style.width = stage.progress + '%';
            document.getElementById('loading-percent').textContent = stage.progress + '%';
            document.getElementById('loading-text').textContent = stage.text;
        }
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playSound(type, frequency = 440, duration = 0.1) {
        if (!this.audioContext || this.settings.sfxVolume === 0) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const volume = this.settings.masterVolume * this.settings.sfxVolume;

        switch(type) {
            case 'laser':
                oscillator.frequency.value = frequency;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                break;
            case 'explosion':
                oscillator.frequency.value = 100;
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration * 2);
                break;
            case 'powerup':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(volume * 0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration * 3);
                break;
            case 'hit':
                oscillator.frequency.value = 200;
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(volume * 0.4, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration * 1.5);
                break;
        }

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration * 3);
    }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    showMainMenu() {
        this.showScreen('main-menu');
        this.updatePlayerStats();
        this.gameState = 'menu';
    }

    updatePlayerStats() {
        document.getElementById('player-credits').textContent = this.credits;
        document.getElementById('player-level').textContent = this.level;
        document.getElementById('total-kills').textContent = this.kills;
    }

    showModeSelect() {
        this.showScreen('mode-select');
    }

    startStoryMode() {
        this.initBabylonEngine();
        this.startGame('story');
    }

    startSurvivalMode() {
        this.initBabylonEngine();
        this.startGame('survival');
    }

    startBossRush() {
        this.initBabylonEngine();
        this.startGame('bossrush');
    }

    startMultiplayer() {
        this.showNotification('멀티플레이어는 향후 업데이트 예정입니다!', 'info');
    }

    initBabylonEngine() {
        const canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: this.settings.graphics === 'high'
        });

        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.05, 1);

        // 카메라
        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            0, Math.PI / 3, 50,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.attachControl(canvas, false);
        this.camera.lowerRadiusLimit = 30;
        this.camera.upperRadiusLimit = 100;

        // 조명
        const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
        light1.intensity = 0.7;

        const light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(0, 50, 0), this.scene);
        light2.intensity = 0.5;
        light2.diffuse = new BABYLON.Color3(0, 0.5, 1);

        // 포스트 프로세싱 (고사양만)
        if (this.settings.graphics === 'high') {
            const pipeline = new BABYLON.DefaultRenderingPipeline('default', true, this.scene, [this.camera]);
            pipeline.bloomEnabled = true;
            pipeline.bloomThreshold = 0.8;
            pipeline.bloomWeight = 0.3;
            pipeline.bloomKernel = 64;
            pipeline.fxaaEnabled = true;
        }

        // 스카이박스
        this.createSkybox();

        // 플레이어 생성
        this.createPlayer();

        // 입력 처리
        this.setupInput();
    }

    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.15);
        skybox.material = skyboxMaterial;

        // 별 파티클
        const starSystem = new BABYLON.ParticleSystem('stars', 2000, this.scene);
        starSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', this.scene);
        starSystem.emitter = BABYLON.Vector3.Zero();
        starSystem.minEmitBox = new BABYLON.Vector3(-500, -500, -500);
        starSystem.maxEmitBox = new BABYLON.Vector3(500, 500, 500);
        starSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
        starSystem.color2 = new BABYLON.Color4(0.8, 0.8, 1, 1);
        starSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        starSystem.minSize = 0.1;
        starSystem.maxSize = 0.5;
        starSystem.minLifeTime = 999999;
        starSystem.maxLifeTime = 999999;
        starSystem.emitRate = 2000;
        starSystem.start();
    }

    createPlayer() {
        // 플레이어 드론 모델
        const body = BABYLON.MeshBuilder.CreateBox('playerBody', { width: 2, height: 0.5, depth: 2 }, this.scene);
        const wing1 = BABYLON.MeshBuilder.CreateBox('wing1', { width: 0.3, height: 0.2, depth: 3 }, this.scene);
        wing1.position.x = -1.5;
        const wing2 = BABYLON.MeshBuilder.CreateBox('wing2', { width: 0.3, height: 0.2, depth: 3 }, this.scene);
        wing2.position.x = 1.5;
        const cockpit = BABYLON.MeshBuilder.CreateSphere('cockpit', { diameter: 1 }, this.scene);
        cockpit.position.y = 0.3;

        this.player = BABYLON.Mesh.MergeMeshes([body, wing1, wing2, cockpit], true, true, undefined, false, true);

        // PBR 머티리얼
        const playerMat = new BABYLON.PBRMetallicRoughnessMaterial('playerMat', this.scene);
        playerMat.baseColor = new BABYLON.Color3(0, 0.8, 1);
        playerMat.metallic = 0.9;
        playerMat.roughness = 0.3;
        playerMat.emissiveColor = new BABYLON.Color3(0, 0.3, 0.5);
        this.player.material = playerMat;

        this.player.position = new BABYLON.Vector3(0, 0, 0);

        // 플레이어 데이터
        this.playerHealth = 100 * (1 + this.upgrades.health * 0.2);
        this.playerShield = 100 * (1 + this.upgrades.shield * 0.2);
        this.playerMaxHealth = this.playerHealth;
        this.playerMaxShield = this.playerShield;
        this.playerSpeed = 0.3 * (1 + this.upgrades.speed * 0.2);
        this.fireRate = 200 / (1 + this.upgrades.fireRate * 0.2);
    }

    createEnemy(position) {
        const enemy = BABYLON.MeshBuilder.CreateBox('enemy', { size: 1.5 }, this.scene);
        const enemyMat = new BABYLON.PBRMetallicRoughnessMaterial('enemyMat', this.scene);
        enemyMat.baseColor = new BABYLON.Color3(1, 0.2, 0);
        enemyMat.metallic = 0.8;
        enemyMat.roughness = 0.4;
        enemyMat.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
        enemy.material = enemyMat;
        enemy.position = position.clone();

        const enemyData = {
            mesh: enemy,
            health: 50 + this.wave * 10,
            maxHealth: 50 + this.wave * 10,
            speed: 0.1 + this.wave * 0.01,
            damage: 10 + this.wave * 2,
            lastFireTime: 0,
            aiState: 'chase',
            aiTimer: 0
        };

        this.enemies.push(enemyData);
        return enemyData;
    }

    createBoss(position) {
        const boss = BABYLON.MeshBuilder.CreateSphere('boss', { diameter: 5 }, this.scene);
        const bossMat = new BABYLON.PBRMetallicRoughnessMaterial('bossMat', this.scene);
        bossMat.baseColor = new BABYLON.Color3(0.8, 0, 0.8);
        bossMat.metallic = 1;
        bossMat.roughness = 0.2;
        bossMat.emissiveColor = new BABYLON.Color3(0.5, 0, 0.5);
        boss.material = bossMat;
        boss.position = position.clone();

        const bossData = {
            mesh: boss,
            health: 500 + this.wave * 100,
            maxHealth: 500 + this.wave * 100,
            speed: 0.15,
            damage: 20,
            lastFireTime: 0,
            phase: 1,
            pattern: 0,
            patternTimer: 0
        };

        this.bosses.push(bossData);
        return bossData;
    }

    setupInput() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // 무기 전환
            if (e.code === 'Digit1') this.currentWeapon = 'laser';
            if (e.code === 'Digit2' && this.upgrades.missile) this.currentWeapon = 'missile';
            if (e.code === 'Digit3' && this.upgrades.railgun) this.currentWeapon = 'railgun';

            // 일시정지
            if (e.code === 'Escape') this.togglePause();

            // 발사
            if (e.code === 'Space') this.fireWeapon();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    fireWeapon() {
        const now = Date.now();
        if (now - this.lastFireTime < this.fireRate) return;

        this.lastFireTime = now;

        switch(this.currentWeapon) {
            case 'laser':
                this.fireLaser();
                break;
            case 'missile':
                if (this.weaponAmmo.missile > 0) {
                    this.fireMissile();
                    this.weaponAmmo.missile--;
                }
                break;
            case 'railgun':
                if (this.weaponAmmo.railgun > 0) {
                    this.fireRailgun();
                    this.weaponAmmo.railgun--;
                }
                break;
        }

        this.updateHUD();
    }

    fireLaser() {
        const projectile = BABYLON.MeshBuilder.CreateCylinder('laser', {
            height: 2,
            diameter: 0.2
        }, this.scene);

        const laserMat = new BABYLON.StandardMaterial('laserMat', this.scene);
        laserMat.emissiveColor = new BABYLON.Color3(0, 1, 1);
        projectile.material = laserMat;

        projectile.position = this.player.position.clone();
        projectile.rotation.x = Math.PI / 2;

        const direction = this.camera.getForwardRay().direction;

        this.projectiles.push({
            mesh: projectile,
            velocity: direction.scale(1),
            damage: 20 * (1 + this.upgrades.damage * 0.2),
            type: 'laser',
            owner: 'player',
            lifetime: 3000,
            createdAt: Date.now()
        });

        this.playSound('laser', 800, 0.05);
    }

    fireMissile() {
        const missile = BABYLON.MeshBuilder.CreateCylinder('missile', {
            height: 1.5,
            diameter: 0.3
        }, this.scene);

        const missileMat = new BABYLON.StandardMaterial('missileMat', this.scene);
        missileMat.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        missile.material = missileMat;

        missile.position = this.player.position.clone();
        missile.rotation.x = Math.PI / 2;

        // 가장 가까운 적 찾기
        let target = null;
        let minDist = Infinity;

        for (const enemy of this.enemies) {
            const dist = BABYLON.Vector3.Distance(this.player.position, enemy.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                target = enemy;
            }
        }

        this.projectiles.push({
            mesh: missile,
            velocity: new BABYLON.Vector3(0, 0, 0.8),
            damage: 50 * (1 + this.upgrades.damage * 0.2),
            type: 'missile',
            owner: 'player',
            target: target,
            lifetime: 5000,
            createdAt: Date.now()
        });

        this.playSound('laser', 400, 0.1);
    }

    fireRailgun() {
        const beam = BABYLON.MeshBuilder.CreateCylinder('railgun', {
            height: 100,
            diameter: 0.5
        }, this.scene);

        const railMat = new BABYLON.StandardMaterial('railMat', this.scene);
        railMat.emissiveColor = new BABYLON.Color3(1, 1, 0);
        beam.material = railMat;

        beam.position = this.player.position.clone();
        beam.position.z += 50;
        beam.rotation.x = Math.PI / 2;

        // 즉시 관통 데미지
        for (const enemy of this.enemies) {
            const dist = Math.abs(enemy.mesh.position.x - this.player.position.x);
            if (dist < 5) {
                this.damageEnemy(enemy, 100 * (1 + this.upgrades.damage * 0.2));
            }
        }

        this.projectiles.push({
            mesh: beam,
            velocity: new BABYLON.Vector3(0, 0, 0),
            damage: 0,
            type: 'railgun',
            owner: 'player',
            lifetime: 100,
            createdAt: Date.now()
        });

        this.playSound('laser', 200, 0.2);
    }

    damageEnemy(enemy, damage) {
        enemy.health -= damage;

        this.playSound('hit', 300, 0.05);

        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        this.createExplosion(enemy.mesh.position);
        enemy.mesh.dispose();

        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }

        this.kills++;
        this.combo++;
        this.comboTimer = 3000;

        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        const comboBonus = Math.floor(this.combo * 10);
        const creditReward = 100 + comboBonus;

        this.score += 100 + comboBonus;
        this.credits += creditReward;

        this.checkAchievements();
        this.updateHUD();

        // 파워업 드롭 (20% 확률)
        if (Math.random() < 0.2) {
            this.spawnPowerup(enemy.mesh.position);
        }

        this.playSound('explosion', 100, 0.3);
    }

    createExplosion(position) {
        const particleSystem = new BABYLON.ParticleSystem('explosion', 100, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', this.scene);

        particleSystem.emitter = position;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);

        particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1);
        particleSystem.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0);

        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 1;

        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.5;

        particleSystem.emitRate = 200;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

        particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);

        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 4;

        particleSystem.start();

        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => particleSystem.dispose(), 1000);
        }, 100);
    }

    spawnPowerup(position) {
        const types = ['health', 'shield', 'missile'];
        const type = types[Math.floor(Math.random() * types.length)];

        const powerup = BABYLON.MeshBuilder.CreateSphere('powerup', { diameter: 1 }, this.scene);
        const powerupMat = new BABYLON.StandardMaterial('powerupMat', this.scene);

        switch(type) {
            case 'health':
                powerupMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
                break;
            case 'shield':
                powerupMat.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
                break;
            case 'missile':
                powerupMat.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
                break;
        }

        powerup.material = powerupMat;
        powerup.position = position.clone();

        this.powerups.push({
            mesh: powerup,
            type: type,
            createdAt: Date.now(),
            lifetime: 10000
        });
    }

    checkPowerupCollision() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            const dist = BABYLON.Vector3.Distance(this.player.position, powerup.mesh.position);

            if (dist < 2) {
                this.collectPowerup(powerup);
                powerup.mesh.dispose();
                this.powerups.splice(i, 1);
            } else if (Date.now() - powerup.createdAt > powerup.lifetime) {
                powerup.mesh.dispose();
                this.powerups.splice(i, 1);
            }
        }
    }

    collectPowerup(powerup) {
        switch(powerup.type) {
            case 'health':
                this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 30);
                this.showNotification('+30 체력', 'success');
                break;
            case 'shield':
                this.playerShield = Math.min(this.playerMaxShield, this.playerShield + 50);
                this.showNotification('+50 쉴드', 'success');
                break;
            case 'missile':
                this.weaponAmmo.missile += 5;
                this.showNotification('+5 미사일', 'success');
                break;
        }

        this.playSound('powerup', 800, 0.2);
        this.updateHUD();
    }

    checkAchievements() {
        // 첫 격추
        if (this.kills === 1 && !this.achievements.firstKill) {
            this.unlockAchievement('firstKill', '첫 격추', 500);
        }

        // 100기 격추
        if (this.kills >= 100 && !this.achievements.kills100) {
            this.unlockAchievement('kills100', '100기 격추', 1000);
        }

        // 웨이브 5
        if (this.wave >= 5 && !this.achievements.wave5) {
            this.unlockAchievement('wave5', '웨이브 5 도달', 500);
        }

        // 50 콤보
        if (this.combo >= 50 && !this.achievements.combo50) {
            this.unlockAchievement('combo50', '50 콤보 달성', 1000);
        }
    }

    unlockAchievement(id, name, reward) {
        this.achievements[id] = true;
        this.credits += reward;
        this.saveProgress();

        this.showNotification(`업적 달성: ${name} (+${reward} 크레딧)`, 'achievement');
        this.playSound('powerup', 1200, 0.3);
    }

    updateEnemyAI(enemy, deltaTime) {
        const toPlayer = this.player.position.subtract(enemy.mesh.position);
        const distance = toPlayer.length();

        enemy.aiTimer += deltaTime;

        if (enemy.aiTimer > 2000) {
            enemy.aiTimer = 0;
            const rand = Math.random();
            if (rand < 0.6) enemy.aiState = 'chase';
            else if (rand < 0.9) enemy.aiState = 'strafe';
            else enemy.aiState = 'retreat';
        }

        switch(enemy.aiState) {
            case 'chase':
                if (distance > 2) {
                    const moveDir = toPlayer.normalize().scale(enemy.speed);
                    enemy.mesh.position.addInPlace(moveDir);
                }
                break;

            case 'strafe':
                const strafeDir = new BABYLON.Vector3(-toPlayer.z, 0, toPlayer.x).normalize();
                enemy.mesh.position.addInPlace(strafeDir.scale(enemy.speed * 0.5));
                break;

            case 'retreat':
                if (distance < 30) {
                    const retreatDir = toPlayer.normalize().scale(-enemy.speed);
                    enemy.mesh.position.addInPlace(retreatDir);
                }
                break;
        }

        // 적 발사
        if (distance < 25 && Date.now() - enemy.lastFireTime > 1500) {
            enemy.lastFireTime = Date.now();
            this.enemyFire(enemy);
        }
    }

    enemyFire(enemy) {
        const projectile = BABYLON.MeshBuilder.CreateSphere('enemyProj', { diameter: 0.3 }, this.scene);
        const projMat = new BABYLON.StandardMaterial('enemyProjMat', this.scene);
        projMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
        projectile.material = projMat;

        projectile.position = enemy.mesh.position.clone();

        const toPlayer = this.player.position.subtract(enemy.mesh.position).normalize();

        this.projectiles.push({
            mesh: projectile,
            velocity: toPlayer.scale(0.5),
            damage: enemy.damage,
            type: 'enemy',
            owner: 'enemy',
            lifetime: 5000,
            createdAt: Date.now()
        });

        this.playSound('laser', 600, 0.05);
    }

    updateBossAI(boss, deltaTime) {
        boss.patternTimer += deltaTime;

        const toPlayer = this.player.position.subtract(boss.mesh.position);
        const distance = toPlayer.length();

        // 페이즈 변경
        const healthPercent = boss.health / boss.maxHealth;
        if (healthPercent < 0.66 && boss.phase === 1) boss.phase = 2;
        if (healthPercent < 0.33 && boss.phase === 2) boss.phase = 3;

        // 패턴 전환
        if (boss.patternTimer > 5000) {
            boss.patternTimer = 0;
            boss.pattern = (boss.pattern + 1) % 3;
        }

        switch(boss.pattern) {
            case 0: // 원형 발사
                boss.mesh.rotation.y += 0.02;
                if (boss.patternTimer % 500 < 16) {
                    for (let i = 0; i < 8; i++) {
                        const angle = (Math.PI * 2 / 8) * i + boss.mesh.rotation.y;
                        this.bossSpiralFire(boss, angle);
                    }
                }
                break;

            case 1: // 추격
                if (distance > 15) {
                    const moveDir = toPlayer.normalize().scale(boss.speed);
                    boss.mesh.position.addInPlace(moveDir);
                }
                if (boss.patternTimer % 800 < 16) {
                    this.bossDirectFire(boss);
                }
                break;

            case 2: // 탄막
                if (boss.patternTimer % 200 < 16) {
                    for (let i = 0; i < boss.phase; i++) {
                        this.bossDirectFire(boss, i * 0.3 - 0.3);
                    }
                }
                break;
        }
    }

    bossSpiralFire(boss, angle) {
        const projectile = BABYLON.MeshBuilder.CreateSphere('bossProj', { diameter: 0.4 }, this.scene);
        const projMat = new BABYLON.StandardMaterial('bossProjMat', this.scene);
        projMat.emissiveColor = new BABYLON.Color3(1, 0, 1);
        projectile.material = projMat;

        projectile.position = boss.mesh.position.clone();

        const dir = new BABYLON.Vector3(Math.cos(angle), 0, Math.sin(angle));

        this.projectiles.push({
            mesh: projectile,
            velocity: dir.scale(0.3),
            damage: boss.damage,
            type: 'boss',
            owner: 'enemy',
            lifetime: 8000,
            createdAt: Date.now()
        });
    }

    bossDirectFire(boss, spread = 0) {
        const projectile = BABYLON.MeshBuilder.CreateSphere('bossProj', { diameter: 0.5 }, this.scene);
        const projMat = new BABYLON.StandardMaterial('bossProjMat', this.scene);
        projMat.emissiveColor = new BABYLON.Color3(1, 0, 1);
        projectile.material = projMat;

        projectile.position = boss.mesh.position.clone();

        const toPlayer = this.player.position.subtract(boss.mesh.position).normalize();
        toPlayer.x += spread;

        this.projectiles.push({
            mesh: projectile,
            velocity: toPlayer.normalize().scale(0.6),
            damage: boss.damage * 1.5,
            type: 'boss',
            owner: 'enemy',
            lifetime: 8000,
            createdAt: Date.now()
        });
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];

            // 수명 체크
            if (Date.now() - proj.createdAt > proj.lifetime) {
                proj.mesh.dispose();
                this.projectiles.splice(i, 1);
                continue;
            }

            // 미사일 유도
            if (proj.type === 'missile' && proj.target && proj.target.mesh) {
                const toTarget = proj.target.mesh.position.subtract(proj.mesh.position).normalize();
                proj.velocity = proj.velocity.scale(0.9).add(toTarget.scale(0.1)).normalize().scale(0.8);
            }

            // 이동
            proj.mesh.position.addInPlace(proj.velocity);

            // 충돌 체크
            if (proj.owner === 'player') {
                // 플레이어 투사체 vs 적
                for (const enemy of this.enemies) {
                    const dist = BABYLON.Vector3.Distance(proj.mesh.position, enemy.mesh.position);
                    if (dist < 2) {
                        this.damageEnemy(enemy, proj.damage);
                        proj.mesh.dispose();
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }

                // 플레이어 투사체 vs 보스
                for (const boss of this.bosses) {
                    const dist = BABYLON.Vector3.Distance(proj.mesh.position, boss.mesh.position);
                    if (dist < 5) {
                        boss.health -= proj.damage;
                        if (boss.health <= 0) {
                            this.killBoss(boss);
                        }
                        proj.mesh.dispose();
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            } else {
                // 적 투사체 vs 플레이어
                const dist = BABYLON.Vector3.Distance(proj.mesh.position, this.player.position);
                if (dist < 2) {
                    this.damagePlayer(proj.damage);
                    proj.mesh.dispose();
                    this.projectiles.splice(i, 1);
                }
            }
        }
    }

    damagePlayer(damage) {
        if (this.playerShield > 0) {
            this.playerShield -= damage;
            if (this.playerShield < 0) {
                this.playerHealth += this.playerShield;
                this.playerShield = 0;
            }
        } else {
            this.playerHealth -= damage;
        }

        this.playSound('hit', 200, 0.1);
        this.updateHUD();

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    killBoss(boss) {
        this.createExplosion(boss.mesh.position);
        boss.mesh.dispose();

        const index = this.bosses.indexOf(boss);
        if (index > -1) {
            this.bosses.splice(index, 1);
        }

        this.score += 5000;
        this.credits += 5000;
        this.kills++;

        if (!this.achievements.bossKill) {
            this.unlockAchievement('bossKill', '첫 보스 처치', 2000);
        }

        this.showNotification('보스 격파! +5000 크레딧', 'boss');
        this.playSound('explosion', 50, 0.5);

        // 보스 보상
        for (let i = 0; i < 3; i++) {
            const offset = new BABYLON.Vector3(
                (Math.random() - 0.5) * 10,
                0,
                (Math.random() - 0.5) * 10
            );
            this.spawnPowerup(boss.mesh.position.add(offset));
        }

        this.updateHUD();
    }

    spawnWave() {
        this.wave++;
        this.showNotification(`웨이브 ${this.wave}`, 'wave');

        // 보스 웨이브 (5의 배수)
        if (this.wave % 5 === 0) {
            const bossPos = new BABYLON.Vector3(
                (Math.random() - 0.5) * 20,
                5,
                30
            );
            this.createBoss(bossPos);
            this.showNotification('보스 등장!', 'boss');
        }

        // 일반 적 스폰
        const enemyCount = 5 + this.wave * 2;
        for (let i = 0; i < enemyCount; i++) {
            const angle = (Math.PI * 2 / enemyCount) * i;
            const radius = 30 + Math.random() * 20;
            const pos = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 10,
                Math.sin(angle) * radius
            );

            setTimeout(() => {
                this.createEnemy(pos);
            }, i * 500);
        }

        this.updateHUD();
    }

    startGame(mode) {
        this.gameMode = mode;
        this.gameState = 'playing';
        this.showScreen('game-screen');

        this.score = 0;
        this.combo = 0;
        this.wave = 0;
        this.gameTime = 0;
        this.gameStartTime = Date.now();

        this.playerHealth = this.playerMaxHealth;
        this.playerShield = this.playerMaxShield;
        this.playerEnergy = 100;
        this.weaponAmmo = { missile: 10, railgun: 5 };

        this.updateHUD();
        this.spawnWave();

        this.engine.runRenderLoop(() => {
            if (this.gameState === 'playing' && !this.isPaused) {
                const deltaTime = this.engine.getDeltaTime();
                this.gameLoop(deltaTime);
                this.scene.render();
            }
        });
    }

    gameLoop(deltaTime) {
        this.gameTime += deltaTime;

        // 플레이어 이동
        this.updatePlayerMovement(deltaTime);

        // 쉴드 재생
        if (this.playerShield < this.playerMaxShield) {
            this.playerShield = Math.min(this.playerMaxShield, this.playerShield + deltaTime * 0.01);
        }

        // 에너지 재생
        if (this.playerEnergy < 100) {
            this.playerEnergy = Math.min(100, this.playerEnergy + deltaTime * 0.02);
        }

        // 콤보 타이머
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // AI 업데이트
        for (const enemy of this.enemies) {
            this.updateEnemyAI(enemy, deltaTime);
        }

        for (const boss of this.bosses) {
            this.updateBossAI(boss, deltaTime);
        }

        // 투사체 업데이트
        this.updateProjectiles();

        // 파워업 체크
        this.checkPowerupCollision();

        // 파워업 회전
        for (const powerup of this.powerups) {
            powerup.mesh.rotation.y += 0.05;
            powerup.mesh.position.y = Math.sin(Date.now() * 0.003) * 0.5;
        }

        // 웨이브 완료 체크
        if (this.enemies.length === 0 && this.bosses.length === 0 && this.gameState === 'playing') {
            setTimeout(() => this.spawnWave(), 2000);
        }

        // HUD 업데이트
        if (Math.floor(this.gameTime / 100) % 3 === 0) {
            this.updateHUD();
        }
    }

    updatePlayerMovement(deltaTime) {
        const moveSpeed = this.playerSpeed * (deltaTime / 16);

        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.player.position.z += moveSpeed;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.player.position.z -= moveSpeed;
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.player.position.x -= moveSpeed;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.player.position.x += moveSpeed;
        }
        if (this.keys['KeyQ']) {
            this.player.position.y += moveSpeed;
        }
        if (this.keys['KeyE']) {
            this.player.position.y -= moveSpeed;
        }

        // 경계 제한
        this.player.position.x = Math.max(-40, Math.min(40, this.player.position.x));
        this.player.position.y = Math.max(-10, Math.min(20, this.player.position.y));
        this.player.position.z = Math.max(-40, Math.min(40, this.player.position.z));

        // 카메라 따라가기
        this.camera.target = this.player.position;
    }

    updateHUD() {
        // 체력/쉴드/에너지 바
        const healthPercent = (this.playerHealth / this.playerMaxHealth) * 100;
        const shieldPercent = (this.playerShield / this.playerMaxShield) * 100;
        const energyPercent = this.playerEnergy;

        document.getElementById('health-bar').style.width = Math.max(0, healthPercent) + '%';
        document.getElementById('shield-bar').style.width = Math.max(0, shieldPercent) + '%';
        document.getElementById('energy-bar').style.width = Math.max(0, energyPercent) + '%';

        document.getElementById('health-text').textContent = Math.max(0, Math.floor(this.playerHealth));
        document.getElementById('shield-text').textContent = Math.max(0, Math.floor(this.playerShield));
        document.getElementById('energy-text').textContent = Math.floor(this.playerEnergy);

        // 점수/웨이브/콤보
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('wave-value').textContent = this.wave;
        document.getElementById('combo-value').textContent = this.combo > 1 ? `x${this.combo}` : '';

        // 무기
        document.querySelectorAll('.weapon-slot').forEach(slot => {
            slot.classList.remove('active');
        });

        if (this.currentWeapon === 'laser') {
            document.getElementById('weapon-laser').classList.add('active');
        } else if (this.currentWeapon === 'missile') {
            document.getElementById('weapon-missile').classList.add('active');
            document.querySelector('#weapon-missile .weapon-ammo').textContent = this.weaponAmmo.missile;
        } else if (this.currentWeapon === 'railgun') {
            document.getElementById('weapon-railgun').classList.add('active');
            document.querySelector('#weapon-railgun .weapon-ammo').textContent = this.weaponAmmo.railgun;
        }

        // FPS
        const fps = Math.round(this.engine.getFps());
        document.getElementById('fps-value').textContent = fps;
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            document.getElementById('pause-menu').style.display = 'flex';
        } else {
            document.getElementById('pause-menu').style.display = 'none';
        }
    }

    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-menu').style.display = 'none';
    }

    quitGame() {
        this.gameState = 'menu';
        this.saveProgress();

        // 정리
        if (this.engine) {
            this.engine.stopRenderLoop();
            this.scene.dispose();
            this.engine.dispose();
        }

        this.enemies = [];
        this.bosses = [];
        this.projectiles = [];
        this.powerups = [];

        this.showMainMenu();
    }

    gameOver() {
        this.gameState = 'gameover';
        this.saveProgress();

        const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-kills').textContent = this.kills;
        document.getElementById('final-wave').textContent = this.wave;
        document.getElementById('final-combo').textContent = this.maxCombo;
        document.getElementById('final-time').textContent = this.formatTime(playTime);

        this.showScreen('gameover-screen');

        if (this.engine) {
            this.engine.stopRenderLoop();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    saveProgress() {
        localStorage.setItem('credits', this.credits.toString());
        localStorage.setItem('upgrades', JSON.stringify(this.upgrades));
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    showUpgrades() {
        this.showScreen('upgrades-screen');
        this.renderUpgrades();
    }

    renderUpgrades() {
        const upgradeList = [
            { id: 'health', name: '체력 증가', cost: 500, current: this.upgrades.health || 0, max: 5, desc: '+20% 최대 체력' },
            { id: 'shield', name: '쉴드 증가', cost: 500, current: this.upgrades.shield || 0, max: 5, desc: '+20% 최대 쉴드' },
            { id: 'damage', name: '데미지 증가', cost: 600, current: this.upgrades.damage || 0, max: 5, desc: '+20% 무기 데미지' },
            { id: 'fireRate', name: '연사력 증가', cost: 700, current: this.upgrades.fireRate || 0, max: 5, desc: '+20% 발사 속도' },
            { id: 'speed', name: '이동속도 증가', cost: 400, current: this.upgrades.speed || 0, max: 5, desc: '+20% 이동 속도' },
            { id: 'missile', name: '미사일 시스템', cost: 2000, current: this.upgrades.missile ? 1 : 0, max: 1, desc: '유도 미사일 장착' },
            { id: 'railgun', name: '레일건 시스템', cost: 3000, current: this.upgrades.railgun ? 1 : 0, max: 1, desc: '관통 레일건 장착' }
        ];

        const grid = document.getElementById('upgrade-grid');
        grid.innerHTML = upgradeList.map(upgrade => {
            const isMaxed = upgrade.current >= upgrade.max;
            const canAfford = this.credits >= upgrade.cost;
            const totalCost = upgrade.cost * (upgrade.current + 1);

            return `
                <div class="upgrade-card ${isMaxed ? 'maxed' : ''} ${!canAfford && !isMaxed ? 'locked' : ''}">
                    <h3>${upgrade.name}</h3>
                    <p class="upgrade-desc">${upgrade.desc}</p>
                    <p class="upgrade-level">레벨: ${upgrade.current} / ${upgrade.max}</p>
                    ${!isMaxed ? `
                        <button
                            class="upgrade-btn"
                            onclick="game.purchaseUpgrade('${upgrade.id}', ${totalCost})"
                            ${!canAfford ? 'disabled' : ''}
                        >
                            ${totalCost} 크레딧
                        </button>
                    ` : '<p class="maxed-text">최대 레벨</p>'}
                </div>
            `;
        }).join('');

        this.updatePlayerStats();
    }

    purchaseUpgrade(id, cost) {
        if (this.credits < cost) {
            this.showNotification('크레딧이 부족합니다!', 'error');
            return;
        }

        if (id === 'missile' || id === 'railgun') {
            this.upgrades[id] = true;
        } else {
            this.upgrades[id] = (this.upgrades[id] || 0) + 1;
        }

        this.credits -= cost;
        this.saveProgress();
        this.renderUpgrades();

        this.showNotification(`업그레이드 구매: ${id}`, 'success');
        this.playSound('powerup', 1000, 0.2);
    }

    showAchievements() {
        this.showScreen('achievements-screen');
        this.renderAchievements();
    }

    renderAchievements() {
        const achievementList = [
            { id: 'firstKill', name: '첫 격추', desc: '첫 번째 적 격추', reward: 500 },
            { id: 'kills100', name: '백인 참살', desc: '100기 격추', reward: 1000 },
            { id: 'wave5', name: '생존자', desc: '웨이브 5 도달', reward: 500 },
            { id: 'bossKill', name: '보스 헌터', desc: '첫 보스 처치', reward: 2000 },
            { id: 'combo50', name: '콤보 마스터', desc: '50 콤보 달성', reward: 1000 },
            { id: 'perfect', name: '완벽한 승리', desc: '체력 100%로 웨이브 클리어', reward: 1500 },
            { id: 'speedrun', name: '스피드런', desc: '3분 안에 웨이브 10 도달', reward: 2000 }
        ];

        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = achievementList.map(ach => {
            const unlocked = this.achievements[ach.id] || false;

            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${unlocked ? '🏆' : '🔒'}</div>
                    <h3>${ach.name}</h3>
                    <p class="achievement-desc">${ach.desc}</p>
                    <p class="achievement-reward">보상: ${ach.reward} 크레딧</p>
                    ${unlocked ? '<p class="achievement-status">달성 완료</p>' : '<p class="achievement-status">미달성</p>'}
                </div>
            `;
        }).join('');
    }

    showSettings() {
        this.showScreen('settings-screen');
        this.loadSettings();
    }

    loadSettings() {
        document.getElementById('master-volume').value = this.settings.masterVolume * 100;
        document.getElementById('music-volume').value = this.settings.musicVolume * 100;
        document.getElementById('sfx-volume').value = this.settings.sfxVolume * 100;
        document.getElementById('graphics-quality').value = this.settings.graphics;

        this.updateVolumeDisplays();
    }

    updateVolumeDisplays() {
        document.getElementById('master-value').textContent = Math.round(this.settings.masterVolume * 100) + '%';
        document.getElementById('music-value').textContent = Math.round(this.settings.musicVolume * 100) + '%';
        document.getElementById('sfx-value').textContent = Math.round(this.settings.sfxVolume * 100) + '%';
    }

    updateSetting(setting, value) {
        if (setting.includes('volume')) {
            this.settings[setting.replace('-', '')] = value / 100;
            localStorage.setItem(setting.replace('-', ''), (value / 100).toString());
        } else {
            this.settings[setting] = value;
            localStorage.setItem(setting, value);
        }

        this.updateVolumeDisplays();
    }

    resetProgress() {
        if (confirm('정말로 모든 진행 상황을 초기화하시겠습니까?')) {
            localStorage.clear();
            this.credits = 0;
            this.upgrades = {};
            this.achievements = {};
            this.kills = 0;
            this.level = 1;

            this.showNotification('진행 상황이 초기화되었습니다', 'info');
            this.showMainMenu();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid var(--primary-color);
            border-radius: 8px;
            color: white;
            font-family: 'Rajdhani', sans-serif;
            font-size: 1.2rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        if (type === 'error') notification.style.borderColor = '#ff0000';
        if (type === 'success') notification.style.borderColor = '#00ff00';
        if (type === 'achievement') notification.style.borderColor = '#ffd700';
        if (type === 'boss') notification.style.borderColor = '#ff00ff';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 전역 게임 인스턴스
const game = new SpaceDroneWarsGame();

// 게임 시작
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});

// 전역 함수들 (HTML onclick에서 사용)
window.game = game;
