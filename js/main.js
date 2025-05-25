/**
 * Scale Cafe - Main Application
 * Initializes and connects all cafe components
 */

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize game components
    const scaleEngine = new ScaleEngine();
    const cafeSystem = new CafeSystem(scaleEngine);
    
    // Make cafeSystem globally accessible for logging control and debugging
    window.cafeSystem = cafeSystem;
    window.debugScales = () => cafeSystem.debugScaleGeneration();
    
    // Initialize MIDI handler (includes keyboard fallback)
    const midiHandler = new MidiHandler();
    
    // Connect MIDI handler to cafe system
    midiHandler.onNoteEvent((noteName, state, velocity) => {
        // Only process note-on events
        if (state === 'on') {
            cafeSystem.handleNotePlayed(noteName);
        }
    });
    
    // Initialize menu settings functionality
    initMenuSettings(cafeSystem);
    
    // Auto-apply default settings
    setTimeout(() => {
        cafeSystem.setAvailableScales(['major', 'harmonicMinor']); // Coffee and Bakery
        cafeSystem.currentComplexity = 'elite'; // Set default complexity to Complex
        cafeSystem.setAvailableKeys(['C', 'G', 'D', 'A', 'E', 'B', 'F#']);
        cafeSystem.generateNewOrders();
    }, 500);
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
        cafeSystem.setAvailableKeys(['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
        
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

// Keyboard instructions are now directly in the HTML
