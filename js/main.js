/**
 * Scale Cafe - Main Application
 * Initializes and connects all cafe components
 */

// Font loading detection to prevent flash
function loadFonts() {
    // Check if fonts are already loaded
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            document.body.classList.add('fonts-loaded');
        });
    } else {
        // Fallback for browsers without font loading API
        setTimeout(() => {
            document.body.classList.add('fonts-loaded');
        }, 100);
    }
}

// Load fonts immediately
loadFonts();

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Ensure fonts are shown (fallback)
    document.body.classList.add('fonts-loaded');
    
    // Initialize game components
    const scaleEngine = new ScaleEngine();
    const cafeSystem = new CafeSystem(scaleEngine);
    
    // Make cafeSystem globally accessible for logging control and debugging
    window.cafeSystem = cafeSystem;
    window.soundManager = cafeSystem.soundManager;
    window.debugScales = () => cafeSystem.debugScaleGeneration();
    
    // Initialize MIDI handler (includes keyboard fallback)
    const midiHandler = new MidiHandler();
    
    // Connect MIDI handler to cafe system
    midiHandler.onNoteEvent((noteName, state, velocity) => {
        // Only process note-on events
        if (state === 'on') {
            // Check if we should handle button activation instead of note playing
            if (!cafeSystem.isCooking) {
                // Try to activate buttons with MIDI notes
                const openCafeBtn = document.getElementById('open-cafe-btn');
                if (openCafeBtn && openCafeBtn.offsetParent !== null) {
                    openCafeBtn.click();
                    return;
                }
                
                const continueBtn = document.getElementById('continue-cooking-btn');
                if (continueBtn && !continueBtn.closest('.modal').classList.contains('hidden')) {
                    continueBtn.click();
                    return;
                }
            }
            
            // Handle note playing for cooking
            cafeSystem.handleNotePlayed(noteName);
        }
    });
    
    // Initialize menu settings functionality
    initMenuSettings(cafeSystem);
    
    // Initialize sound toggle
    initSoundToggle(cafeSystem.soundManager);
    
    // Initialize keyboard shortcuts for buttons
    initKeyboardShortcuts(cafeSystem, midiHandler);
    
    // Auto-apply default settings
    setTimeout(() => {
        cafeSystem.setAvailableScales(['major', 'harmonicMinor']); // Coffee and Bakery
        cafeSystem.currentComplexity = 'elite'; // Set default complexity to Complex
        cafeSystem.setAvailableKeys(['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
        cafeSystem.generateInitialOrders(); // Use the special initial method
    }, 100); // Reduced delay to make animation start sooner
});

/**
 * Initialize the menu settings panel functionality
 * @param {CafeSystem} cafeSystem - The cafe system instance
 */
function initMenuSettings(cafeSystem) {
    const dishOptions = document.querySelectorAll('.dish-option');
    const complexityButtons = document.querySelectorAll('.complexity-btn');
    const menuSettingsBtn = document.getElementById('menu-settings-btn');
    const menuPanel = document.getElementById('menu-panel');
    const applyMenuBtn = document.getElementById('apply-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const complexityDescription = document.getElementById('complexity-description');
    
    // Track selected dishes and complexity
    const selectedDishes = new Set(['major', 'harmonicMinor']); // Start with Coffee and Bakery selected
    let selectedComplexity = 'elite'; // Default complexity is Complex
    
    // Define complexity descriptions
    const complexityDescriptions = {
        normal: 'Simple: Single dish (8 notes)',
        elite: 'Complex: Two dishes with voice leading (16 notes)',
        boss: 'Gourmet: Three dishes with voice leading (24 notes)'
    };
    
    // Set initial UI state for default selections
    dishOptions.forEach(option => {
        const scaleType = option.dataset.scale;
        if (selectedDishes.has(scaleType)) {
            option.classList.add('selected');
        }
    });
    
    // Set initial complexity button state
    complexityButtons.forEach(button => {
        if (button.dataset.difficulty === selectedComplexity) {
            button.classList.add('selected');
        }
    });
    

    
    // Set initial complexity description
    if (complexityDescription) {
        complexityDescription.textContent = complexityDescriptions[selectedComplexity];
    }
    
    // Handle dish option selection
    dishOptions.forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
            const scaleType = option.dataset.scale;
            
            if (option.classList.contains('selected')) {
                selectedDishes.add(scaleType);
            } else {
                selectedDishes.delete(scaleType);
            }
        });
    });
    
    // Handle complexity selection
    complexityButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all buttons
            complexityButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            button.classList.add('selected');
            
            // Update selected complexity
            selectedComplexity = button.dataset.difficulty;
            
            // Update description
            if (complexityDescription) {
                complexityDescription.textContent = complexityDescriptions[selectedComplexity];
            }
        });
    });
    

    
    // Menu settings button
    if (menuSettingsBtn && menuPanel) {
        menuSettingsBtn.addEventListener('click', () => {
            menuPanel.classList.toggle('visible');
        });
    }
    
    // Apply menu settings
    applyMenuBtn.addEventListener('click', () => {
        if (selectedDishes.size === 0) {
            alert('Please select at least one dish type!');
            return;
        }
        
        // Configure cafe system with selected dishes and complexity
        cafeSystem.setAvailableScales(Array.from(selectedDishes));
        cafeSystem.currentComplexity = selectedComplexity; // Set the complexity
        // Use all 12 keys
        cafeSystem.setAvailableKeys(['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
        
        // Log menu settings applied
        console.log(`=== MENU SETTINGS APPLIED ===`);
        console.log(`Dishes: ${Array.from(selectedDishes).join(', ')}`);
        console.log(`Complexity: ${selectedComplexity}`);
        
        // Generate new orders with updated settings
        cafeSystem.generateNewOrders();
        
        // Close menu panel
        menuPanel.classList.remove('visible');
    });
    
    // Close menu button
    closeMenuBtn.addEventListener('click', () => {
        menuPanel.classList.remove('visible');
    });
    
    // Close menu when clicking outside
    menuPanel.addEventListener('click', (e) => {
        if (e.target === menuPanel) {
            menuPanel.classList.remove('visible');
        }
    });
}

/**
 * Initialize sound toggle functionality
 * @param {SoundManager} soundManager - The sound manager instance
 */
function initSoundToggle(soundManager) {
    const soundToggle = document.getElementById('sound-toggle');
    
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const isEnabled = soundManager.isEnabled();
            soundManager.setEnabled(!isEnabled);
            
            // Update visual indicator
            if (soundManager.isEnabled()) {
                soundToggle.style.color = '#32CD32'; // Green for enabled
                soundToggle.title = 'Sound enabled - Click to disable';
            } else {
                soundToggle.style.color = '#FF6347'; // Red for disabled
                soundToggle.title = 'Sound disabled - Click to enable';
            }
        });
        
        // Set initial tooltip
        soundToggle.title = 'Sound enabled - Click to disable';
    }
}

/**
 * Initialize keyboard shortcuts for buttons
 * @param {CafeSystem} cafeSystem - The cafe system instance
 * @param {MidiHandler} midiHandler - The MIDI handler instance
 */
function initKeyboardShortcuts(cafeSystem, midiHandler) {
    let spacePressed = false;
    
    // Listen for keyboard events
    document.addEventListener('keydown', (event) => {
        // Ignore repeat events
        if (event.repeat) return;
        
        // Handle spacebar for buttons
        if (event.code === 'Space') {
            event.preventDefault(); // Prevent page scroll
            spacePressed = true;
            handleButtonActivation();
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (event.code === 'Space') {
            spacePressed = false;
        }
    });
    
    function handleButtonActivation() {
        // Check for "Open Cafe" button
        const openCafeBtn = document.getElementById('open-cafe-btn');
        if (openCafeBtn && openCafeBtn.offsetParent !== null) { // Check if visible
            openCafeBtn.click();
            return;
        }
        
        // Check for "Continue Cooking" button
        const continueBtn = document.getElementById('continue-cooking-btn');
        if (continueBtn && !continueBtn.closest('.modal').classList.contains('hidden')) {
            continueBtn.click();
            return;
        }
    }
}

// Keyboard instructions are now directly in the HTML
