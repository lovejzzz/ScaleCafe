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
        cafeSystem.setAvailableScales(['major']); // Only Coffee Menu
        cafeSystem.currentComplexity = 'simple'; // Set default complexity to Simple
        cafeSystem.currentServingStyle = 'quarter'; // Set default serving style to Quarter
        cafeSystem.setAvailableKeys(['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
        
        // Initialize note slots based on current serving style before generating orders
        cafeSystem.generateNoteSlots();
        
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
    
    // Track selected dishes, complexity, and serving style
    const selectedDishes = new Set(['major']); // Start with only Coffee Menu selected
    let selectedComplexity = 'simple'; // Default complexity is Simple
    let selectedServingStyle = 'quarter'; // Default serving style is Quarter
    
    // Define complexity descriptions with multipliers
    const complexityDescriptions = {
        simple: {
            quarter: 'Simple: Single dish (4 notes) - 1.0× multiplier',
            '8th': 'Simple: Single dish (8 notes) - 1.0× multiplier',
            triplet: 'Simple: Single dish (12 notes) - 1.0× multiplier'
        },
        complex: {
            quarter: 'Complex: Two dishes with voice leading (8 notes) - 2.0× multiplier',
            '8th': 'Complex: Two dishes with voice leading (16 notes) - 2.0× multiplier',
            triplet: 'Complex: Two dishes with voice leading (24 notes) - 2.0× multiplier'
        },
        gourmet: {
            quarter: 'Gourmet: Three dishes with voice leading (12 notes) - 3.0× multiplier',
            '8th': 'Gourmet: Three dishes with voice leading (24 notes) - 3.0× multiplier',
            triplet: 'Gourmet: Three dishes with voice leading (36 notes) - 3.0× multiplier'
        }
    };
    
    // Define serving style descriptions with multipliers
    const servingStyleDescriptions = {
        quarter: 'Quarter: Four notes per scale - 1.0× multiplier',
        '8th': '8th: Eight notes per scale - 1.5× multiplier',
        triplet: 'Triplet: Twelve notes per scale - 2.0× multiplier'
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
    

    
    // Get serving style buttons and description element
    const servingStyleButtons = document.querySelectorAll('.serving-style-btn');
    const servingStyleDescription = document.getElementById('serving-style-description');
    
    // Set initial complexity description
    if (complexityDescription) {
        complexityDescription.textContent = complexityDescriptions[selectedComplexity][selectedServingStyle];
    }
    
    // Set initial serving style description
    if (servingStyleDescription) {
        servingStyleDescription.textContent = servingStyleDescriptions[selectedServingStyle];
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
                complexityDescription.textContent = complexityDescriptions[selectedComplexity][selectedServingStyle];
            }
        });
    });
    
    // Handle serving style selection
    servingStyleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all buttons
            servingStyleButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            button.classList.add('selected');
            
            // Update selected serving style
            selectedServingStyle = button.dataset.servingStyle;
            
            // Update serving style description
            if (servingStyleDescription) {
                servingStyleDescription.textContent = servingStyleDescriptions[selectedServingStyle];
            }
            
            // Update complexity description to reflect new serving style
            if (complexityDescription) {
                complexityDescription.textContent = complexityDescriptions[selectedComplexity][selectedServingStyle];
            }
        });
    });
    
    // Add hover event listeners for dynamic tooltip updates
    // Complexity buttons hover handlers
    complexityButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const hoveredComplexity = button.dataset.difficulty;
            if (complexityDescription) {
                complexityDescription.textContent = complexityDescriptions[hoveredComplexity][selectedServingStyle];
            }
        });
        
        button.addEventListener('mouseleave', () => {
            // Restore the description for the currently selected complexity
            if (complexityDescription) {
                complexityDescription.textContent = complexityDescriptions[selectedComplexity][selectedServingStyle];
            }
        });
    });
    
    // Serving style buttons hover handlers
    servingStyleButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const hoveredServingStyle = button.dataset.servingStyle;
            if (servingStyleDescription) {
                servingStyleDescription.textContent = servingStyleDescriptions[hoveredServingStyle];
            }
            // Also update complexity description to show how it would look with this serving style
            if (complexityDescription) {
                complexityDescription.textContent = complexityDescriptions[selectedComplexity][hoveredServingStyle];
            }
        });
        
        button.addEventListener('mouseleave', () => {
            // Restore the descriptions for the currently selected options
            if (servingStyleDescription) {
                servingStyleDescription.textContent = servingStyleDescriptions[selectedServingStyle];
            }
            if (complexityDescription) {
                complexityDescription.textContent = complexityDescriptions[selectedComplexity][selectedServingStyle];
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
        
        // Configure cafe system with selected dishes, complexity, and serving style
        cafeSystem.setAvailableScales(Array.from(selectedDishes));
        cafeSystem.currentComplexity = selectedComplexity; // Set the complexity
        cafeSystem.currentServingStyle = selectedServingStyle; // Set the serving style
        // Use all 12 keys
        cafeSystem.setAvailableKeys(['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
        
        // Log menu settings applied
        console.log(`=== MENU SETTINGS APPLIED ===`);
        console.log(`Dishes: ${Array.from(selectedDishes).join(', ')}`);
        console.log(`Complexity: ${selectedComplexity}`);
        console.log(`Serving Style: ${selectedServingStyle}`);
        
        // Generate new orders with updated settings
        cafeSystem.generateNewOrders();
        
        // Close menu panel
        menuPanel.classList.remove('visible');
        
        // Automatically select the first order after a short delay
        // This gives time for the orders to be rendered
        setTimeout(() => {
            if (cafeSystem.availableOrders.length > 0) {
                cafeSystem.selectOrder(cafeSystem.availableOrders[0]);
                cafeSystem.startCooking();
            }
        }, 300);
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
