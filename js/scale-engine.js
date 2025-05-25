/**
 * ScaleLand - Scale Engine
 * Handles scale structures, generation, and validation
 */

class ScaleEngine {
    constructor() {
        // Define all notes in chromatic order (using sharps)
        this.allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Define enharmonic equivalents
        this.enharmonicEquivalents = {
            'C#': 'Db',
            'D#': 'Eb',
            'F#': 'Gb',
            'G#': 'Ab',
            'A#': 'Bb',
            'Db': 'C#',
            'Eb': 'D#',
            'Gb': 'F#',
            'Ab': 'G#',
            'Bb': 'A#'
        };
        
        // Define special enharmonic cases (one-way mappings to avoid conflicts)
        this.specialEnharmonics = {
            'E#': 'F',
            'B#': 'C',
            'Cb': 'B',
            'Fb': 'E',
            'F##': 'G',
            'C##': 'D',
            'G##': 'A'
        };
        
        // Define which keys use flats vs sharps
        this.flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
        this.sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];
        
        // Define scale formulas (intervals from root)
        this.scaleFormulas = {
            major: [0, 2, 4, 5, 7, 9, 11, 12], // 1-2-3-4-5-6-7-8
            harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12], // 1-2-b3-4-5-b6-7-8
            melodicMinor: [0, 2, 3, 5, 7, 9, 11, 12]  // 1-2-b3-4-5-6-7-8 (jazz melodic minor)
        };
        
        /* IMPORTANT NOTE FOR FUTURE REFERENCE:
         * ==========================================
         * We are using the jazz approach to Melodic Minor scales, where the same pattern
         * is used for both ascending and descending (unlike classical Melodic Minor which
         * uses natural minor when descending).
         * 
         * Jazz Melodic Minor: 1-2-b3-4-5-6-7-8 (both directions)
         * Classical Melodic Minor ascending: 1-2-b3-4-5-6-7-8
         * Classical Melodic Minor descending: 8-b7-b6-5-4-b3-2-1 (natural minor)
         * 
         * If you need to revert to classical Melodic Minor, uncomment the code below:
         */
        
        // Define descending formulas for scales that differ when descending
        this.descendingFormulas = {
            // In jazz, melodic minor uses the same formula for both ascending and descending
            // For classical melodic minor, uncomment the line below:
            // melodicMinor: [0, 2, 3, 5, 7, 8, 10, 12]  // 1-2-b3-4-5-b6-b7-8 (natural minor)
        };
        
        // Add a debugging function to validate scales
        this.validateScales();
        
        // Initialize scale cache for performance
        this.scaleCache = new Map();
    }
    
    /**
     * Get a complete scale (two octaves) for a given key, scale type, and direction
     * @param {string} key - The key of the scale
     * @param {string} scaleType - The type of scale
     * @param {string} direction - The direction (ascending or descending)
     * @returns {Array} A complete scale (two octaves)
     */
    getCompleteScale(key, scaleType, direction) {
        // For Melodic Minor scales, use the hardcoded scales
        if (scaleType === 'melodicMinor') {
            // Get the correct scale from our hardcoded scales
            const melodicMinorScales = {
                // Ascending Melodic Minor scales
                ascending: {
                    'C': ['C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C'],
                    'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A#', 'C', 'C#', 'D#', 'E', 'F#', 'G#', 'A#', 'C', 'C#'],
                    'D': ['D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D'],
                    'Eb': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D', 'Eb'],
                    'E': ['E', 'F#', 'G', 'A', 'B', 'C#', 'D#', 'E', 'F#', 'G', 'A', 'B', 'C#', 'D#', 'E'],
                    'F': ['F', 'G', 'Ab', 'Bb', 'C', 'D', 'E', 'F', 'G', 'Ab', 'Bb', 'C', 'D', 'E', 'F'],
                    'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D#', 'F', 'F#', 'G#', 'A', 'B', 'C#', 'D#', 'F', 'F#'],
                    'G': ['G', 'A', 'Bb', 'C', 'D', 'E', 'F#', 'G', 'A', 'Bb', 'C', 'D', 'E', 'F#', 'G'],
                    'Ab': ['Ab', 'Bb', 'B', 'Db', 'Eb', 'F', 'G', 'Ab', 'Bb', 'B', 'Db', 'Eb', 'F', 'G', 'Ab'],
                    'A': ['A', 'B', 'C', 'D', 'E', 'F#', 'G#', 'A', 'B', 'C', 'D', 'E', 'F#', 'G#', 'A'],
                    'Bb': ['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A', 'Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A', 'Bb'],
                    'B': ['B', 'C#', 'D', 'E', 'F#', 'G#', 'A#', 'B', 'C#', 'D', 'E', 'F#', 'G#', 'A#', 'B'],
                    // Add common enharmonic equivalents
                    'D#': ['D#', 'F', 'F#', 'G#', 'A#', 'C', 'D', 'D#', 'F', 'F#', 'G#', 'A#', 'C', 'D', 'D#'],
                    'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'F', 'G', 'G#', 'A#', 'B', 'C#', 'D#', 'F', 'G', 'G#'],
                    'A#': ['A#', 'C', 'C#', 'D#', 'F', 'G', 'A', 'A#', 'C', 'C#', 'D#', 'F', 'G', 'A', 'A#']
                },
                // Descending Melodic Minor scales (jazz approach - same as ascending)
                descending: {
                    'C': ['C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C'],
                    'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A#', 'C', 'C#', 'D#', 'E', 'F#', 'G#', 'A#', 'C', 'C#'],
                    'D': ['D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D'],
                    'Eb': ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C', 'D', 'Eb'],
                    'E': ['E', 'F#', 'G', 'A', 'B', 'C#', 'D#', 'E', 'F#', 'G', 'A', 'B', 'C#', 'D#', 'E'],
                    'F': ['F', 'G', 'Ab', 'Bb', 'C', 'D', 'E', 'F', 'G', 'Ab', 'Bb', 'C', 'D', 'E', 'F'],
                    'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D#', 'F', 'F#', 'G#', 'A', 'B', 'C#', 'D#', 'F', 'F#'],
                    'G': ['G', 'A', 'Bb', 'C', 'D', 'E', 'F#', 'G', 'A', 'Bb', 'C', 'D', 'E', 'F#', 'G'],
                    'Ab': ['Ab', 'Bb', 'B', 'Db', 'Eb', 'F', 'G', 'Ab', 'Bb', 'B', 'Db', 'Eb', 'F', 'G', 'Ab'],
                    'A': ['A', 'B', 'C', 'D', 'E', 'F#', 'G#', 'A', 'B', 'C', 'D', 'E', 'F#', 'G#', 'A'],
                    'Bb': ['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A', 'Bb', 'C', 'Db', 'Eb', 'F', 'G', 'A', 'Bb'],
                    'B': ['B', 'C#', 'D', 'E', 'F#', 'G#', 'A#', 'B', 'C#', 'D', 'E', 'F#', 'G#', 'A#', 'B'],
                    // Add common enharmonic equivalents
                    'D#': ['D#', 'F', 'F#', 'G#', 'A#', 'C', 'D', 'D#', 'F', 'F#', 'G#', 'A#', 'C', 'D', 'D#'],
                    'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'F', 'G', 'G#', 'A#', 'B', 'C#', 'D#', 'F', 'G', 'G#'],
                    'A#': ['A#', 'C', 'C#', 'D#', 'F', 'G', 'A', 'A#', 'C', 'C#', 'D#', 'F', 'G', 'A', 'A#']
                }
            };
            
            if (melodicMinorScales[direction] && melodicMinorScales[direction][key]) {
                return melodicMinorScales[direction][key];
            }
        }
        
        // For other scales, generate the complete scale from the formula
        const formula = direction === 'descending' && this.descendingFormulas[scaleType] ?
            this.descendingFormulas[scaleType] : this.scaleFormulas[scaleType];
        
        if (!formula) {
            console.error(`Scale type '${scaleType}' not found`);
            return [];
        }
        
        const keyIndex = this.getNoteIndex(key);
        if (keyIndex === -1) {
            console.error(`Key '${key}' not found`);
            return [];
        }
        
        // Generate a two-octave scale
        const completeScale = [];
        
        // First octave
        for (let i = 0; i < formula.length - 1; i++) {
            completeScale.push(this.getNoteAtIndex(keyIndex + formula[i], key));
        }
        
        // Second octave
        for (let i = 0; i < formula.length; i++) {
            completeScale.push(this.getNoteAtIndex(keyIndex + formula[i] + 12, key));
        }
        
        return completeScale;
    }
    
    /**
     * Validate scale formulas to ensure they're correct
     */
    validateScales() {
        // Validation disabled for cleaner console
    }
    
    /**
     * Generate a test scale for validation
     */
    generateTestScale(key, scaleType, direction) {
        const keyIndex = this.getNoteIndex(key);
        const formula = direction === 'descending' && this.descendingFormulas[scaleType] ? 
            this.descendingFormulas[scaleType] : this.scaleFormulas[scaleType];
        
        const scale = [];
        for (let i = 0; i < formula.length; i++) {
            scale.push(this.getNoteAtIndex(keyIndex + formula[i], key));
        }
        
        return scale;
    }
    
    /**
     * Get the index of a note in the chromatic scale
     * @param {string} note - The note name (e.g., 'C', 'F#', 'Bb')
     * @returns {number} The index of the note
     */
    getNoteIndex(note) {
        // First try direct match
        let index = this.allNotes.indexOf(note);
        
        // If not found, try regular enharmonic equivalent
        if (index === -1 && this.enharmonicEquivalents[note]) {
            index = this.allNotes.indexOf(this.enharmonicEquivalents[note]);
        }
        
        // If still not found, try special enharmonic equivalent
        if (index === -1 && this.specialEnharmonics[note]) {
            index = this.allNotes.indexOf(this.specialEnharmonics[note]);
        }
        
        return index;
    }
    
    /**
     * Get the note at a specific index in the chromatic scale
     * @param {number} index - The index in the chromatic scale
     * @param {string} key - The key context (optional, used to determine sharp/flat preference)
     * @returns {string} The note name
     */
    getNoteAtIndex(index, key = null) {
        // Handle wrapping around the octave
        const noteIndex = index % 12;
        let note = this.allNotes[noteIndex];
        
        // If we have a key context, use appropriate naming convention
        if (key && note.includes('#')) {
            if (this.shouldUseFlats(key)) {
                // Convert sharp to flat
                note = this.enharmonicEquivalents[note] || note;
            }
        }
        
        return note;
    }
    
    /**
     * Determine if a key should use flats instead of sharps
     * @param {string} key - The key name
     * @returns {boolean} True if the key should use flats
     */
    shouldUseFlats(key) {
        // Remove any accidentals from the key to check the base key
        const baseKey = key.replace('#', '').replace('b', '');
        
        // Check if it's explicitly a flat key
        if (this.flatKeys.includes(key)) {
            return true;
        }
        
        // Check if the key itself has a flat
        if (key.includes('b')) {
            return true;
        }
        
        // For minor keys, check the relative major
        // (This is a simplified approach - could be expanded)
        if (key.includes('minor') || key.includes('Minor')) {
            // Extract just the note part
            const noteOnly = key.split(' ')[0];
            return this.shouldUseFlats(noteOnly);
        }
        
        return false;
    }
    
    /**
     * Convert a note to its enharmonic equivalent if needed
     * @param {string} note - The note to convert
     * @param {boolean} preferFlats - Whether to prefer flats over sharps
     * @returns {string} The converted note
     */
    convertToPreferredAccidental(note, preferFlats) {
        if (preferFlats && note.includes('#')) {
            return this.enharmonicEquivalents[note] || note;
        } else if (!preferFlats && note.includes('b')) {
            return this.enharmonicEquivalents[note] || note;
        }
        return note;
    }
    
    /**
     * Generate a scale sequence
     * @param {string} scaleType - The type of scale ('major', 'harmonicMinor', 'melodicMinor')
     * @param {string} key - The key of the scale (e.g., 'C', 'F#')
     * @param {string} startNote - The starting note of the sequence
     * @param {string} direction - The direction of the scale ('ascending' or 'descending')
     * @returns {Array} An array of 8 notes in the requested scale
     */
    generateScaleSequence(scaleType, key, startNote, direction) {
        // Create cache key
        const cacheKey = `${scaleType}-${key}-${startNote}-${direction}`;
        
        // Check cache first
        if (this.scaleCache.has(cacheKey)) {
            return [...this.scaleCache.get(cacheKey)]; // Return a copy to prevent mutations
        }
        
        let sequence = [];
        
        // For Melodic Minor scales, use our hardcoded correct scales
        if (scaleType === 'melodicMinor') {
            // Define correct melodic minor scales for all keys
            const melodicMinorScales = {
                // Ascending Melodic Minor scales
                ascending: {
                    'C': ['C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C'],
                    'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A#', 'C', 'C#'],
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
                    // Add common enharmonic equivalents
                    'D#': ['D#', 'F', 'F#', 'G#', 'A#', 'C', 'D', 'D#'],
                    'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'F', 'G', 'G#'],
                    'A#': ['A#', 'C', 'C#', 'D#', 'F', 'G', 'A', 'A#']
                },
                // Descending Melodic Minor scales (jazz approach - same as ascending)
                descending: {
                    'C': ['C', 'D', 'Eb', 'F', 'G', 'A', 'B', 'C'],
                    'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A#', 'C', 'C#'],
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
                    // Add common enharmonic equivalents
                    'D#': ['D#', 'F', 'F#', 'G#', 'A#', 'C', 'D', 'D#'],
                    'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'F', 'G', 'G#'],
                    'A#': ['A#', 'C', 'C#', 'D#', 'F', 'G', 'A', 'A#']
                }
            };
            
            // Return the correct scale if available
            if (melodicMinorScales[direction] && melodicMinorScales[direction][key]) {
                sequence = melodicMinorScales[direction][key];
                
                // Cache the result before returning
                this.scaleCache.set(cacheKey, [...sequence]);
                return sequence;
            }
        }

        // Get the formula for the requested scale type
        let formula;
        
        // For descending melodic minor, use the special descending formula
        if (direction === 'descending' && scaleType === 'melodicMinor' && this.descendingFormulas[scaleType]) {
            formula = this.descendingFormulas[scaleType];
        } else {
            formula = this.scaleFormulas[scaleType];
        }
        
        if (!formula) {
            console.error(`Scale type '${scaleType}' not found`);
            return this.generateDefaultScale(key);
        }
        
        // Get the index of the key note
        const keyIndex = this.getNoteIndex(key);
        if (keyIndex === -1) {
            console.error(`Key '${key}' not found`);
            return this.generateDefaultScale(key);
        }
        
        try {
            // Generate the complete scale (two octaves to handle any starting position)
            let completeScale = [];
            
            // First octave
            for (let i = 0; i < formula.length - 1; i++) {
                completeScale.push(this.getNoteAtIndex(keyIndex + formula[i], key));
            }
            
            // Second octave (for wrapping)
            for (let i = 0; i < formula.length; i++) {
                completeScale.push(this.getNoteAtIndex(keyIndex + formula[i] + 12, key));
            }
            

            
            // Find the start note in the complete scale (including enharmonic equivalents)
            let startIndex = -1;
            for (let i = 0; i < completeScale.length; i++) {
                if (this.areNotesEquivalent(completeScale[i], startNote)) {
                    startIndex = i;
                    // Use the note as it appears in the scale (correct enharmonic spelling)
                    startNote = completeScale[i];
                    break;
                }
            }
            
            // If start note not found, use the tonic (key note)
            if (startIndex === -1) {
                startNote = key;
                startIndex = completeScale.indexOf(key);
                if (startIndex === -1) startIndex = 0;
            }
            
            // Generate the sequence
            if (direction === 'ascending') {
                // For ascending, take 8 consecutive notes starting from startIndex
                for (let i = 0; i < 8; i++) {
                    sequence.push(completeScale[startIndex + i]);
                }
            } else if (direction === 'descending') {
                // For descending, we need to ensure we have enough notes before the start note
                if (startIndex < 7) {
                    // Not enough notes before startIndex, so we need to use the second octave
                    startIndex += 7;
                }
                
                // Take 8 notes in descending order
                for (let i = 0; i < 8; i++) {
                    sequence.push(completeScale[startIndex - i]);
                }
            } else {
                console.error(`Invalid direction '${direction}'`);
                return this.generateDefaultScale(key);
            }
            
            // Only log when actually cooking (not during menu setup)
            if (window.cafeSystem && window.cafeSystem.isCooking) {
                console.log(`${key} ${scaleType} ${direction} from ${startNote}: [${sequence.join(', ')}]`);
            }

            // Cache the result before returning
            this.scaleCache.set(cacheKey, [...sequence]);
            return sequence;
        } catch (error) {
            console.error('Error generating scale sequence:', error);
            return this.generateDefaultScale(key);
        }
    }
    
    /**
     * Generate a default C major scale as a fallback
     * @param {string} key - The key to use (defaults to C if invalid)
     * @returns {Array} A C major scale
     */
    generateDefaultScale(key) {
        const validKey = this.getNoteIndex(key) !== -1 ? key : 'C';
        const keyIndex = this.getNoteIndex(validKey);
        
        // Generate a major scale in the given key
        return this.scaleFormulas.major.map(interval => this.getNoteAtIndex(keyIndex + interval, validKey));
    }
    
    /**
     * Check if two notes are equivalent (considering enharmonic equivalents)
     * @param {string} note1 - First note
     * @param {string} note2 - Second note
     * @returns {boolean} True if notes are equivalent
     */
    areNotesEquivalent(note1, note2) {
        // Direct match
        if (note1 === note2) {
            return true;
        }
        
        // Check regular enharmonic equivalents
        const equiv1 = this.enharmonicEquivalents[note1];
        const equiv2 = this.enharmonicEquivalents[note2];
        
        if ((equiv1 && equiv1 === note2) || 
            (equiv2 && equiv2 === note1) || 
            (equiv1 && equiv2 && equiv1 === equiv2)) {
            return true;
        }
        
        // Check special enharmonic equivalents (from scales.md)
        const special1 = this.specialEnharmonics[note1];
        const special2 = this.specialEnharmonics[note2];
        
        if ((special1 && special1 === note2) || (special2 && special2 === note1)) {
            return true;
        }
        
        // Check reverse special enharmonics (e.g., F matches E#)
        for (const [special, normal] of Object.entries(this.specialEnharmonics)) {
            if ((note1 === normal && note2 === special) || (note1 === special && note2 === normal)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Clear the scale cache (useful for memory management)
     */
    clearCache() {
        this.scaleCache.clear();
    }
}
