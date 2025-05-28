/**
 * Scale Cafe - Cafe System
 * Handles order management, cooking mechanics, and note validation
 * Based on the original battle system but themed for a cafe
 */

class CafeSystem {
    constructor(scaleEngine) {
        this.scaleEngine = scaleEngine;
        this.soundManager = new SoundManager();
        this.currentSequence = [];
        this.currentPosition = 0;
        this.isCooking = false;
        this.isInitialLoad = true; // Track if this is the first time loading orders
        this.cafeOpened = false; // Track if cafe has been opened
        this.mistakeCount = 0; // Track mistakes for perfect bonus
        
        // Player stats
        this.playerXP = 0;
        this.playerCoins = 0;
        
        // Load saved progress
        this.loadProgress();
        
        // Order complexity settings (same as battle difficulty)
        this.complexityLevels = {
            simple: { dishes: 1, notesPerDish: 8, xpMultiplier: 1, coinMultiplier: 1.0 },
            complex: { dishes: 2, notesPerDish: 8, xpMultiplier: 2, coinMultiplier: 2.0 },
            gourmet: { dishes: 3, notesPerDish: 8, xpMultiplier: 3, coinMultiplier: 3.0 }
        };
        this.currentComplexity = 'simple';
        
        // Serving style settings (quarter, 8th, triplet)
        this.servingStyles = {
            quarter: { notesPerScale: 4, multiplier: 1.0 },
            '8th': { notesPerScale: 8, multiplier: 1.5 },
            triplet: { notesPerScale: 12, multiplier: 2.0 }
        };
        this.currentServingStyle = 'quarter';
        
        // Current order data
        this.currentOrder = {
            customerName: '',
            complexity: 'simple',
            dishes: []
        };
        
        // Available orders
        this.availableOrders = [];
        
        // Dish names and prices from the Scale-Enharmonic.md file
        this.dishNames = {
            major: {
                'C': 'Latte', 'Db': 'Espresso', 'D': 'Cappuccino', 'Eb': 'Mocha',
                'E': 'Brew', 'F': 'Americano', 'F#': 'Macchiato', 'G': 'Flatwhite',
                'Ab': 'Cortado', 'A': 'Pour-over', 'Bb': 'Nitro', 'B': 'Affogato',
                // Enharmonic equivalents for compatibility
                'C#': 'Espresso', 'D#': 'Mocha', 'Gb': 'Macchiato', 'G#': 'Cortado', 'A#': 'Nitro'
            },
            harmonicMinor: {
                'C': 'Croissant', 'Db': 'Bagel', 'D': 'Scone', 'Eb': 'Muffin',
                'E': 'Danish', 'F': 'Biscuit', 'F#': 'Tart', 'G': 'Brioche',
                'Ab': 'Strudel', 'A': 'Roll', 'Bb': 'Breadstick', 'B': 'Pastry',
                // Enharmonic equivalents for compatibility
                'C#': 'Bagel', 'D#': 'Muffin', 'Gb': 'Tart', 'G#': 'Strudel', 'A#': 'Breadstick'
            },
            melodicMinor: {
                'C': 'Popcorn', 'Db': 'Pretzel', 'D': 'Biscotti', 'Eb': 'Cookie',
                'E': 'Trailmix', 'F': 'Granola', 'F#': 'Brownie', 'G': 'Cracker',
                'Ab': 'Muffin', 'A': 'Churro', 'Bb': 'Donut', 'B': 'Macaron',
                // Enharmonic equivalents for compatibility
                'C#': 'Pretzel', 'D#': 'Cookie', 'Gb': 'Brownie', 'G#': 'Muffin', 'A#': 'Donut'
            }
        };
        
        // Dish prices from the Scale-Enharmonic.md file
        this.dishPrices = {
            major: {
                'C': 4.25, 'Db': 3.00, 'D': 4.00, 'Eb': 4.50,
                'E': 3.00, 'F': 3.25, 'F#': 3.50, 'G': 4.00,
                'Ab': 3.50, 'A': 3.50, 'Bb': 4.25, 'B': 4.00,
                // Enharmonic equivalents for compatibility
                'C#': 3.00, 'D#': 4.50, 'Gb': 3.50, 'G#': 3.50, 'A#': 4.25
            },
            harmonicMinor: {
                'C': 3.50, 'Db': 2.75, 'D': 3.25, 'Eb': 3.50,
                'E': 4.00, 'F': 2.50, 'F#': 3.75, 'G': 3.25,
                'Ab': 3.75, 'A': 2.50, 'Bb': 2.50, 'B': 3.25,
                // Enharmonic equivalents for compatibility
                'C#': 2.75, 'D#': 3.50, 'Gb': 3.75, 'G#': 3.75, 'A#': 2.50
            },
            melodicMinor: {
                'C': 2.00, 'Db': 1.75, 'D': 2.00, 'Eb': 2.00,
                'E': 2.50, 'F': 2.50, 'F#': 3.00, 'G': 1.75,
                'Ab': 3.25, 'A': 2.50, 'Bb': 2.00, 'B': 2.50,
                // Enharmonic equivalents for compatibility
                'C#': 1.75, 'D#': 2.00, 'Gb': 3.00, 'G#': 3.25, 'A#': 2.00
            }
        };
        
        // DOM elements
        this.orderTicketsContainer = document.getElementById('order-tickets');
        this.currentOrderElement = document.getElementById('current-order');
        this.noteSlots = document.querySelectorAll('.note-slot');
        this.cookingStatus = document.getElementById('cooking-status');
        this.progressFill = document.getElementById('progress-fill');
        this.orderCompleteModal = document.getElementById('order-complete-modal');
        this.continueButton = document.getElementById('continue-cooking-btn');
        this.xpRewardElement = document.getElementById('xp-reward');
        this.sellRewardElement = document.getElementById('sell-reward');
        this.tipRewardElement = document.getElementById('tip-reward');
        this.playerXPElement = document.getElementById('player-xp');
        this.playerCoinsElement = document.getElementById('player-coins');
        this.newOrderBtn = document.getElementById('new-order-btn');
        
        // Bind event handlers
        this.continueButton.addEventListener('click', () => this.finishOrder());
        
        // Make the Order Board title clickable to refresh orders
        const refreshOrdersBtn = document.getElementById('refresh-orders');
        if (refreshOrdersBtn) {
            // Initially hide the refresh functionality
            refreshOrdersBtn.classList.add('non-clickable');
            refreshOrdersBtn.style.cursor = 'default';
            // Remove the clickable-title class initially
            refreshOrdersBtn.classList.remove('clickable-title');
            
            refreshOrdersBtn.addEventListener('click', () => {
                // Only allow refresh if cafe is opened
                if (this.cafeOpened) {
                    this.isInitialLoad = false; // Ensure no initial animation on manual refresh
                    this.generateNewOrders();
                }
            });
        }
        
        // Initialize player stats display
        this.updatePlayerStats();
        
        // Don't generate initial orders here - let main.js handle it
    }
    
    /**
     * Set available scale types for orders
     */
    setAvailableScales(scales) {
        this.availableScales = scales.length > 0 ? scales : ['major', 'harmonicMinor', 'melodicMinor'];
    }
    
    /**
     * Set available keys for orders
     */
    setAvailableKeys(keys) {
        this.availableKeys = keys.length > 0 ? keys : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    }
    
    /**
     * Generate new random orders
     */
    generateNewOrders() {
        this.availableOrders = [];
        
        // Use available scales and keys or defaults if not set
        if (!this.availableScales) {
            this.setAvailableScales(['major', 'harmonicMinor']); // Default to Coffee and Bakery
        }
        
        if (!this.availableKeys) {
            this.setAvailableKeys(['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']);
        }
        
        // Always generate exactly 4 orders
        const numOrders = 4;
        
        for (let i = 0; i < numOrders; i++) {
            const order = this.generateRandomOrder();
            this.availableOrders.push(order);
        }
        
        this.displayOrders();
    }
    
    /**
     * Generate initial orders with animation (called from main.js)
     */
    generateInitialOrders() {
        console.log('=== SETTING UP CAFE OPENING ===');
        this.isInitialLoad = true; // Ensure this is set to true
        this.cafeOpened = false; // Reset cafe opened state
        
        // Body should already have cafe-closed class from HTML, just ensure others are removed
        document.body.classList.remove('cafe-opened', 'cafe-opening', 'cooking-station-appearing');
        
        this.generateNewOrders(); // This will show the "Open the Cafe" button
    }
    
    /**
     * Generate a single random order
     */
    generateRandomOrder() {
        // Use current complexity setting from menu
        const complexities = ['simple', 'complex', 'gourmet'];
        const complexity = this.currentComplexity || 'complex';
        const complexitySettings = this.complexityLevels[complexity];
        
        // Use current serving style setting from menu
        const servingStyle = this.currentServingStyle || 'quarter';
        const servingStyleSettings = this.servingStyles[servingStyle];
        
        const customerNames = [
            'Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Avery', 'Quinn',
            'Taylor', 'Jamie', 'Sage', 'River', 'Skylar', 'Rowan', 'Phoenix'
        ];
        
        const honorifics = [
            'Mr.', 'Ms.', 'Mrs.', 'Miss', 'Dr.', 'Prof.'
        ];
        
        // Randomly select a name and honorific
        const randomName = customerNames[Math.floor(Math.random() * customerNames.length)];
        const randomHonorific = honorifics[Math.floor(Math.random() * honorifics.length)];
        
        const order = {
            id: Date.now() + Math.random(),
            customerName: `${randomHonorific} ${randomName}`,
            complexity: complexity,
            servingStyle: servingStyle,  // Add serving style to the order
            dishes: [],
            totalSell: 0 // Will be calculated after dishes are added
        };
        
        // Randomly choose direction for each order
        const directions = ['ascending', 'descending'];
        const orderDirection = directions[Math.floor(Math.random() * directions.length)];
        
        // Store the direction to ensure all dishes use the same direction
        order.direction = orderDirection;
        
        // Track used scale/key combinations to avoid duplicates
        const usedCombinations = new Set();
        let previousEndNote = null;
        
        for (let i = 0; i < complexitySettings.dishes; i++) {
            let randomScaleType, randomKey, combination;
            let attempts = 0;
            
            // Try to find a unique combination
            do {
                randomScaleType = this.availableScales[Math.floor(Math.random() * this.availableScales.length)];
                randomKey = this.availableKeys[Math.floor(Math.random() * this.availableKeys.length)];
                combination = `${randomScaleType}-${randomKey}`;
                attempts++;
                
                // If we can't find a unique combination after many attempts, allow duplicates
                if (attempts > 50) break;
            } while (usedCombinations.has(combination));
            
            usedCombinations.add(combination);
            
            // Generate the correct scale for this key and type
            const correctScale = this.generateCorrectScale(randomScaleType, randomKey);
            
            // Determine start note
            let startNote;
            if (i === 0 || !previousEndNote) {
                // For first scale, pick a random note from the scale (excluding the last note to avoid immediate octave)
                const validStartNotes = correctScale.slice(0, -1); // Remove last note (octave)
                startNote = validStartNotes[Math.floor(Math.random() * validStartNotes.length)];
            } else {
                // Apply simple voice leading for subsequent scales
                startNote = this.findVoiceLeadingNote(previousEndNote, correctScale, orderDirection);
            }
            
            // Generate the sequence starting from the chosen note based on serving style
            const sequence = this.generateSequenceFromStartNote(correctScale, startNote, orderDirection, order.servingStyle);
            
            const dishPrice = this.getDishPrice(randomScaleType, randomKey);
            const dish = {
                name: this.getDishName(randomScaleType, randomKey),
                scaleType: randomScaleType,
                key: randomKey,
                startNote: startNote,
                direction: orderDirection,
                sequence: sequence,
                price: dishPrice
            };
            
            order.dishes.push(dish);
            
            // Set previous end note for voice leading
            if (sequence && sequence.length > 0) {
                previousEndNote = sequence[sequence.length - 1];
            }
        }
        
        // Calculate base price based on the new economy system
        let basePrice = 0;
        if (order.dishes.length === 1) {
            // Simple: Use the dish's price
            basePrice = order.dishes[0].price;
        } else {
            // Complex/Gourmet: Average the prices of the selected dishes
            const totalDishPrice = order.dishes.reduce((sum, dish) => sum + dish.price, 0);
            basePrice = totalDishPrice / order.dishes.length;
        }
        
        // Apply multipliers
        const complexityMultiplier = this.complexityLevels[order.complexity].coinMultiplier;
        const servingStyleMultiplier = this.servingStyles[order.servingStyle].multiplier;
        
        // Calculate the base reward
        const baseReward = basePrice * complexityMultiplier * servingStyleMultiplier;
        
        // Set the total sell amount (rounded to 2 decimal places)
        order.basePrice = parseFloat(basePrice.toFixed(2));
        order.totalSell = parseFloat(baseReward.toFixed(2));
        
        return order;
    }
    
    /**
     * Generate the correct scale for a given type and key
     * @param {string} scaleType - The scale type
     * @param {string} key - The key
     * @returns {Array} Array of notes in the scale
     */
    generateCorrectScale(scaleType, key) {
        // Use the exact scales from Scale-Enharmonic.md with proper enharmonic spelling
        const scales = {
            major: {
                'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
                'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'Db'],
                'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#', 'D'],
                'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D', 'Eb'],
                'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#', 'E'],
                'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E', 'F'],
                'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F', 'F#'],
                'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G'],
                'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G', 'Ab'],
                'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#', 'A'],
                'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'],
                'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#', 'B'],
                // Enharmonic equivalents for compatibility
                'C#': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'Db'], // Use Db Major
                'D#': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D', 'Eb'], // Use Eb Major
                'Gb': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F', 'F#'], // Use F# Major
                'G#': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G', 'Ab'], // Use Ab Major
                'A#': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A', 'Bb']  // Use Bb Major
            },
            harmonicMinor: {
                'C': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B', 'C'],
                'Db': ['Db', 'Eb', 'E', 'Gb', 'Ab', 'A', 'C', 'Db'],
                'D': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C#', 'D'],
                'Eb': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'B', 'D', 'Eb'],
                'E': ['E', 'F#', 'G', 'A', 'B', 'C', 'D#', 'E'],
                'F': ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'E', 'F'],
                'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'F', 'F#'],
                'G': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F#', 'G'],
                'Ab': ['Ab', 'Bb', 'B', 'Db', 'Eb', 'E', 'G', 'Ab'],
                'A': ['A', 'B', 'C', 'D', 'E', 'F', 'G#', 'A'],
                'Bb': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'A', 'Bb'],
                'B': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A#', 'B'],
                // Enharmonic equivalents for compatibility
                'C#': ['Db', 'Eb', 'E', 'Gb', 'Ab', 'A', 'C', 'Db'], // Use Db Harmonic Minor
                'D#': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'B', 'D', 'Eb'], // Use Eb Harmonic Minor
                'Gb': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'F', 'F#'], // Use F# Harmonic Minor
                'G#': ['Ab', 'Bb', 'B', 'Db', 'Eb', 'E', 'G', 'Ab'], // Use Ab Harmonic Minor
                'A#': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'A', 'Bb']  // Use Bb Harmonic Minor
            },
            melodicMinor: {
                'C': ['C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C'],
                'Db': ['Db', 'Eb', 'E', 'Gb', 'Ab', 'Bb', 'C', 'Db'],
                'D': ['D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D'],
                'Eb': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D', 'Eb'],
                'E': ['E', 'F#', 'G', 'A', 'B', 'C#', 'D#', 'E'],
                'F': ['F', 'G', 'Ab', 'Bb', 'C', 'D', 'E', 'F'],
                'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D#', 'F', 'F#'],
                'G': ['G', 'A', 'Bb', 'C', 'D', 'E', 'F#', 'G'],
                'Ab': ['Ab', 'Bb', 'B', 'Db', 'Eb', 'F', 'G', 'Ab'],
                'A': ['A', 'B', 'C', 'D', 'E', 'F#', 'G#', 'A'],
                'Bb': ['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A', 'Bb'],
                'B': ['B', 'C#', 'D', 'E', 'F#', 'G#', 'A#', 'B'],
                // Enharmonic equivalents for compatibility
                'C#': ['Db', 'Eb', 'E', 'Gb', 'Ab', 'Bb', 'C', 'Db'], // Use Db Melodic Minor
                'D#': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D', 'Eb'], // Use Eb Melodic Minor
                'Gb': ['F#', 'G#', 'A', 'B', 'C#', 'D#', 'F', 'F#'], // Use F# Melodic Minor
                'G#': ['Ab', 'Bb', 'B', 'Db', 'Eb', 'F', 'G', 'Ab'], // Use Ab Melodic Minor
                'A#': ['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A', 'Bb']  // Use Bb Melodic Minor
            }
        };
        
        // Get the scale from our predefined scales
        if (scales[scaleType] && scales[scaleType][key]) {
            return [...scales[scaleType][key]]; // Return a copy
        }
        
        // Fallback: generate using formula if not in predefined scales
        console.warn(`Scale ${key} ${scaleType} not found in predefined scales, using formula fallback`);
        return this.generateScaleFromFormula(scaleType, key);
    }
    
    /**
     * Fallback method to generate scale using formula
     * @param {string} scaleType - The scale type
     * @param {string} key - The key
     * @returns {Array} Array of notes in the scale
     */
    generateScaleFromFormula(scaleType, key) {
        // Define scale formulas (semitone intervals from root)
        const formulas = {
            major: [0, 2, 4, 5, 7, 9, 11, 12],
            harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],
            melodicMinor: [0, 2, 3, 5, 7, 9, 11, 12]
        };
        
        const formula = formulas[scaleType];
        if (!formula) {
            console.error(`Unknown scale type: ${scaleType}`);
            return ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']; // Fallback to C major
        }
        
        const keyIndex = this.scaleEngine.getNoteIndex(key);
        if (keyIndex === -1) {
            console.error(`Unknown key: ${key}`);
            return ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']; // Fallback to C major
        }
        
        // Generate the scale using the formula
        const scale = [];
        for (let i = 0; i < formula.length; i++) {
            const noteIndex = (keyIndex + formula[i]) % 12;
            let noteName = this.scaleEngine.allNotes[noteIndex];
            
            // Apply proper enharmonic spelling based on key
            if (this.scaleEngine.shouldUseFlats(key) && noteName.includes('#')) {
                noteName = this.scaleEngine.enharmonicEquivalents[noteName] || noteName;
            }
            
            scale.push(noteName);
        }
        
        return scale;
    }
    
    /**
     * Find the best voice leading note in the next scale
     * @param {string} lastNote - The last note of the previous scale
     * @param {Array} nextScale - The next scale to search in
     * @param {string} direction - 'ascending' or 'descending'
     * @returns {string} The best starting note for voice leading
     */
    findVoiceLeadingNote(lastNote, nextScale, direction) {
        const lastNoteIndex = this.scaleEngine.getNoteIndex(lastNote);
        
        // Define intervals to check (half step, whole step, minor 3rd)
        const intervals = [1, 2, 3];
        
        for (const interval of intervals) {
            let targetNoteIndex;
            
            if (direction === 'ascending') {
                targetNoteIndex = (lastNoteIndex + interval) % 12;
            } else {
                targetNoteIndex = (lastNoteIndex - interval + 12) % 12;
            }
            
            const targetNote = this.scaleEngine.allNotes[targetNoteIndex];
            
            // Check if this note (or its enharmonic equivalent) exists in the next scale
            for (const scaleNote of nextScale) {
                if (this.scaleEngine.areNotesEquivalent(targetNote, scaleNote)) {
                    return scaleNote; // Return the note as it appears in the scale
                }
            }
        }
        
        // Fallback: use the first note of the scale (excluding octave)
        return nextScale[0];
    }
    
    /**
     * Generate a sequence from a starting note in a scale based on serving style
     * @param {Array} scale - The complete scale (8 notes including octave)
     * @param {string} startNote - The note to start from
     * @param {string} direction - 'ascending' or 'descending'
     * @param {string} servingStyle - The serving style (quarter, 8th, triplet)
     * @returns {Array} sequence of notes based on serving style
     */
    generateSequenceFromStartNote(scale, startNote, direction, servingStyle) {
        // Find the starting note in the scale
        let startIndex = -1;
        for (let i = 0; i < scale.length; i++) {
            if (this.scaleEngine.areNotesEquivalent(scale[i], startNote)) {
                startIndex = i;
                break;
            }
        }
        
        if (startIndex === -1) {
            console.error(`Start note ${startNote} not found in scale [${scale.join(', ')}]`);
            startIndex = 0; // Fallback to first note
        }
        
        const sequence = [];
        const scaleWithoutOctave = scale.slice(0, -1); // Remove the octave duplicate [C,D,E,F,G,A,B]
        
        // Determine number of notes based on serving style
        let notesCount = 8; // Default for 8th notes
        if (servingStyle === 'quarter') {
            notesCount = 4;
        } else if (servingStyle === 'triplet') {
            notesCount = 12;
        }
        
        if (direction === 'ascending') {
            // For ascending: start from the note and go up based on serving style
            for (let i = 0; i < notesCount; i++) {
                const index = (startIndex + i) % scaleWithoutOctave.length;
                sequence.push(scaleWithoutOctave[index]);
            }
        } else {
            // For descending: start from the note and go down based on serving style
            for (let i = 0; i < notesCount; i++) {
                const index = (startIndex - i + scaleWithoutOctave.length * 10) % scaleWithoutOctave.length;
                sequence.push(scaleWithoutOctave[index]);
            }
        }
        
        return sequence;
    }
    
    /**
     * Get dish name from the naming system
     */
    getDishName(scaleType, key) {
        // Handle enharmonic equivalents
        const normalizedKey = this.normalizeKey(key);
        
        if (this.dishNames[scaleType] && this.dishNames[scaleType][normalizedKey]) {
            return this.dishNames[scaleType][normalizedKey];
        }
        
        // Fallback to generic name
        return `${key} ${this.formatScaleTypeName(scaleType)}`;
    }
    
    /**
     * Get dish price from the pricing system
     */
    getDishPrice(scaleType, key) {
        // Handle enharmonic equivalents
        const normalizedKey = this.normalizeKey(key);
        
        if (this.dishPrices[scaleType] && this.dishPrices[scaleType][normalizedKey]) {
            return this.dishPrices[scaleType][normalizedKey];
        }
        
        // Fallback price
        return 2.00;
    }
    
    /**
     * Normalize key names to match the dish names (prefer flats for musically accurate spelling)
     */
    normalizeKey(key) {
        const keyMap = {
            'C#': 'Db', 'Db': 'Db',  // Prefer Db over C#
            'D#': 'Eb', 'Eb': 'Eb',  // Prefer Eb over D#
            'F#': 'F#', 'Gb': 'F#',  // Keep F# (more common than Gb)
            'G#': 'Ab', 'Ab': 'Ab',  // Prefer Ab over G#
            'A#': 'Bb', 'Bb': 'Bb'   // Prefer Bb over A#
        };
        
        return keyMap[key] || key;
    }
    
    /**
     * Display available orders as tickets
     */
    displayOrders() {
        if (this.isInitialLoad && !this.cafeOpened) {
            // Show "Open the Cafe" button
            this.showOpenCafeButton();
        } else if (this.isInitialLoad && this.cafeOpened) {
            // Show preparing orders with progress bar
            this.showPreparingOrders();
        } else {
            this.orderTicketsContainer.innerHTML = '';
            this.renderOrderTickets();
        }
    }
    
    /**
     * Show the "Open the Cafe" button
     */
    showOpenCafeButton() {
        this.orderTicketsContainer.innerHTML = `
            <div class="cafe-opening">
                <button class="open-cafe-btn" id="open-cafe-btn">
                    ☕ Open the Cafe
                </button>
                <p class="button-hint">Press Space or any Piano Key</p>
            </div>
        `;
        
        // Add click handler for the button
        const openBtn = document.getElementById('open-cafe-btn');
        openBtn.addEventListener('click', () => {
            this.openCafe();
        });
    }
    
    /**
     * Show preparing orders with progress bar
     */
    showPreparingOrders() {
        this.orderTicketsContainer.innerHTML = `
            <div class="preparing-orders">
                <div class="preparing-text">
                    <span>📋</span>
                    <span>Preparing fresh orders...</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar-fill" id="cafe-progress-bar"></div>
                </div>
            </div>
        `;
        
        // Start progress bar animation
        this.soundManager.play('preparingOrder', 0.245); // 35% of default 0.7 volume
        this.animateProgressBar();
    }
    
    /**
     * Open the cafe and start the preparation sequence
     */
    openCafe() {
        this.cafeOpened = true;
        this.soundManager.play('openCafe', 0.49); // 70% of default 0.7 volume
        
        // Stage 1: Start moving the order board up and expanding
        document.body.classList.remove('cafe-closed');
        document.body.classList.add('cafe-opening');
        
        // Immediately add cooking-station-appearing to prevent any flash
        document.body.classList.add('cooking-station-appearing');
        
        // We'll enable the refresh orders functionality after all orders have slid in
        // This will be handled by a timeout in the animateProgressBar method
        
        // Stage 2: Start progress bar during the movement
        setTimeout(() => {
            this.showPreparingOrders();
        }, 300); // Start progress bar while board is moving
        
        // Stage 3: Complete the transition to final layout after progress
        // This will be handled in animateProgressBar when progress completes
    }
    
    /**
     * Animate the progress bar over 3 seconds
     */
    animateProgressBar() {
        const progressBar = document.getElementById('cafe-progress-bar');
        let progress = 0;
        const duration = 3000; // 3 seconds
        const interval = 30; // Update every 30ms for smooth animation
        const increment = (100 / duration) * interval;
        
        // cooking-station-appearing class is already added in openCafe()
        
        const progressInterval = setInterval(() => {
            progress += increment;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Complete the layout transition to final state
                document.body.classList.remove('cafe-opening', 'cooking-station-appearing');
                document.body.classList.add('cafe-opened');
                
                // Start the order animation immediately - no need to wait since board stays in position
                this.orderTicketsContainer.innerHTML = '';
                this.renderOrderTickets();
            }
        }, interval);
    }
    
    /**
     * Render the actual order tickets
     */
    renderOrderTickets() {
        this.availableOrders.forEach((order, index) => {
            const ticket = this.createOrderTicket(order);
            
            if (this.isInitialLoad) {
                // Add initial load styling for sliding animation
                ticket.classList.add('initial-load');
                this.orderTicketsContainer.appendChild(ticket);
                
                console.log(`Order ${index + 1}: Added initial-load class, starting animation in ${index * 400}ms`);
                
                // Force a reflow to ensure the initial-load class is applied
                ticket.offsetHeight;
                
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    // Trigger sliding animation with staggered delay
                    setTimeout(() => {
                        console.log(`Order ${index + 1}: Starting slide animation`);
                        
                        // Play slide-in sound for each order
                        this.soundManager.play('orderSlideIn', 0.49); // 70% of default 0.7 volume
                        
                        ticket.classList.remove('initial-load');
                        
                        // Force another reflow
                        ticket.offsetHeight;
                        
                        ticket.classList.add('initial-slide-in');
                        
                        // Remove animation class after animation completes
                        setTimeout(() => {
                            console.log(`Order ${index + 1}: Animation complete, removing class`);
                            ticket.classList.remove('initial-slide-in');
                        }, 1500);
                    }, index * 400); // Start immediately, then stagger each order by 400ms
                });
            } else {
                // Normal display for subsequent order generations
                this.orderTicketsContainer.appendChild(ticket);
            }
        });
        
        // Mark that initial load is complete
        if (this.isInitialLoad) {
            this.isInitialLoad = false;
            
            // Enable the refresh orders functionality after all orders have slid in
            // We use the timing of the last order (index 3) plus its animation duration
            const lastOrderDelay = 3 * 400; // 3rd order delay (0-indexed)
            const animationDuration = 1500; // Animation duration
            const totalDelay = lastOrderDelay + animationDuration + 100; // Add a small buffer
            
            setTimeout(() => {
                const refreshOrdersBtn = document.getElementById('refresh-orders');
                if (refreshOrdersBtn) {
                    refreshOrdersBtn.classList.remove('non-clickable');
                    refreshOrdersBtn.classList.add('clickable-title');
                    refreshOrdersBtn.style.cursor = 'pointer';
                    console.log('Refresh orders functionality enabled');
                }
            }, totalDelay);
        }
    }
    
    /**
     * Create an order ticket element
     */
    createOrderTicket(order) {
        const ticket = document.createElement('div');
        ticket.className = `order-ticket ${order.complexity} has-${order.direction}`;
        ticket.dataset.orderId = order.id;
        
        const complexityIcons = {
            simple: '🍽️',
            complex: '🍽️🍽️',
            gourmet: '🍽️🍽️🍽️'
        };
        
        const dishList = order.dishes.map(dish => 
            `<li>${this.formatKeyName(dish.key)} ${this.formatScaleTypeName(dish.scaleType)} ${dish.name}</li>`
        ).join('');
        
        const direction = order.dishes[0]?.direction || 'ascending';
        const directionIcon = direction === 'ascending' ? '🪽' : '🍂';
        const servingStyle = order.servingStyle || 'quarter';
        
        ticket.innerHTML = `
            <div class="ticket-header">
                <h3>${order.customerName} 
                    <span class="serving-style-badge">
                        <img src="asset/${servingStyle}.png" alt="${servingStyle}" class="serving-style-icon-small">
                    </span>
                </h3>
                <div class="ticket-badges">
                    <span class="direction-badge ${direction}">${directionIcon} ${direction}</span>
                </div>
            </div>
            <div class="ticket-body">
                <ul class="dish-list">
                    ${dishList}
                </ul>
                <div class="ticket-footer">
                    <span class="sell-amount">💰 $${order.totalSell.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        ticket.addEventListener('click', () => {
            this.soundManager.play('takeOrder', 0.28); // 40% of default 0.7 volume
            this.selectOrder(order);
        });
        
        return ticket;
    }
    
    /**
     * Select an order to cook
     */
    selectOrder(order) {
        // Remove previous selection
        document.querySelectorAll('.order-ticket').forEach(ticket => {
            ticket.classList.remove('selected');
        });
        
        // Mark this ticket as selected
        const ticketElement = document.querySelector(`[data-order-id="${order.id}"]`);
        if (ticketElement) {
            ticketElement.classList.add('selected');
        }
        
        this.currentOrder = order;
        this.startCooking();
    }
    
    /**
     * Start cooking the selected order
     */
    startCooking() {
        this.currentPosition = 0;
        this.isCooking = true;
        this.mistakeCount = 0; // Reset mistake count for new order
        this.currentComplexity = this.currentOrder.complexity;
        this.currentServingStyle = this.currentOrder.servingStyle || 'quarter';
        
        // Set complexity attribute for display
        document.body.setAttribute('data-difficulty', this.currentComplexity);
        document.body.setAttribute('data-serving-style', this.currentServingStyle);
        
        // Generate note slots based on serving style
        this.generateNoteSlots();
        
        // Simply combine all dish sequences (they were already generated correctly with voice leading)
        this.currentSequence = [];
        for (const dish of this.currentOrder.dishes) {
            if (dish.sequence && dish.sequence.length > 0) {
                this.currentSequence = this.currentSequence.concat(dish.sequence);
            }
        }
        // Update the cooking UI and progress bar
        this.updateCookingUI();
        this.updateProgressBar();
        
        // Log order acceptance and expectations with voice leading details
        console.log(`=== ORDER ACCEPTED ===`);
        console.log(`Customer: ${this.currentOrder.customerName}`);
        console.log(`Direction: ${this.currentOrder.direction}`);
        
        // Log each scale with its starting note for voice leading verification
        this.currentOrder.dishes.forEach((dish, index) => {
            const scaleInfo = `${this.formatKeyName(dish.key)} ${this.formatScaleTypeName(dish.scaleType)}`;
            console.log(`Scale ${index + 1}: ${scaleInfo} starting from ${dish.startNote}`);
        });
        
        console.log(`Expected sequence: [${this.currentSequence.join(', ')}]`);
    }
    
    /**
     * Generate note slots based on serving style
     */
    generateNoteSlots() {
        // Get the note sequence container
        const noteSequence = document.getElementById('note-sequence');
        if (!noteSequence) return;
        
        // Clear existing note slots
        noteSequence.innerHTML = '';
        
        // Determine number of notes per row based on serving style
        let notesPerRow = 8; // Default for 8th notes
        if (this.currentServingStyle === 'quarter') {
            notesPerRow = 4;
        } else if (this.currentServingStyle === 'triplet') {
            notesPerRow = 12;
        }
        
        // Determine number of rows based on complexity
        let numRows = 1; // Default for simple complexity
        if (this.currentComplexity === 'complex') {
            numRows = 2;
        } else if (this.currentComplexity === 'gourmet') {
            numRows = 3;
        }
        
        // Generate rows with note slots
        for (let row = 0; row < numRows; row++) {
            const rowClass = row === 0 ? 'note-row' : 
                           (row === 1 ? 'note-row complex-row' : 'note-row gourmet-row');
            
            const rowElement = document.createElement('div');
            rowElement.className = rowClass;
            
            // Generate note slots for this row
            for (let i = 0; i < notesPerRow; i++) {
                const slotIndex = row * notesPerRow + i;
                const slotElement = document.createElement('div');
                slotElement.className = 'note-slot';
                slotElement.dataset.index = slotIndex;
                rowElement.appendChild(slotElement);
            }
            
            noteSequence.appendChild(rowElement);
        }
        
        // Update the note slots reference
        this.noteSlots = document.querySelectorAll('.note-slot');
    }
    
    /**
     * Handle a note being played
     */
    handleNotePlayed(noteName) {
        if (!this.isCooking || this.currentPosition >= this.currentSequence.length) {
            return;
        }
        
        const expectedNote = this.currentSequence[this.currentPosition];
        // Strict validation - must match expected note exactly (only allow enharmonic equivalents)
        let isCorrect = this.scaleEngine.areNotesEquivalent(noteName, expectedNote);
        
        // Get the direction of the current order
        const direction = this.currentOrder.direction;
        
        // Check if the note is played in the correct direction
        if (isCorrect && this.currentPosition > 0) {
            const prevNote = this.currentSequence[this.currentPosition - 1];
            const prevNoteIndex = this.scaleEngine.getNoteIndex(prevNote);
            const currentNoteIndex = this.scaleEngine.getNoteIndex(noteName);
            const expectedNoteIndex = this.scaleEngine.getNoteIndex(expectedNote);
            
            // Calculate the difference between the current and previous note
            let diff = currentNoteIndex - prevNoteIndex;
            // Handle octave wrapping
            if (Math.abs(diff) > 6) {
                if (diff > 0) diff -= 12;
                else diff += 12;
            }
            
            // Calculate the difference between the expected and previous note
            let expectedDiff = expectedNoteIndex - prevNoteIndex;
            // Handle octave wrapping
            if (Math.abs(expectedDiff) > 6) {
                if (expectedDiff > 0) expectedDiff -= 12;
                else expectedDiff += 12;
            }
            
            // For ascending, both differences should be positive (higher notes)
            // For descending, both differences should be negative (lower notes)
            const expectedDirection = (direction === 'ascending' && expectedDiff > 0) || 
                                    (direction === 'descending' && expectedDiff < 0);
            const playedDirection = (direction === 'ascending' && diff > 0) || 
                                   (direction === 'descending' && diff < 0);
            
            // If the direction is wrong AND the expected note follows the direction pattern,
            // mark the note as incorrect
            if (!playedDirection && expectedDirection) {
                isCorrect = false;
                this.mistakeCount++; // Increment mistake count for wrong direction
                
                // Show error feedback for wrong direction
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = `Wrong direction! Play ${direction === 'ascending' ? 'higher' : 'lower'} note: ${expectedNote}`;
                errorMessage.style.position = 'fixed';
                errorMessage.style.top = '50%';
                errorMessage.style.left = '50%';
                errorMessage.style.transform = 'translate(-50%, -50%)';
                errorMessage.style.background = 'rgba(255, 0, 0, 0.8)';
                errorMessage.style.color = 'white';
                errorMessage.style.padding = '1rem 2rem';
                errorMessage.style.borderRadius = '10px';
                errorMessage.style.fontWeight = 'bold';
                errorMessage.style.zIndex = '1000';
                document.body.appendChild(errorMessage);
                
                // Remove the error message after a short delay
                setTimeout(() => {
                    document.body.removeChild(errorMessage);
                }, 1500);
            }
        }
        
        // Strict validation - must match expected note exactly
        if (!isCorrect) {
            this.mistakeCount++; // Increment mistake count
            
            // Show error feedback
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = `Wrong note! Expected: ${expectedNote}`;
            errorMessage.style.position = 'fixed';
            errorMessage.style.top = '50%';
            errorMessage.style.left = '50%';
            errorMessage.style.transform = 'translate(-50%, -50%)';
            errorMessage.style.background = 'rgba(255, 0, 0, 0.8)';
            errorMessage.style.color = 'white';
            errorMessage.style.padding = '1rem 2rem';
            errorMessage.style.borderRadius = '10px';
            errorMessage.style.fontWeight = 'bold';
            errorMessage.style.zIndex = '1000';
            document.body.appendChild(errorMessage);
            
            // Remove the error message after a short delay
            setTimeout(() => {
                document.body.removeChild(errorMessage);
            }, 1500);
        }
        
        // Log note played with simple format
        console.log(`Played ${noteName}, expecting ${expectedNote}, ${isCorrect ? 'Correct' : 'Wrong'}`);
        
        // Update the note slot
        this.updateNoteSlot(this.currentPosition, noteName, isCorrect);
        
        if (isCorrect) {
            this.currentPosition++;
            this.updateProgressBar();
            
            // Check if order is complete - only after playing ALL notes
            if (this.currentPosition >= this.currentSequence.length) {
                // Ensure we've actually played all notes before completing
                if (this.currentPosition === this.currentSequence.length) {
                    this.completeOrder();
                }
            } else {
                // Show the next expected note only after advancing position
                // and only if the current note was played correctly
                this.highlightCurrentNoteSlot();
            }
        }
        
        // Play feedback sound
        this.playFeedbackSound(isCorrect);
    }
    
    /**
     * Complete the current order
     */
    completeOrder() {
        this.isCooking = false;
        
        const complexitySettings = this.complexityLevels[this.currentComplexity];
        const xpReward = 100 * complexitySettings.xpMultiplier;
        const sellAmount = this.currentOrder.totalSell;
        
        // Check if order was completed perfectly (no mistakes)
        const isPerfect = this.mistakeCount === 0;
        
        // Calculate tip as 15-25% of sell amount (base tip)
        const tipPercentage = 0.15 + Math.random() * 0.10; // Random between 15% and 25%
        let tipAmount = sellAmount * tipPercentage;
        let extraTip = 0;
        
        // Add perfect bonus (20% extra tip instead of 30%)
        if (isPerfect) {
            extraTip = sellAmount * 0.20;
            tipAmount += extraTip;
        }
        
        // Total coins earned = sell amount + tip (rounded to 2 decimal places)
        tipAmount = parseFloat(tipAmount.toFixed(2));
        const totalCoinsEarned = parseFloat((sellAmount + tipAmount).toFixed(2));
        
        // Play earn money sound
        this.soundManager.play('earnMoney');
        
        // Update player stats
        this.playerXP += xpReward;
        this.playerCoins += totalCoinsEarned;
        this.updatePlayerStats();
        this.saveProgress();
        
        // Show completion modal
        this.showOrderComplete(xpReward, sellAmount, tipAmount - extraTip, extraTip, isPerfect);
        
        // Animate order completion and removal
        this.animateOrderCompletion(this.currentOrder.id);
    }
    
    /**
     * Show order completion modal with receipt-style layout
     */
    showOrderComplete(xpReward, sellAmount, baseTipAmount, extraTip, isPerfect) {
        this.orderCompleteModal.classList.remove('hidden');
        
        // Perfect stamp is now in the thank you message area of the receipt
        // Remove any existing perfect stamp from the modal title
        const modalTitle = this.orderCompleteModal.querySelector('h2');
        const existingStamp = modalTitle?.querySelector('.perfect-completion');
        if (existingStamp) {
            existingStamp.remove();
        }
        
        // Store reward values for the receipt
        const xpRewardValue = xpReward;
        const sellRewardValue = sellAmount.toFixed(2);
        
        // Handle tip display with perfect bonus
        let tipDisplay = '';
        if (isPerfect && extraTip > 0) {
            tipDisplay = `$${baseTipAmount.toFixed(2)}+<span class="burning-text">$${extraTip.toFixed(2)}</span>`;
        } else {
            tipDisplay = `$${baseTipAmount.toFixed(2)}`;
        }
        
        const completionMessage = document.getElementById('completion-message');
        
        // Get the customer name from the current order
        const customerName = this.currentOrder.customerName;
        
        // Get current date and time for receipt
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Generate receipt content
        let receiptContent = `
            <div class="receipt">
                <div class="receipt-header">
                    <h3>Scale Cafe</h3>
                    <p>Where Music Meets Flavor</p>
                    <div class="receipt-datetime">
                        <p>${dateString}</p>
                        <p>${timeString}</p>
                    </div>
                </div>
                
                <div class="receipt-customer">
                    <p>Customer: ${customerName}</p>
                    <p>Order #: ${this.currentOrder.direction.charAt(0).toUpperCase() + this.currentOrder.direction.slice(1)}</p>
                </div>
                
                <div class="receipt-items">
                    <div class="receipt-divider"></div>
                    <div class="receipt-column-headers">
                        <span>Item</span>
                        <span>Scale</span>
                        <span>Price</span>
                    </div>
                    <div class="receipt-divider"></div>
        `;
        
        // Add each dish to the receipt
        this.currentOrder.dishes.forEach(dish => {
            const formattedKey = this.formatKeyName(dish.key);
            const scaleType = this.formatScaleTypeName(dish.scaleType);
            const direction = dish.direction.charAt(0).toUpperCase() + dish.direction.slice(1);
            
            receiptContent += `
                <div class="receipt-item">
                    <span>${dish.name}</span>
                    <span>${formattedKey} ${scaleType}</span>
                    <span>$${dish.price.toFixed(2)}</span>
                </div>
            `;
        });
        
        // Add multipliers, subtotal, and total
        const complexityMultiplier = this.complexityLevels[this.currentOrder.complexity].coinMultiplier;
        const servingStyleMultiplier = this.servingStyles[this.currentOrder.servingStyle].multiplier;
        const basePrice = this.currentOrder.basePrice;
        
        receiptContent += `
                <div class="receipt-divider"></div>
                <div class="receipt-subtotal">
                    <span>Subtotal:</span>
                    <span>$${basePrice.toFixed(2)}</span>
                </div>
                <div class="receipt-multipliers">
                    <div class="receipt-multiplier">
                        <span>${this.formatComplexityName(this.currentOrder.complexity)}:</span>
                        <span>${complexityMultiplier.toFixed(1)}×</span>
                    </div>
                    <div class="receipt-multiplier">
                        <span>${this.formatServingStyleName(this.currentOrder.servingStyle)}:</span>
                        <span>${servingStyleMultiplier.toFixed(1)}×</span>
                    </div>
                </div>
                <div class="receipt-divider"></div>
                <div class="receipt-tip">
                    <span>Tip:</span>
                    <span>$${baseTipAmount.toFixed(2)}${isPerfect ? ` + <span class="burning-text">${extraTip.toFixed(1)}</span>` : ''}</span>
                </div>
                <div class="receipt-total">
                    <span>Total:</span>
                    <span>$${(parseFloat(sellAmount) + parseFloat(baseTipAmount) + (isPerfect ? parseFloat(extraTip) : 0)).toFixed(2)}</span>
                </div>
                <div class="receipt-divider"></div>
                
                <div class="receipt-rewards">
                    <div class="receipt-reward">
                        <span>⭐ XP Earned:</span>
                        <span>${xpReward}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Perfect stamp is now added to the thank you message area

        
        // Add thank you message
        const messages = [
            `Delicious! ${customerName} loved it!`,
            `Great job! That was exactly what ${customerName} ordered!`,
            `Amazing! ${customerName} left a great review!`,
            `Wonderful! ${customerName} said it was the best they've ever had!`,
            `Excellent! ${customerName} was so happy!`
        ];
        
        receiptContent += `
            <div class="receipt-footer">
                <p>${isPerfect ? `Flawless execution! ${customerName} was amazed!` : messages[Math.floor(Math.random() * messages.length)]}</p>
                <div class="thank-you-container">
                    <p class="thank-you-text">Thank You!</p>
                    ${isPerfect ? '<div class="perfect-stamp thank-you-perfect">Perfect!</div>' : ''}
                </div>
            </div>
        </div>
        `;
        
        completionMessage.innerHTML = receiptContent;
    }
    
    /**
     * Finish the current order and reset
     */
    finishOrder() {
        this.orderCompleteModal.classList.add('hidden');
        this.currentOrder = null;
        this.currentSequence = [];
        this.currentPosition = 0;
        
        // Reset cooking station
        this.currentOrderElement.innerHTML = '<p>Select an order to start cooking!</p>';
        this.cookingStatus.textContent = 'Ready to cook!';
        this.progressFill.style.width = '0%';
        
        // Clear note slots
        this.noteSlots.forEach(slot => {
            slot.textContent = '';
            slot.className = 'note-slot';
        });
        
        // Debug: Log current state
        console.log(`=== FINISH ORDER DEBUG ===`);
        console.log(`Available orders count: ${this.availableOrders.length}`);
        console.log(`Available orders:`, this.availableOrders.map(o => `${o.customerName} (${o.direction})`));
        
        // Automatically select the leftmost (first) available order
        setTimeout(() => {
            this.autoSelectNextOrder();
        }, 500); // Small delay to ensure UI has updated
        
        // Note: We no longer add new orders here
        // New orders are now added in animateOrderCompletion after the old order is removed
        // This ensures we maintain exactly 4 orders at all times
        console.log(`Not generating new orders here - will be handled after animation completes`);

    }
    
    /**
     * Update the cooking UI
     */
    updateCookingUI() {
        if (!this.currentOrder) return;
        
        // Show only the scale name (without the dish name) in the cooking order
        const dishList = this.currentOrder.dishes.map(dish => 
            `<span class="dish-name scale-${dish.scaleType}">${this.formatKeyName(dish.key)} ${this.formatScaleTypeName(dish.scaleType)}</span>`
        ).join(', ');
        
        const direction = this.currentOrder.dishes[0]?.direction || 'ascending';
        const directionIcon = direction === 'ascending' ? '🪽' : '🍂';
        const servingStyle = this.currentOrder.servingStyle || 'quarter';
        
        // Add direction-based class to the current-order element
        this.currentOrderElement.className = `current-order has-${direction}`;
        
        this.currentOrderElement.innerHTML = `
            <div class="cooking-order">
                <h3>
                    Cooking for ${this.currentOrder.customerName} 
                    <span class="serving-style-badge">
                        <img src="asset/${servingStyle}.png" alt="${servingStyle}" class="serving-style-icon-small">
                    </span>
                    <div class="cooking-badges">
                        <span class="direction-badge ${direction}">${directionIcon} ${direction}</span>
                    </div>
                </h3>
                <p class="dishes">Preparing: ${dishList}</p>
            </div>
        `;
        
        this.cookingStatus.textContent = 'Cooking in progress...';
        
        // Clear all notes initially, then show only the starting note
        this.displayExpectedNotes();
        // Show the starting note so user knows what to play
        this.highlightCurrentNoteSlot();
    }
    
    /**
     * Display expected notes in the slots (show NO notes initially)
     */
    displayExpectedNotes() {
        // Don't show ANY notes initially - user should not see any notes before playing
        // All notes will be revealed only when the user reaches that position
        for (let i = 0; i < this.noteSlots.length; i++) {
            this.noteSlots[i].textContent = '';
            this.noteSlots[i].classList.remove('expected');
        }
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        if (this.currentSequence.length === 0) return;
        
        const progress = (this.currentPosition / this.currentSequence.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
    
    /**
     * Highlight the current note slot and show only the first note
     */
    highlightCurrentNoteSlot() {
        // Remove current highlighting
        this.noteSlots.forEach(slot => slot.classList.remove('current'));
        
        // Highlight current position
        if (this.currentPosition < this.noteSlots.length && this.currentPosition < this.currentSequence.length) {
            const currentSlot = this.noteSlots[this.currentPosition];
            currentSlot.classList.add('current');
            
            // Only show the first note, keep all other notes empty until played
            if (!currentSlot.classList.contains('correct')) {
                // Only show text for the first note (position 0)
                if (this.currentPosition === 0) {
                    currentSlot.textContent = this.currentSequence[this.currentPosition];
                } else {
                    currentSlot.textContent = ''; // Keep all other slots empty
                }
                currentSlot.classList.add('expected');
            }
        }
    }
    
    /**
     * Update a note slot with the played note
     */
    updateNoteSlot(position, noteName, isCorrect) {
        if (position >= this.noteSlots.length) return;
        
        const slot = this.noteSlots[position];
        
        // Clear any existing timeout for this slot to prevent conflicts
        if (slot.resetTimeout) {
            clearTimeout(slot.resetTimeout);
            slot.resetTimeout = null;
        }
        
        if (isCorrect) {
            // For correct notes, remove all other classes and add correct
            slot.classList.remove('current', 'expected', 'wrong');
            slot.classList.add('correct', 'expected'); // Keep the expected class to maintain visibility
            slot.textContent = this.currentSequence[position]; // Always show the expected note from the sequence
            
            // DO NOT show the next note automatically - user should not see upcoming notes
            // The next note will only be revealed when they advance to that position
        } else {
            // For wrong notes, keep the expected class if it was there
            const wasExpected = slot.classList.contains('expected');
            slot.classList.remove('current');
            slot.classList.add('wrong');
            if (wasExpected) slot.classList.add('expected');
            
            slot.textContent = noteName; // Show the incorrect note that was played
            
            // Reset to expected state after a delay, but keep the expected class if it was there
            slot.resetTimeout = setTimeout(() => {
                // Only reset if the slot hasn't been marked as correct in the meantime
                if (!slot.classList.contains('correct')) {
                    slot.classList.remove('wrong');
                    if (wasExpected) {
                        slot.classList.add('expected', 'current'); // Keep it current and expected
                        
                        // For the first note, always show the expected note
                        if (position === 0) {
                            slot.textContent = this.currentSequence[position];
                        } else {
                            slot.textContent = ''; // Keep other slots empty
                        }
                    }
                }
                slot.resetTimeout = null;
            }, 1000);
        }
    }
    
    /**
     * Play feedback sound (disabled)
     */
    playFeedbackSound(isCorrect) {
        // Sound effects disabled per user request
        return;
    }
    
    /**
     * Format scale type name for display
     */
    formatScaleTypeName(scaleType) {
        const names = {
            major: 'Major',
            harmonicMinor: 'Harmonic Minor',
            melodicMinor: 'Melodic Minor'
        };
        return names[scaleType] || scaleType;
    }
    
    /**
     * Format key name for display with proper flat symbols
     */
    formatKeyName(key) {
        return key.replace('b', '♭').replace('#', '♯');
    }

    /**
     * Format complexity name for display
     * @param {string} complexity - The complexity type (simple, complex, gourmet)
     * @returns {string} Formatted complexity name
     */
    formatComplexityName(complexity) {
        const complexityNames = {
            'simple': 'Simple',
            'complex': 'Complex',
            'gourmet': 'Gourmet'
        };
        return complexityNames[complexity] || complexity;
    }

    /**
     * Format serving style name for display
     * @param {string} servingStyle - The serving style (quarter, 8th, triplet)
     * @returns {string} Formatted serving style name
     */
    formatServingStyleName(servingStyle) {
        const servingStyleNames = {
            'quarter': 'Quarter',
            '8th': '8th',
            'triplet': 'Triplet'
        };
        return servingStyleNames[servingStyle] || servingStyle;
    }

    /**
     * Update player stats display
     */
    updatePlayerStats() {
        if (this.playerXPElement) {
            this.playerXPElement.textContent = this.playerXP;
        }
        if (this.playerCoinsElement) {
            this.playerCoinsElement.textContent = this.playerCoins.toFixed(1);
        }
    }
    
    /**
     * Animate order completion with checkmark and removal
     */
    animateOrderCompletion(orderId) {
        const ticketElement = document.querySelector(`[data-order-id="${orderId}"]`);
        if (!ticketElement) return;
        
        console.log(`=== ANIMATE ORDER COMPLETION ===`);
        console.log(`Starting animation for order ID: ${orderId}`);
        console.log(`Orders before removal: ${this.availableOrders.length}`);
        
        // Add checkmark overlay
        const checkmark = document.createElement('div');
        checkmark.className = 'completion-checkmark';
        checkmark.innerHTML = '✓';
        ticketElement.appendChild(checkmark);
        
        // Animate checkmark appearance
        setTimeout(() => {
            checkmark.classList.add('show');
        }, 100);
        
        // After checkmark animation, throw the order away
        setTimeout(() => {
            ticketElement.classList.add('completed');
            
            // Remove from available orders and DOM after animation
            setTimeout(() => {
                console.log(`Removing order ${orderId} from availableOrders array`);
                console.log(`Orders before filter: ${this.availableOrders.length}`);
                this.availableOrders = this.availableOrders.filter(order => order.id !== orderId);
                console.log(`Orders after filter: ${this.availableOrders.length}`);
                
                if (ticketElement.parentNode) {
                    ticketElement.parentNode.removeChild(ticketElement);
                }
                
                // Add a new order to maintain exactly 4 orders
                if (this.availableOrders.length < 4) {
                    console.log(`Adding new order to maintain 4 orders`);
                    const newOrder = this.generateRandomOrder();
                    this.availableOrders.push(newOrder);
                    console.log(`Generated new order: ${newOrder.customerName} (${newOrder.direction})`);
                    console.log(`New available orders count: ${this.availableOrders.length}`);
                    this.animateNewOrder(newOrder);
                }
            }, 800);
        }, 1500);
    }
    
    /**
     * Animate new order appearing with bounce effect
     */
    animateNewOrder(newOrder) {
        const ticket = this.createOrderTicket(newOrder);
        ticket.classList.add('new-order-entering');
        
        this.orderTicketsContainer.appendChild(ticket);
        
        // Play slide-in sound for new order refill
        this.soundManager.play('orderSlideIn', 0.49); // 70% of default 0.7 volume
        
        // Trigger bounce animation
        setTimeout(() => {
            ticket.classList.remove('new-order-entering');
            ticket.classList.add('new-order-bounce');
        }, 100);
        
        // Remove bounce class after animation
        setTimeout(() => {
            ticket.classList.remove('new-order-bounce');
        }, 1000);
    }
    
    /**
     * Automatically select the leftmost (first) available order
     */
    autoSelectNextOrder() {
        if (this.availableOrders.length > 0) {
            const nextOrder = this.availableOrders[0]; // Get the first (leftmost) order
            console.log(`=== AUTO-SELECTING NEXT ORDER ===`);
            console.log(`Auto-selecting: ${nextOrder.customerName} (${nextOrder.direction})`);
            
            // Play the take order sound
            this.soundManager.play('takeOrder', 0.28); // 40% of default 0.7 volume
            
            // Select the order
            this.selectOrder(nextOrder);
        } else {
            console.log(`No orders available for auto-selection`);
        }
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        const progress = {
            playerXP: this.playerXP,
            playerCoins: this.playerCoins,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('scaleCafeProgress', JSON.stringify(progress));
        } catch (e) {
            // Silent fail for save progress
        }
    }
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('scaleCafeProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.playerXP = progress.playerXP || 0;
                this.playerCoins = progress.playerCoins || 0;
            }
        } catch (e) {
            this.playerXP = 0;
            this.playerCoins = 0;
        }
    }

    /**
     * Debug function to test scale generation
     */
    debugScaleGeneration() {
        console.log('=== DEBUGGING SCALE GENERATION ===');
        
        // Test Bb harmonic minor
        const bbHarmonic = this.generateCorrectScale('harmonicMinor', 'Bb');
        console.log('Bb Harmonic Minor:', bbHarmonic);
        console.log('Contains F#?', bbHarmonic.includes('F#'));
        console.log('Contains Gb?', bbHarmonic.includes('Gb'));
        
        // Test voice leading from Gb to B melodic minor
        const bMelodic = this.generateCorrectScale('melodicMinor', 'B');
        console.log('B Melodic Minor:', bMelodic);
        
        const voiceLeadingNote = this.findVoiceLeadingNote('Gb', bMelodic, 'ascending');
        console.log('Voice leading from Gb to B melodic minor (ascending):', voiceLeadingNote);
        
        // Test sequence generation
        const sequence = this.generateSequenceFromStartNote(bMelodic, voiceLeadingNote, 'ascending');
        console.log('Generated sequence:', sequence);
    }
} 