/**
 * Scale Cafe - Cafe System
 * Handles order management, cooking mechanics, and note validation
 * Based on the original battle system but themed for a cafe
 */

class CafeSystem {
    constructor(scaleEngine) {
        this.scaleEngine = scaleEngine;
        this.currentSequence = [];
        this.currentPosition = 0;
        this.isCooking = false;
        
        // Player stats
        this.playerXP = 0;
        this.playerCoins = 0;
        
        // Load saved progress
        this.loadProgress();
        
        // Order complexity settings (same as battle difficulty)
        this.complexityLevels = {
            normal: { dishes: 1, notesPerDish: 8, xpMultiplier: 1, coinMultiplier: 1 },
            elite: { dishes: 2, notesPerDish: 8, xpMultiplier: 2, coinMultiplier: 1.5 },
            boss: { dishes: 3, notesPerDish: 8, xpMultiplier: 3, coinMultiplier: 2 }
        };
        this.currentComplexity = 'normal';
        
        // Current order data
        this.currentOrder = {
            customerName: '',
            complexity: 'normal',
            dishes: []
        };
        
        // Available orders
        this.availableOrders = [];
        
        // Dish names from the name.md file
        this.dishNames = {
            major: {
                'C': 'Latte', 'C#': 'Espresso', 'D': 'Cappuccino', 'Eb': 'Mocha',
                'E': 'Brew', 'F': 'Americano', 'F#': 'Macchiato', 'G': 'Flatwhite',
                'Ab': 'Cortado', 'A': 'Pour-over', 'Bb': 'Nitro', 'B': 'Affogato'
            },
            harmonicMinor: {
                'C': 'Croissant', 'C#': 'Bagel', 'D': 'Scone', 'Eb': 'Muffin',
                'E': 'Danish', 'F': 'Biscuit', 'F#': 'Tart', 'G': 'Brioche',
                'Ab': 'Strudel', 'A': 'Roll', 'Bb': 'Breadstick', 'B': 'Pastry'
            },
            melodicMinor: {
                'C': 'Popcorn', 'C#': 'Pretzel', 'D': 'Biscotti', 'Eb': 'Cookie',
                'E': 'Trailmix', 'F': 'Granola', 'F#': 'Brownie', 'G': 'Cracker',
                'Ab': 'Muffin', 'A': 'Churro', 'Bb': 'Donut', 'B': 'Macaron'
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
        this.coinRewardElement = document.getElementById('coin-reward');
        this.playerXPElement = document.getElementById('player-xp');
        this.playerCoinsElement = document.getElementById('player-coins');
        this.newOrderBtn = document.getElementById('new-order-btn');
        
        // Bind event handlers
        this.continueButton.addEventListener('click', () => this.finishOrder());
        
        // Make the Order Board title clickable to refresh orders
        const refreshOrdersBtn = document.getElementById('refresh-orders');
        if (refreshOrdersBtn) {
            refreshOrdersBtn.addEventListener('click', () => this.generateNewOrders());
            refreshOrdersBtn.style.cursor = 'pointer';
        }
        
        // Initialize player stats display
        this.updatePlayerStats();
        
        // Generate initial orders
        this.generateNewOrders();
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
        this.availableKeys = keys.length > 0 ? keys : ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
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
            this.setAvailableKeys(['C', 'G', 'D', 'A', 'E', 'B', 'F#']);
        }
        
        // Generate up to 4 orders maximum
        const numOrders = Math.min(4, 3 + Math.floor(Math.random() * 2));
        
        for (let i = 0; i < numOrders; i++) {
            const order = this.generateRandomOrder();
            this.availableOrders.push(order);
        }
        
        this.displayOrders();
    }
    
    /**
     * Generate a single random order
     */
    generateRandomOrder() {
        // Use current complexity setting from menu
        const complexities = ['normal', 'elite', 'boss'];
        const complexity = this.currentComplexity || 'elite';
        const complexitySettings = this.complexityLevels[complexity];
        
        const customerNames = [
            'Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Avery', 'Quinn',
            'Taylor', 'Jamie', 'Sage', 'River', 'Skylar', 'Rowan', 'Phoenix'
        ];
        
        const order = {
            id: Date.now() + Math.random(),
            customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
            complexity: complexity,
            dishes: [],
            totalTip: Math.floor(50 * complexitySettings.coinMultiplier + Math.random() * 50)
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
            
            // Generate the 8-note sequence starting from the chosen note
            const sequence = this.generateSequenceFromStartNote(correctScale, startNote, orderDirection);
            
            const dish = {
                name: this.getDishName(randomScaleType, randomKey),
                scaleType: randomScaleType,
                key: randomKey,
                startNote: startNote,
                direction: orderDirection,
                sequence: sequence
            };
            
            order.dishes.push(dish);
            
            // Set previous end note for voice leading
            if (sequence && sequence.length > 0) {
                previousEndNote = sequence[sequence.length - 1];
            }
        }
        
        return order;
    }
    
    /**
     * Generate the correct scale for a given type and key
     * @param {string} scaleType - The scale type
     * @param {string} key - The key
     * @returns {Array} Array of notes in the scale
     */
    generateCorrectScale(scaleType, key) {
        // Use the exact scales from scales.md with proper enharmonic spelling
        const scales = {
            major: {
                'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
                'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#', 'C#'],
                'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#', 'D'],
                'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D', 'Eb'],
                'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#', 'E'],
                'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E', 'F'],
                'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#', 'F#'],
                'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G'],
                'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G', 'Ab'],
                'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#', 'A'],
                'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'],
                'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#', 'B']
            },
            harmonicMinor: {
                'A': ['A', 'B', 'C', 'D', 'E', 'F', 'G#', 'A'],
                'E': ['E', 'F#', 'G', 'A', 'B', 'C', 'D#', 'E'],
                'B': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A#', 'B'],
                'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E#', 'F#'],
                'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B#', 'C#'],
                'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F##', 'G#'],
                'D#': ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C##', 'D#'],
                'A#': ['A#', 'B#', 'C#', 'D#', 'E#', 'F#', 'G##', 'A#'],
                'D': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C#', 'D'],
                'G': ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F#', 'G'],
                'C': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B', 'C'],
                'F': ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'E', 'F'],
                // Add common enharmonic equivalents for game keys
                'Bb': ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'A', 'Bb'], // Bb harmonic minor
                'Eb': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'D', 'Eb'], // Eb harmonic minor
                'Ab': ['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'G', 'Ab']  // Ab harmonic minor
            },
            melodicMinor: {
                'A': ['A', 'B', 'C', 'D', 'E', 'F#', 'G#', 'A'],
                'E': ['E', 'F#', 'G', 'A', 'B', 'C#', 'D#', 'E'],
                'B': ['B', 'C#', 'D', 'E', 'F#', 'G#', 'A#', 'B'],
                'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D#', 'E#', 'F#'],
                'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A#', 'B#', 'C#'],
                'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'E#', 'F##', 'G#'],
                'D#': ['D#', 'E#', 'F#', 'G#', 'A#', 'B#', 'C##', 'D#'],
                'A#': ['A#', 'B#', 'C#', 'D#', 'E#', 'F##', 'G##', 'A#'],
                'D': ['D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D'],
                'G': ['G', 'A', 'Bb', 'C', 'D', 'E', 'F#', 'G'],
                'C': ['C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C'],
                'F': ['F', 'G', 'Ab', 'Bb', 'C', 'D', 'E', 'F'],
                // Add common enharmonic equivalents for game keys
                'Bb': ['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A', 'Bb'], // Bb melodic minor
                'Eb': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D', 'Eb'], // Eb melodic minor
                'Ab': ['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F', 'G', 'Ab']  // Ab melodic minor
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
     * Generate an 8-note sequence from a starting note in a scale
     * @param {Array} scale - The complete scale (8 notes including octave)
     * @param {string} startNote - The note to start from
     * @param {string} direction - 'ascending' or 'descending'
     * @returns {Array} 8-note sequence
     */
    generateSequenceFromStartNote(scale, startNote, direction) {
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
        
        if (direction === 'ascending') {
            // For ascending: start from the note and go up 8 notes
            for (let i = 0; i < 8; i++) {
                const index = (startIndex + i) % scaleWithoutOctave.length;
                sequence.push(scaleWithoutOctave[index]);
            }
        } else {
            // For descending: start from the note and go down 8 notes
            for (let i = 0; i < 8; i++) {
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
     * Normalize key names to match the dish names
     */
    normalizeKey(key) {
        const keyMap = {
            'C#': 'C#', 'Db': 'C#',
            'D#': 'Eb', 'Eb': 'Eb',
            'F#': 'F#', 'Gb': 'F#',
            'G#': 'Ab', 'Ab': 'Ab',
            'A#': 'Bb', 'Bb': 'Bb'
        };
        
        return keyMap[key] || key;
    }
    
    /**
     * Display available orders as tickets
     */
    displayOrders() {
        this.orderTicketsContainer.innerHTML = '';
        
        this.availableOrders.forEach(order => {
            const ticket = this.createOrderTicket(order);
            this.orderTicketsContainer.appendChild(ticket);
        });
    }
    
    /**
     * Create an order ticket element
     */
    createOrderTicket(order) {
        const ticket = document.createElement('div');
        ticket.className = `order-ticket ${order.complexity}`;
        ticket.dataset.orderId = order.id;
        
        const complexityIcons = {
            normal: '🍽️',
            elite: '🍽️🍽️',
            boss: '🍽️🍽️🍽️'
        };
        
        const dishList = order.dishes.map(dish => 
            `<li>${dish.key} ${this.formatScaleTypeName(dish.scaleType)} ${dish.name}</li>`
        ).join('');
        
        const direction = order.dishes[0]?.direction || 'ascending';
        const directionIcon = direction === 'ascending' ? '↗️' : '↙️';
        
        ticket.innerHTML = `
            <div class="ticket-header">
                <h3>${order.customerName}</h3>
                <span class="direction-badge ${direction}">${directionIcon} ${direction}</span>
            </div>
            <div class="ticket-body">
                <ul class="dish-list">
                    ${dishList}
                </ul>
                <div class="ticket-footer">
                    <span class="tip-amount">💰 $${order.totalTip}</span>
                </div>
            </div>
        `;
        
        ticket.addEventListener('click', () => this.selectOrder(order));
        
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
        this.currentComplexity = this.currentOrder.complexity;
        
        // Clear all note slots
        this.noteSlots.forEach(slot => {
            slot.textContent = '';
            slot.className = 'note-slot';
        });
        
        // Set complexity attribute for display
        document.body.setAttribute('data-difficulty', this.currentComplexity);
        
        // Simply combine all dish sequences (they were already generated correctly with voice leading)
        this.currentSequence = [];
        for (const dish of this.currentOrder.dishes) {
            if (dish.sequence && dish.sequence.length > 0) {
                this.currentSequence = this.currentSequence.concat(dish.sequence);
            }
        }
        
        this.updateCookingUI();
        this.updateProgressBar();
        
        // Log order acceptance and expectations with voice leading details
        console.log(`=== ORDER ACCEPTED ===`);
        console.log(`Customer: ${this.currentOrder.customerName}`);
        console.log(`Direction: ${this.currentOrder.direction}`);
        
        // Log each scale with its starting note for voice leading verification
        this.currentOrder.dishes.forEach((dish, index) => {
            const scaleInfo = `${dish.key} ${this.formatScaleTypeName(dish.scaleType)}`;
            console.log(`Scale ${index + 1}: ${scaleInfo} starting from ${dish.startNote}`);
        });
        
        console.log(`Expected sequence: [${this.currentSequence.join(', ')}]`);
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
            // Always display the correct note when it's played correctly
            const currentSlot = this.noteSlots[this.currentPosition];
            currentSlot.textContent = noteName;
            
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
        const coinReward = this.currentOrder.totalTip;
        
        // Update player stats
        this.playerXP += xpReward;
        this.playerCoins += coinReward;
        this.updatePlayerStats();
        this.saveProgress();
        
        // Show completion modal
        this.showOrderComplete(xpReward, coinReward);
        
        // Animate order completion and removal
        this.animateOrderCompletion(this.currentOrder.id);
    }
    
    /**
     * Show order completion modal
     */
    showOrderComplete(xpReward, coinReward) {
        this.xpRewardElement.textContent = xpReward;
        this.coinRewardElement.textContent = coinReward;
        
        const completionMessage = document.getElementById('completion-message');
        const messages = [
            "Delicious! The customer loved it!",
            "Perfect! That was exactly what they ordered!",
            "Amazing! The customer left a great review!",
            "Wonderful! They said it was the best they've ever had!",
            "Excellent! The customer was so happy!"
        ];
        completionMessage.innerHTML = `<p>${messages[Math.floor(Math.random() * messages.length)]}</p>`;
        
        this.orderCompleteModal.classList.remove('hidden');
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
        
        // Always generate a new order to keep the board filled (if under 4)
        if (this.availableOrders.length < 4) {
            const newOrder = this.generateRandomOrder();
            this.availableOrders.push(newOrder);
            this.animateNewOrder(newOrder);
        }
    }
    
    /**
     * Update the cooking UI
     */
    updateCookingUI() {
        if (!this.currentOrder) return;
        
        // Show only the scale name (without the dish name) in the cooking order
        const dishList = this.currentOrder.dishes.map(dish => 
            `<span class="dish-name">${dish.key} ${this.formatScaleTypeName(dish.scaleType)}</span>`
        ).join(', ');
        
        const direction = this.currentOrder.dishes[0]?.direction || 'ascending';
        const directionIcon = direction === 'ascending' ? '↗️' : '↙️';
        
        this.currentOrderElement.innerHTML = `
            <div class="cooking-order">
                <h3>Cooking for ${this.currentOrder.customerName} <span class="direction-badge ${direction}">${directionIcon} ${direction}</span></h3>
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
            slot.textContent = noteName; // Always show the correct note that was played
            
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
     * Update player stats display
     */
    updatePlayerStats() {
        if (this.playerXPElement) {
            this.playerXPElement.textContent = this.playerXP;
        }
        if (this.playerCoinsElement) {
            this.playerCoinsElement.textContent = this.playerCoins;
        }
    }
    
    /**
     * Animate order completion with checkmark and removal
     */
    animateOrderCompletion(orderId) {
        const ticketElement = document.querySelector(`[data-order-id="${orderId}"]`);
        if (!ticketElement) return;
        
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
                this.availableOrders = this.availableOrders.filter(order => order.id !== orderId);
                if (ticketElement.parentNode) {
                    ticketElement.parentNode.removeChild(ticketElement);
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