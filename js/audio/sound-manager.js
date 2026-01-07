/**
 * Surround Sound Manager
 * Uses Web Audio API for 3D positional audio
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.listener = null;
        this.sounds = {};
        this.activeSounds = [];
        this.enabled = true;
        this.initialized = false;

        // Sound library (procedurally generated)
        this.soundBuffers = {};
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    async init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.listener = this.audioContext.listener;

            // Master gain for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.audioContext.destination);

            // Set listener position
            if (this.listener.positionX) {
                this.listener.positionX.value = 0;
                this.listener.positionY.value = 0;
                this.listener.positionZ.value = 0;
            } else {
                this.listener.setPosition(0, 0, 0);
            }

            // Generate sound effects
            await this.generateSounds();

            this.initialized = true;
            console.log('Sound system initialized');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    /**
     * Generate procedural sound effects
     */
    async generateSounds() {
        this.soundBuffers.punch = this.generatePunchSound();
        this.soundBuffers.hit = this.generateHitSound();
        this.soundBuffers.explosion = this.generateExplosionSound();
        this.soundBuffers.laser = this.generateLaserSound();
        this.soundBuffers.jump = this.generateJumpSound();
        this.soundBuffers.footstep = this.generateFootstepSound();
        this.soundBuffers.powerup = this.generatePowerUpSound();
        this.soundBuffers.damage = this.generateDamageSound();
        this.soundBuffers.shield = this.generateShieldSound();
        this.soundBuffers.charge = this.generateChargeSound();
    }

    /**
     * Generate punch sound effect
     */
    generatePunchSound() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // White noise with envelope
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 30);
            // Low frequency thump
            const thump = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 20);
            data[i] = (noise * 0.3 + thump * 0.7) * 0.5;
        }

        return buffer;
    }

    /**
     * Generate hit impact sound
     */
    generateHitSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 25);
            const impact = Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 15);
            const crack = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 40);
            data[i] = (noise * 0.2 + impact * 0.5 + crack * 0.3) * 0.6;
        }

        return buffer;
    }

    /**
     * Generate explosion sound
     */
    generateExplosionSound() {
        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 5);
            const boom = Math.sin(2 * Math.PI * 40 * t) * Math.exp(-t * 3);
            const rumble = Math.sin(2 * Math.PI * 20 * t) * Math.exp(-t * 2);
            data[i] = (noise * 0.3 + boom * 0.5 + rumble * 0.2) * 0.8;
        }

        return buffer;
    }

    /**
     * Generate laser sound
     */
    generateLaserSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 1000 - t * 800; // Descending pitch
            const laser = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 8);
            const noise = (Math.random() * 2 - 1) * 0.1 * Math.exp(-t * 10);
            data[i] = (laser * 0.8 + noise * 0.2) * 0.5;
        }

        return buffer;
    }

    /**
     * Generate jump sound
     */
    generateJumpSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 200 + t * 400; // Ascending pitch
            const jump = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 12);
            data[i] = jump * 0.4;
        }

        return buffer;
    }

    /**
     * Generate footstep sound
     */
    generateFootstepSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 50);
            const thud = Math.sin(2 * Math.PI * 100 * t) * Math.exp(-t * 30);
            data[i] = (noise * 0.4 + thud * 0.6) * 0.3;
        }

        return buffer;
    }

    /**
     * Generate power-up sound
     */
    generatePowerUpSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 400 + t * 800;
            const powerup = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 5);
            data[i] = powerup * 0.5;
        }

        return buffer;
    }

    /**
     * Generate damage sound
     */
    generateDamageSound() {
        const duration = 0.25;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 600 - t * 300;
            const damage = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 18);
            const noise = (Math.random() * 2 - 1) * 0.2 * Math.exp(-t * 20);
            data[i] = (damage * 0.7 + noise * 0.3) * 0.6;
        }

        return buffer;
    }

    /**
     * Generate shield sound
     */
    generateShieldSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const shield = Math.sin(2 * Math.PI * 1200 * t + Math.sin(2 * Math.PI * 5 * t) * 2);
            data[i] = shield * Math.exp(-t * 10) * 0.4;
        }

        return buffer;
    }

    /**
     * Generate charge sound
     */
    generateChargeSound() {
        const duration = 1.0;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const freq = 200 + t * 600;
            const charge = Math.sin(2 * Math.PI * freq * t) * (t / duration);
            data[i] = charge * 0.5;
        }

        return buffer;
    }

    /**
     * Play sound at 3D position
     */
    playSound(soundName, x, y, volume = 1.0, pitch = 1.0) {
        if (!this.initialized || !this.enabled) return null;

        const buffer = this.soundBuffers[soundName];
        if (!buffer) {
            console.warn(`Sound ${soundName} not found`);
            return null;
        }

        try {
            // Create source
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.playbackRate.value = pitch;

            // Create panner for 3D audio
            const panner = this.audioContext.createPanner();
            panner.panningModel = 'HRTF'; // Head-related transfer function for realistic 3D
            panner.distanceModel = 'inverse';
            panner.refDistance = 100;
            panner.maxDistance = 1000;
            panner.rolloffFactor = 1;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;

            // Set position
            if (panner.positionX) {
                panner.positionX.value = x;
                panner.positionY.value = y;
                panner.positionZ.value = 0;
            } else {
                panner.setPosition(x, y, 0);
            }

            // Create gain node for volume
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;

            // Connect: source -> panner -> gain -> master -> destination
            source.connect(panner);
            panner.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Play
            source.start(0);

            // Store active sound
            const sound = { source, panner, gainNode, x, y };
            this.activeSounds.push(sound);

            // Auto-cleanup
            source.onended = () => {
                const index = this.activeSounds.indexOf(sound);
                if (index > -1) {
                    this.activeSounds.splice(index, 1);
                }
            };

            return sound;
        } catch (error) {
            console.error('Error playing sound:', error);
            return null;
        }
    }

    /**
     * Update listener position (camera/player position)
     */
    updateListener(x, y, z = 0) {
        if (!this.initialized) return;

        if (this.listener.positionX) {
            this.listener.positionX.value = x;
            this.listener.positionY.value = y;
            this.listener.positionZ.value = z;
        } else {
            this.listener.setPosition(x, y, z);
        }
    }

    /**
     * Play sound effect shortcuts
     */
    playPunch(x, y, intensity = 1.0) {
        return this.playSound('punch', x, y, 0.7 * intensity, 0.9 + Math.random() * 0.2);
    }

    playHit(x, y, intensity = 1.0) {
        return this.playSound('hit', x, y, 0.8 * intensity, 0.95 + Math.random() * 0.1);
    }

    playExplosion(x, y, intensity = 1.0) {
        return this.playSound('explosion', x, y, 1.0 * intensity, 0.9 + Math.random() * 0.2);
    }

    playLaser(x, y) {
        return this.playSound('laser', x, y, 0.6, 0.95 + Math.random() * 0.1);
    }

    playJump(x, y) {
        return this.playSound('jump', x, y, 0.4, 1.0 + Math.random() * 0.1);
    }

    playFootstep(x, y) {
        return this.playSound('footstep', x, y, 0.3, 0.9 + Math.random() * 0.2);
    }

    playPowerUp(x, y) {
        return this.playSound('powerup', x, y, 0.7);
    }

    playDamage(x, y, intensity = 1.0) {
        return this.playSound('damage', x, y, 0.8 * intensity, 0.9 + Math.random() * 0.2);
    }

    playShield(x, y) {
        return this.playSound('shield', x, y, 0.5);
    }

    playCharge(x, y) {
        return this.playSound('charge', x, y, 0.6);
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        this.activeSounds.forEach(sound => {
            try {
                sound.source.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.activeSounds = [];
    }
}
