// ============================================================
// SPACE DRONE WARS 2026 - Babylon.js 3D Edition
// ============================================================

class SpaceDroneGame {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.gameState = 'loading'; // loading, menu, playing, paused, gameover
        this.gameMode = 'single';

        // Game objects
        this.players = [];
        this.enemies = [];
        this.projectiles = [];

        // Game stats
        this.wave = 1;
        this.score = 0;
        this.kills = 0;
        this.waveTimer = 0;
        this.waveDelay = 5;
        this.survivalTime = 0;
        this.startTime = 0;

        // Input
        this.inputManager = null;

        // Minimap
        this.minimapCtx = null;

        // Assets
        this.sounds = {};
        this.materials = {};
    }

    async init() {
        await this.load();
        this.setupEventListeners();
    }

    async load() {
        this.updateLoadingProgress(0, '엔진 초기화 중...');

        // Canvas 설정
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });

        this.updateLoadingProgress(20, '3D 씬 생성 중...');

        // 씬 생성
        await this.createScene();

        this.updateLoadingProgress(40, '머티리얼 로딩 중...');
        await this.createMaterials();

        this.updateLoadingProgress(60, '환경 설정 중...');
        await this.createEnvironment();

        this.updateLoadingProgress(80, '시스템 최적화 중...');

        // 입력 관리자
        this.inputManager = new InputManager();

        // 미니맵 초기화
        const minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = minimapCanvas.getContext('2d');

        this.updateLoadingProgress(90, '최종 확인 중...');

        // 렌더 루프 시작
        this.engine.runRenderLoop(() => {
            if (this.gameState === 'playing') {
                const deltaTime = this.engine.getDeltaTime() / 1000;
                this.update(deltaTime);
                this.updateMinimap();
            }
            this.scene.render();
            this.updateFPS();
        });

        // 반응형
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        this.updateLoadingProgress(100, '완료!');

        setTimeout(() => {
            this.showMainMenu();
        }, 500);
    }

    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

        // 안개 효과
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.0008;
        this.scene.fogColor = new BABYLON.Color3(0.02, 0.02, 0.08);

        // 카메라
        this.camera = new BABYLON.ArcRotateCamera(
            'camera',
            0,
            Math.PI / 4,
            150,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 50;
        this.camera.upperRadiusLimit = 300;
        this.camera.wheelPrecision = 20;

        // 조명
        const light1 = new BABYLON.HemisphericLight(
            'light1',
            new BABYLON.Vector3(1, 1, 0),
            this.scene
        );
        light1.intensity = 0.3;

        const light2 = new BABYLON.PointLight(
            'light2',
            new BABYLON.Vector3(0, 50, 0),
            this.scene
        );
        light2.intensity = 0.5;
        light2.diffuse = new BABYLON.Color3(0, 0.5, 1);

        // 포스트 프로세싱 - 글로우 효과
        const gl = new BABYLON.GlowLayer('glow', this.scene, {
            blurKernelSize: 64
        });
        gl.intensity = 0.8;
    }

    async createMaterials() {
        // 플레이어 1 머티리얼
        this.materials.player1 = new BABYLON.PBRMetallicRoughnessMaterial('player1Mat', this.scene);
        this.materials.player1.baseColor = new BABYLON.Color3(0, 0.83, 1); // #00d4ff
        this.materials.player1.metallic = 0.8;
        this.materials.player1.roughness = 0.2;
        this.materials.player1.emissiveColor = new BABYLON.Color3(0, 0.5, 0.8);

        // 플레이어 2 머티리얼
        this.materials.player2 = new BABYLON.PBRMetallicRoughnessMaterial('player2Mat', this.scene);
        this.materials.player2.baseColor = new BABYLON.Color3(1, 0, 1); // #ff00ff
        this.materials.player2.metallic = 0.8;
        this.materials.player2.roughness = 0.2;
        this.materials.player2.emissiveColor = new BABYLON.Color3(0.8, 0, 0.8);

        // 적 머티리얼
        this.materials.enemy = new BABYLON.PBRMetallicRoughnessMaterial('enemyMat', this.scene);
        this.materials.enemy.baseColor = new BABYLON.Color3(1, 0.2, 0.4); // #ff3366
        this.materials.enemy.metallic = 0.7;
        this.materials.enemy.roughness = 0.3;
        this.materials.enemy.emissiveColor = new BABYLON.Color3(0.6, 0, 0.2);

        // 발사체 머티리얼
        this.materials.projectile = new BABYLON.StandardMaterial('projectileMat', this.scene);
        this.materials.projectile.emissiveColor = new BABYLON.Color3(0, 1, 0.5);
        this.materials.projectile.disableLighting = true;
    }

    async createEnvironment() {
        // 스카이박스
        const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 2000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;

        // 스타필드 효과
        const starfieldTexture = new BABYLON.DynamicTexture('starfield', 512, this.scene);
        const ctx = starfieldTexture.getContext();
        ctx.fillStyle = '#000010';
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2;
            const brightness = Math.random();
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.fillRect(x, y, size, size);
        }

        starfieldTexture.update();
        skyboxMaterial.emissiveTexture = starfieldTexture;

        // 그리드 플레인 (참조용)
        const ground = BABYLON.MeshBuilder.CreateGround('ground', {
            width: 500,
            height: 500,
            subdivisions: 10
        }, this.scene);
        ground.position.y = -50;

        const groundMat = new BABYLON.StandardMaterial('groundMat', this.scene);
        groundMat.alpha = 0.1;
        groundMat.emissiveColor = new BABYLON.Color3(0, 0.2, 0.4);
        groundMat.wireframe = true;
        ground.material = groundMat;

        // 경계 표시
        const boundarySize = 200;
        this.createBoundary(boundarySize);
    }

    createBoundary(size) {
        const points = [
            new BABYLON.Vector3(-size, -size, -size),
            new BABYLON.Vector3(size, -size, -size),
            new BABYLON.Vector3(size, size, -size),
            new BABYLON.Vector3(-size, size, -size),
            new BABYLON.Vector3(-size, -size, -size),
            new BABYLON.Vector3(-size, -size, size),
            new BABYLON.Vector3(size, -size, size),
            new BABYLON.Vector3(size, size, size),
            new BABYLON.Vector3(-size, size, size),
            new BABYLON.Vector3(-size, -size, size)
        ];

        const lines = BABYLON.MeshBuilder.CreateLines('boundary', { points }, this.scene);
        lines.color = new BABYLON.Color3(0, 0.5, 1);
        lines.alpha = 0.2;
    }

    createDroneMesh(type = 'player', playerNum = 1) {
        // 드론 본체 - 복합 메시
        const drone = new BABYLON.TransformNode('drone', this.scene);

        // 메인 바디
        const body = BABYLON.MeshBuilder.CreatePolyhedron('body', {
            type: 0,
            size: 2
        }, this.scene);
        body.parent = drone;

        // 날개
        const wing1 = BABYLON.MeshBuilder.CreateBox('wing1', {
            width: 4,
            height: 0.2,
            depth: 1
        }, this.scene);
        wing1.position.x = 2;
        wing1.parent = drone;

        const wing2 = BABYLON.MeshBuilder.CreateBox('wing2', {
            width: 4,
            height: 0.2,
            depth: 1
        }, this.scene);
        wing2.position.x = -2;
        wing2.parent = drone;

        // 엔진
        const engine1 = BABYLON.MeshBuilder.CreateCylinder('engine1', {
            height: 2,
            diameter: 0.8
        }, this.scene);
        engine1.rotation.z = Math.PI / 2;
        engine1.position.set(3, 0, 0);
        engine1.parent = drone;

        const engine2 = BABYLON.MeshBuilder.CreateCylinder('engine2', {
            height: 2,
            diameter: 0.8
        }, this.scene);
        engine2.rotation.z = Math.PI / 2;
        engine2.position.set(-3, 0, 0);
        engine2.parent = drone;

        // 코어
        const core = BABYLON.MeshBuilder.CreateSphere('core', {
            diameter: 1.5
        }, this.scene);
        core.parent = drone;

        // 머티리얼 적용
        let material;
        if (type === 'player') {
            material = playerNum === 1 ? this.materials.player1 : this.materials.player2;
        } else {
            material = this.materials.enemy;
        }

        body.material = material;
        wing1.material = material;
        wing2.material = material;
        engine1.material = material;
        engine2.material = material;
        core.material = material;

        // 파티클 시스템 - 추진기
        if (type === 'player') {
            this.createThrusterParticles(drone, playerNum);
        }

        return drone;
    }

    createThrusterParticles(drone, playerNum) {
        const color = playerNum === 1 ?
            new BABYLON.Color4(0, 0.83, 1, 1) :
            new BABYLON.Color4(1, 0, 1, 1);

        // 왼쪽 추진기
        const thruster1 = new BABYLON.ParticleSystem('thruster1', 500, this.scene);
        thruster1.particleTexture = new BABYLON.Texture('https://www.babylonjs-playground.com/textures/flare.png', this.scene);
        thruster1.emitter = new BABYLON.Vector3(-3, 0, 0);
        thruster1.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.2);
        thruster1.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);
        thruster1.color1 = color;
        thruster1.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 0.5);
        thruster1.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        thruster1.minSize = 0.3;
        thruster1.maxSize = 0.8;
        thruster1.minLifeTime = 0.1;
        thruster1.maxLifeTime = 0.3;
        thruster1.emitRate = 300;
        thruster1.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        thruster1.gravity = new BABYLON.Vector3(0, 0, 0);
        thruster1.direction1 = new BABYLON.Vector3(-2, -1, -1);
        thruster1.direction2 = new BABYLON.Vector3(-2, 1, 1);
        thruster1.minEmitPower = 2;
        thruster1.maxEmitPower = 4;
        thruster1.updateSpeed = 0.01;

        // 오른쪽 추진기
        const thruster2 = thruster1.clone('thruster2');
        thruster2.emitter = new BABYLON.Vector3(3, 0, 0);
        thruster2.direction1 = new BABYLON.Vector3(2, -1, -1);
        thruster2.direction2 = new BABYLON.Vector3(2, 1, 1);

        drone.thrusters = [thruster1, thruster2];
    }

    createProjectile(position, direction, owner) {
        const projectile = BABYLON.MeshBuilder.CreateSphere('projectile', {
            diameter: 0.5
        }, this.scene);

        projectile.position = position.clone();
        projectile.material = this.materials.projectile;

        // 트레일 파티클
        const trail = new BABYLON.ParticleSystem('trail', 200, this.scene);
        trail.particleTexture = new BABYLON.Texture('https://www.babylonjs-playground.com/textures/flare.png', this.scene);
        trail.emitter = projectile;
        trail.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        trail.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        trail.color1 = new BABYLON.Color4(0, 1, 0.5, 1);
        trail.color2 = new BABYLON.Color4(0, 0.5, 1, 0.5);
        trail.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        trail.minSize = 0.2;
        trail.maxSize = 0.5;
        trail.minLifeTime = 0.1;
        trail.maxLifeTime = 0.3;
        trail.emitRate = 100;
        trail.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        trail.gravity = new BABYLON.Vector3(0, 0, 0);
        trail.minEmitPower = 0.1;
        trail.maxEmitPower = 0.5;
        trail.updateSpeed = 0.01;
        trail.start();

        return {
            mesh: projectile,
            velocity: direction.scale(100),
            lifetime: 3,
            damage: 20,
            owner: owner,
            trail: trail
        };
    }

    createExplosion(position, color) {
        const explosion = new BABYLON.ParticleSystem('explosion', 500, this.scene);
        explosion.particleTexture = new BABYLON.Texture('https://www.babylonjs-playground.com/textures/flare.png', this.scene);
        explosion.emitter = position;
        explosion.minEmitBox = new BABYLON.Vector3(-1, -1, -1);
        explosion.maxEmitBox = new BABYLON.Vector3(1, 1, 1);
        explosion.color1 = color || new BABYLON.Color4(1, 0.5, 0, 1);
        explosion.color2 = new BABYLON.Color4(1, 0.2, 0, 0.5);
        explosion.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        explosion.minSize = 0.5;
        explosion.maxSize = 2;
        explosion.minLifeTime = 0.2;
        explosion.maxLifeTime = 0.5;
        explosion.emitRate = 1000;
        explosion.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        explosion.gravity = new BABYLON.Vector3(0, 0, 0);
        explosion.direction1 = new BABYLON.Vector3(-5, -5, -5);
        explosion.direction2 = new BABYLON.Vector3(5, 5, 5);
        explosion.minEmitPower = 5;
        explosion.maxEmitPower = 10;
        explosion.updateSpeed = 0.01;
        explosion.targetStopDuration = 0.3;
        explosion.disposeOnStop = true;
        explosion.start();
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
        this.wave = 1;
        this.score = 0;
        this.kills = 0;
        this.waveTimer = this.waveDelay;
        this.survivalTime = 0;
        this.startTime = Date.now();

        // 기존 오브젝트 정리
        this.cleanupGameObjects();

        // 플레이어 생성
        this.players = [];
        const player1 = new Player3D(this, new BABYLON.Vector3(-20, 0, 0), 1);
        this.players.push(player1);

        if (this.gameMode === 'multi') {
            const player2 = new Player3D(this, new BABYLON.Vector3(20, 0, 0), 2);
            this.players.push(player2);
        }

        // 첫 웨이브 생성
        this.spawnWave();

        // 카메라 설정
        if (this.players.length > 0) {
            this.camera.lockedTarget = this.players[0].mesh;
        }

        this.showScreen('game-screen');
        this.updateHUD();
    }

    cleanupGameObjects() {
        // 플레이어 정리
        this.players.forEach(p => p.dispose());
        this.players = [];

        // 적 정리
        this.enemies.forEach(e => e.dispose());
        this.enemies = [];

        // 발사체 정리
        this.projectiles.forEach(p => {
            p.mesh.dispose();
            p.trail.dispose();
        });
        this.projectiles = [];
    }

    spawnWave() {
        const enemyCount = 3 + Math.floor(this.wave * 1.5);
        const difficulty = Math.min(5, 1 + Math.floor(this.wave / 3));

        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / enemyCount;
                const radius = 100;
                const position = new BABYLON.Vector3(
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 40,
                    Math.sin(angle) * radius
                );

                const enemy = new Enemy3D(this, position, difficulty);
                this.enemies.push(enemy);
            }, i * 500);
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // 생존 시간
        this.survivalTime = (Date.now() - this.startTime) / 1000;

        // 플레이어 업데이트
        this.players.forEach((player, index) => {
            const inputs = index === 0 ? this.inputManager.player1 : this.inputManager.player2;
            player.update(deltaTime, inputs);
        });

        // 적 업데이트
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.players);
        });

        // 발사체 업데이트
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.lifetime -= deltaTime;

            if (projectile.lifetime <= 0) {
                projectile.mesh.dispose();
                projectile.trail.dispose();
                return false;
            }

            // 이동
            projectile.mesh.position.addInPlace(projectile.velocity.scale(deltaTime));

            // 경계 체크
            const pos = projectile.mesh.position;
            if (Math.abs(pos.x) > 200 || Math.abs(pos.y) > 200 || Math.abs(pos.z) > 200) {
                projectile.mesh.dispose();
                projectile.trail.dispose();
                return false;
            }

            // 충돌 체크
            if (projectile.owner.isPlayer) {
                // 플레이어 발사체 -> 적 충돌
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    const dist = BABYLON.Vector3.Distance(projectile.mesh.position, enemy.mesh.position);

                    if (dist < 3) {
                        enemy.health -= projectile.damage;

                        if (enemy.health <= 0) {
                            this.createExplosion(enemy.mesh.position, new BABYLON.Color4(1, 0.2, 0.4, 1));
                            projectile.owner.score += enemy.scoreValue;
                            projectile.owner.kills++;
                            this.kills++;
                            enemy.dispose();
                            this.enemies.splice(i, 1);
                        }

                        projectile.mesh.dispose();
                        projectile.trail.dispose();
                        this.updateHUD();
                        return false;
                    }
                }
            } else {
                // 적 발사체 -> 플레이어 충돌
                for (let player of this.players) {
                    const dist = BABYLON.Vector3.Distance(projectile.mesh.position, player.mesh.position);

                    if (dist < 3) {
                        player.health -= projectile.damage;
                        this.createExplosion(player.mesh.position, new BABYLON.Color4(0, 0.83, 1, 1));

                        if (player.health <= 0) {
                            this.gameOver();
                        }

                        projectile.mesh.dispose();
                        projectile.trail.dispose();
                        this.updateHUD();
                        return false;
                    }
                }
            }

            return true;
        });

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

    updateHUD() {
        const totalScore = this.players.reduce((sum, p) => sum + p.score, 0);
        const avgHealth = this.players.reduce((sum, p) => sum + p.health, 0) / this.players.length;
        const energy = this.players.length > 0 ? this.players[0].energy : 100;

        document.getElementById('score').textContent = totalScore;
        document.getElementById('health').textContent = Math.round(avgHealth);
        document.getElementById('health-fill').style.width = `${avgHealth}%`;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('kills').textContent = this.kills;
        document.getElementById('energy').textContent = Math.round(energy) + '%';
        document.getElementById('energy-fill').style.width = `${energy}%`;
    }

    updateFPS() {
        const fps = this.engine.getFps().toFixed();
        document.getElementById('fps').textContent = fps;
    }

    updateMinimap() {
        if (!this.minimapCtx) return;

        const ctx = this.minimapCtx;
        const size = 200;
        const scale = size / 400; // 400 is game area size

        // Clear
        ctx.fillStyle = 'rgba(0, 10, 20, 0.9)';
        ctx.fillRect(0, 0, size, size);

        // Grid
        ctx.strokeStyle = 'rgba(0, 132, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const pos = (size / 4) * i;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(size, pos);
            ctx.stroke();
        }

        // Players
        this.players.forEach((player, index) => {
            const x = size / 2 + player.mesh.position.x * scale;
            const y = size / 2 + player.mesh.position.z * scale;

            ctx.fillStyle = index === 0 ? '#00d4ff' : '#ff00ff';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Enemies
        this.enemies.forEach(enemy => {
            const x = size / 2 + enemy.mesh.position.x * scale;
            const y = size / 2 + enemy.mesh.position.z * scale;

            ctx.fillStyle = '#ff3366';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    gameOver() {
        this.gameState = 'gameover';
        const totalScore = this.players.reduce((sum, p) => sum + p.score, 0);

        document.getElementById('final-score').textContent = totalScore;
        document.getElementById('final-kills').textContent = this.kills;
        document.getElementById('final-wave').textContent = this.wave;
        document.getElementById('survival-time').textContent = Math.round(this.survivalTime);
        document.getElementById('game-over').classList.remove('hidden');

        this.saveStats(totalScore, this.kills, this.wave);
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
        this.cleanupGameObjects();
        this.showScreen('main-menu');
        this.updateStatsDisplay();
    }

    showSettings() {
        alert('설정 기능은 향후 업데이트에서 추가됩니다!\n\nBabylon.js 3D 엔진의 모든 기능을 활용한 게임입니다.');
    }

    showTrends() {
        this.showScreen('trends-screen');
    }

    showControls() {
        this.showScreen('controls-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    saveStats(score, kills, wave) {
        const stats = this.loadStats();
        stats.highScore = Math.max(stats.highScore, score);
        stats.totalKills += kills;
        stats.playTime += Math.round(this.survivalTime / 3600);
        stats.bestWave = Math.max(stats.bestWave, wave);
        localStorage.setItem('spaceDroneWarsStats', JSON.stringify(stats));
        this.updateStatsDisplay();
    }

    loadStats() {
        const defaultStats = { highScore: 0, totalKills: 0, playTime: 0, bestWave: 0 };
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
        document.getElementById('best-wave').textContent = stats.bestWave;
    }

    updateLoadingProgress(percent, text) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');

        if (progressBar) progressBar.style.width = percent + '%';
        if (loadingText) loadingText.textContent = text;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.gameState === 'playing') {
                    this.pause();
                }
            }

            // 카메라 전환
            if (e.key === '1') this.setCameraMode('follow');
            if (e.key === '2') this.setCameraMode('free');
            if (e.key === '3') this.setCameraMode('top');
        });
    }

    setCameraMode(mode) {
        if (!this.camera || this.players.length === 0) return;

        switch (mode) {
            case 'follow':
                this.camera.lockedTarget = this.players[0].mesh;
                this.camera.radius = 30;
                break;
            case 'free':
                this.camera.lockedTarget = null;
                break;
            case 'top':
                this.camera.lockedTarget = this.players[0].mesh;
                this.camera.alpha = 0;
                this.camera.beta = 0.1;
                this.camera.radius = 80;
                break;
        }
    }
}

// ============================================================
// Player3D 클래스
// ============================================================
class Player3D {
    constructor(game, position, playerNumber) {
        this.game = game;
        this.playerNumber = playerNumber;
        this.isPlayer = true;

        this.mesh = game.createDroneMesh('player', playerNumber);
        this.mesh.position = position.clone();

        this.velocity = BABYLON.Vector3.Zero();
        this.rotationVelocity = { y: 0, pitch: 0 };

        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        this.score = 0;
        this.kills = 0;

        this.speed = 30;
        this.rotationSpeed = 2;
        this.shootCooldown = 0;
        this.shootRate = 0.2;
        this.energyRegenRate = 20; // per second
        this.shootEnergyCost = 10;
    }

    update(deltaTime, inputs) {
        // 회전
        if (inputs.left) this.rotationVelocity.y += this.rotationSpeed * deltaTime;
        if (inputs.right) this.rotationVelocity.y -= this.rotationSpeed * deltaTime;

        // 감쇠
        this.rotationVelocity.y *= 0.9;
        this.mesh.rotation.y += this.rotationVelocity.y * deltaTime;

        // 이동
        let movement = BABYLON.Vector3.Zero();

        if (inputs.forward) {
            movement.z = Math.cos(this.mesh.rotation.y) * this.speed;
            movement.x = Math.sin(this.mesh.rotation.y) * this.speed;
        }
        if (inputs.backward) {
            movement.z = -Math.cos(this.mesh.rotation.y) * this.speed * 0.5;
            movement.x = -Math.sin(this.mesh.rotation.y) * this.speed * 0.5;
        }
        if (inputs.up) movement.y = this.speed * 0.7;
        if (inputs.down) movement.y = -this.speed * 0.7;

        this.velocity = movement;
        this.mesh.position.addInPlace(this.velocity.scale(deltaTime));

        // 경계 처리
        this.mesh.position.x = Math.max(-200, Math.min(200, this.mesh.position.x));
        this.mesh.position.y = Math.max(-50, Math.min(50, this.mesh.position.y));
        this.mesh.position.z = Math.max(-200, Math.min(200, this.mesh.position.z));

        // 추진기 파티클
        if (this.mesh.thrusters) {
            const moving = this.velocity.length() > 5;
            this.mesh.thrusters.forEach(t => {
                if (moving) {
                    if (!t.isStarted()) t.start();
                } else {
                    if (t.isStarted()) t.stop();
                }
            });
        }

        // 발사
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        if (inputs.shoot && this.shootCooldown <= 0 && this.energy >= this.shootEnergyCost) {
            this.shoot();
        }

        // 에너지 재생
        this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * deltaTime);
    }

    shoot() {
        const forward = new BABYLON.Vector3(
            Math.sin(this.mesh.rotation.y),
            0,
            Math.cos(this.mesh.rotation.y)
        );

        const spawnPos = this.mesh.position.add(forward.scale(5));
        const projectile = this.game.createProjectile(spawnPos, forward, this);
        this.game.projectiles.push(projectile);

        this.shootCooldown = this.shootRate;
        this.energy -= this.shootEnergyCost;
    }

    dispose() {
        if (this.mesh.thrusters) {
            this.mesh.thrusters.forEach(t => t.dispose());
        }
        this.mesh.dispose();
    }
}

// ============================================================
// Enemy3D 클래스
// ============================================================
class Enemy3D {
    constructor(game, position, difficulty) {
        this.game = game;
        this.difficulty = difficulty;
        this.isPlayer = false;

        this.mesh = game.createDroneMesh('enemy');
        this.mesh.position = position.clone();

        this.health = 50 + difficulty * 20;
        this.maxHealth = this.health;
        this.scoreValue = 100 * difficulty;

        this.speed = 15 + difficulty * 2;
        this.rotationSpeed = 1 + difficulty * 0.2;
        this.shootCooldown = 0;
        this.shootRate = 1 - difficulty * 0.1;
        this.aggroRange = 80;
        this.shootRange = 60;

        this.aiState = 'patrol';
        this.target = null;
        this.patrolTarget = this.getRandomPatrolPoint();
    }

    update(deltaTime, players) {
        this.findTarget(players);
        this.updateAI(deltaTime);

        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
    }

    findTarget(players) {
        if (players.length === 0) return;

        let closest = null;
        let closestDist = Infinity;

        players.forEach(player => {
            const dist = BABYLON.Vector3.Distance(this.mesh.position, player.mesh.position);
            if (dist < closestDist) {
                closestDist = dist;
                closest = player;
            }
        });

        this.target = closest;
    }

    updateAI(deltaTime) {
        if (!this.target) {
            this.patrol(deltaTime);
            return;
        }

        const distToTarget = BABYLON.Vector3.Distance(this.mesh.position, this.target.mesh.position);

        if (distToTarget > this.aggroRange) {
            this.patrol(deltaTime);
        } else if (distToTarget > this.shootRange) {
            this.pursue(deltaTime);
        } else {
            this.combat(deltaTime);
        }
    }

    patrol(deltaTime) {
        const distToPatrol = BABYLON.Vector3.Distance(this.mesh.position, this.patrolTarget);

        if (distToPatrol < 10) {
            this.patrolTarget = this.getRandomPatrolPoint();
        }

        this.moveTowards(this.patrolTarget, deltaTime, 0.5);
    }

    pursue(deltaTime) {
        this.moveTowards(this.target.mesh.position, deltaTime, 1);
    }

    combat(deltaTime) {
        // 거리 유지하며 선회
        const toTarget = this.target.mesh.position.subtract(this.mesh.position);
        const dist = toTarget.length();

        if (dist < this.shootRange * 0.7) {
            // 후퇴
            this.moveTowards(this.mesh.position.subtract(toTarget.normalize().scale(20)), deltaTime, 0.7);
        } else if (dist > this.shootRange * 0.9) {
            // 접근
            this.moveTowards(this.target.mesh.position, deltaTime, 0.7);
        } else {
            // 선회
            const perpendicular = new BABYLON.Vector3(-toTarget.z, 0, toTarget.x).normalize();
            this.moveTowards(this.mesh.position.add(perpendicular.scale(20)), deltaTime, 0.5);
        }

        // 발사
        this.lookAt(this.target.mesh.position);

        if (this.shootCooldown <= 0 && Math.random() < this.difficulty * 0.05) {
            this.shoot();
        }
    }

    moveTowards(target, deltaTime, speedMultiplier = 1) {
        const direction = target.subtract(this.mesh.position).normalize();
        this.mesh.position.addInPlace(direction.scale(this.speed * speedMultiplier * deltaTime));
        this.lookAt(target);
    }

    lookAt(target) {
        const direction = target.subtract(this.mesh.position);
        const targetRotation = Math.atan2(direction.x, direction.z);
        this.mesh.rotation.y = targetRotation;
    }

    shoot() {
        const forward = new BABYLON.Vector3(
            Math.sin(this.mesh.rotation.y),
            0,
            Math.cos(this.mesh.rotation.y)
        );

        const spawnPos = this.mesh.position.add(forward.scale(5));
        const projectile = this.game.createProjectile(spawnPos, forward, this);
        this.game.projectiles.push(projectile);

        this.shootCooldown = this.shootRate;
    }

    getRandomPatrolPoint() {
        return new BABYLON.Vector3(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 150
        );
    }

    dispose() {
        this.mesh.dispose();
    }
}

// ============================================================
// InputManager 클래스
// ============================================================
class InputManager {
    constructor() {
        this.player1 = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            shoot: false
        };

        this.player2 = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            shoot: false
        };

        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        // Player 1
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.player1.forward = true;
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.player1.backward = true;
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.player1.left = true;
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.player1.right = true;
        if (e.key === 'q' || e.key === 'Q') this.player1.up = true;
        if (e.key === 'e' || e.key === 'E') this.player1.down = true;
        if (e.key === ' ') {
            e.preventDefault();
            this.player1.shoot = true;
        }

        // Player 2
        if (e.key === 'i' || e.key === 'I') this.player2.forward = true;
        if (e.key === 'k' || e.key === 'K') this.player2.backward = true;
        if (e.key === 'j' || e.key === 'J') this.player2.left = true;
        if (e.key === 'l' || e.key === 'L') this.player2.right = true;
        if (e.key === 'u' || e.key === 'U') this.player2.up = true;
        if (e.key === 'o' || e.key === 'O') this.player2.down = true;
        if (e.key === 'Enter') {
            e.preventDefault();
            this.player2.shoot = true;
        }
    }

    handleKeyUp(e) {
        // Player 1
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') this.player1.forward = false;
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') this.player1.backward = false;
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.player1.left = false;
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.player1.right = false;
        if (e.key === 'q' || e.key === 'Q') this.player1.up = false;
        if (e.key === 'e' || e.key === 'E') this.player1.down = false;
        if (e.key === ' ') this.player1.shoot = false;

        // Player 2
        if (e.key === 'i' || e.key === 'I') this.player2.forward = false;
        if (e.key === 'k' || e.key === 'K') this.player2.backward = false;
        if (e.key === 'j' || e.key === 'J') this.player2.left = false;
        if (e.key === 'l' || e.key === 'L') this.player2.right = false;
        if (e.key === 'u' || e.key === 'U') this.player2.up = false;
        if (e.key === 'o' || e.key === 'O') this.player2.down = false;
        if (e.key === 'Enter') this.player2.shoot = false;
    }
}

// ============================================================
// 게임 초기화
// ============================================================
const game = new SpaceDroneGame();
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});
