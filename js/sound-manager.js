/**
 * Sound Manager for Scale Cafe
 * Handles all sound effects and audio feedback
 */

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.7;
        
        // Initialize sound files
        this.loadSounds();
    }
    
    /**
     * Load all sound files
     */
    loadSounds() {
        const soundFiles = {
            openCafe: 'sound/OpenCafe.mp3',
            preparingOrder: 'sound/PreparingOrder.mp3',
            takeOrder: 'sound/TakeOrder.mp3',
            orderSlideIn: 'sound/OrderSlideIn.mp3',
            earnMoney: 'sound/EarnMoney.wav'
        };
        
        // Load each sound file
        Object.keys(soundFiles).forEach(key => {
            this.sounds[key] = new Audio(soundFiles[key]);
            this.sounds[key].volume = this.volume;
            
            // Preload the audio
            this.sounds[key].preload = 'auto';
            
            // Handle loading errors gracefully
            this.sounds[key].addEventListener('error', (e) => {
                console.warn(`Failed to load sound: ${soundFiles[key]}`);
            });
        });
    }
    
    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound to play
     * @param {number} volume - Optional volume override (0-1)
     */
    play(soundName, volume = null) {
        if (!this.enabled || !this.sounds[soundName]) {
            return;
        }
        
        try {
            const sound = this.sounds[soundName];
            
            // Reset to beginning if already playing
            sound.currentTime = 0;
            
            // Set volume if specified
            if (volume !== null) {
                sound.volume = Math.max(0, Math.min(1, volume));
            }
            
            // Play the sound
            const playPromise = sound.play();
            
            // Handle play promise for browsers that require user interaction
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Could not play sound ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }
    
    /**
     * Stop a currently playing sound
     * @param {string} soundName - Name of the sound to stop
     */
    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    }
    
    /**
     * Set the master volume for all sounds
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all loaded sounds
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }
    
    /**
     * Enable or disable all sounds
     * @param {boolean} enabled - Whether sounds should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        // Stop all currently playing sounds if disabling
        if (!enabled) {
            Object.keys(this.sounds).forEach(soundName => {
                this.stop(soundName);
            });
        }
    }
    
    /**
     * Check if sounds are enabled
     * @returns {boolean} Whether sounds are enabled
     */
    isEnabled() {
        return this.enabled;
    }
} 