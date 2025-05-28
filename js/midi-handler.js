/**
 * ScaleLand - MIDI Handler
 * Handles MIDI input and note detection
 */

class MidiHandler {
    constructor() {
        // Store callbacks for note events
        this.noteCallbacks = [];
        
        // DOM elements
        this.statusElement = document.getElementById('midi-connection-status');
        
        // Set initial UI state
        this.updateStatus('Initializing...', false);
        
        // Track connection state and attempts
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.reconnectTimer = null;
        
        // Make the MIDI light clickable for reconnection
        if (this.statusElement) {
            this.statusElement.addEventListener('click', () => {
                this.updateStatus('Connecting...', false);
                this.reconnectAttempts = 0; // Reset counter on manual reconnect
                this.setupMIDI();
            });
        }
        
        // Setup keyboard fallback immediately
        this.setupKeyboardFallback();
        
        // Try to connect to MIDI
        this.setupMIDI();
        
        // Set up periodic connection check (every 30 seconds)
        setInterval(() => this.checkMIDIConnection(), 30000);
    }
    
    /**
     * Set up MIDI access
     */
    setupMIDI() {
        // Check if WebMIDI is available
        if (!navigator.requestMIDIAccess) {
            this.updateStatus('MIDI not supported in this browser', false);
            return;
        }
        
        // Request MIDI access
        navigator.requestMIDIAccess({ sysex: false })
            .then(access => {
                // Store the MIDI access for later use
                this.midiAccess = access;
                
                // Get all MIDI inputs
                const inputs = Array.from(access.inputs.values());
                
                if (inputs.length === 0) {
                    this.updateStatus('No MIDI devices found', false);
                    this.isConnected = false;
                    
                    // Schedule a reconnection attempt if we haven't exceeded the limit
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        console.log(`MIDI reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                        
                        // Clear any existing timer
                        if (this.reconnectTimer) {
                            clearTimeout(this.reconnectTimer);
                        }
                        
                        // Schedule a reconnection attempt
                        this.reconnectTimer = setTimeout(() => this.setupMIDI(), 5000);
                    }
                    return;
                }
                
                // Reset reconnection attempts on successful connection
                this.reconnectAttempts = 0;
                this.isConnected = true;
                
                // Connect to all available inputs (not just the first one)
                inputs.forEach(input => {
                    input.onmidimessage = this.handleMIDIMessage.bind(this);
                });
                
                // Update status with the first device name
                this.updateStatus(`Connected to ${inputs[0].name}`, true);
                
                // Listen for connection/disconnection events
                access.onstatechange = (event) => {
                    if (event.port.type === 'input') {
                        if (event.port.state === 'connected') {
                            this.isConnected = true;
                            this.reconnectAttempts = 0; // Reset counter on successful connection
                            this.updateStatus(`Connected to ${event.port.name}`, true);
                            event.port.onmidimessage = this.handleMIDIMessage.bind(this);
                        } else if (event.port.state === 'disconnected') {
                            // Check if any devices are still connected
                            const remainingInputs = Array.from(this.midiAccess.inputs.values());
                            if (remainingInputs.length > 0) {
                                this.updateStatus(`Connected to ${remainingInputs[0].name}`, true);
                                this.isConnected = true;
                            } else {
                                this.updateStatus('MIDI device disconnected', false);
                                this.isConnected = false;
                                // Try to reconnect after a short delay
                                setTimeout(() => this.setupMIDI(), 2000);
                            }
                        }
                    }
                };
            })
            .catch(error => {
                console.error('MIDI access error:', error);
                this.updateStatus('Failed to access MIDI', false);
                this.isConnected = false;
                
                // Schedule a reconnection attempt if we haven't exceeded the limit
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`MIDI reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                    
                    // Schedule a reconnection attempt
                    this.reconnectTimer = setTimeout(() => this.setupMIDI(), 5000);
                }
            });
    }
    
    /**
     * Handle incoming MIDI messages
     * @param {MIDIMessageEvent} event - The MIDI message event
     */
    handleMIDIMessage(event) {
        try {
            const [status, note, velocity] = event.data;
            
            // Note on with velocity > 0
            if ((status & 0xF0) === 0x90 && velocity > 0) {
                const noteName = this.getNoteNameFromMIDI(note);
                this.triggerNoteCallbacks(noteName, 'on', velocity);
            } 
            // Note off or note on with velocity 0
            else if ((status & 0xF0) === 0x80 || ((status & 0xF0) === 0x90 && velocity === 0)) {
                const noteName = this.getNoteNameFromMIDI(note);
                this.triggerNoteCallbacks(noteName, 'off', velocity);
            }
        } catch (error) {
            console.error('Error handling MIDI message:', error);
        }
    }
    
    /**
     * Set up computer keyboard as fallback for MIDI input
     */
    setupKeyboardFallback() {
        
        // Map keyboard keys to note names
        const keyMap = {
            'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
            'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
            'u': 'A#', 'j': 'B', 'k': 'C',
            // Add flat alternatives for better user experience
            '3': 'Eb', '4': 'E', '6': 'Gb', '7': 'G', '8': 'Ab',
            '9': 'A', '0': 'Bb', '-': 'B'
        };
        
        // Listen for keydown events
        document.addEventListener('keydown', (event) => {
            // Ignore repeat events
            if (event.repeat) return;
            
            const key = event.key.toLowerCase();
            if (keyMap[key]) {
                const noteName = keyMap[key];
                this.triggerNoteCallbacks(noteName, 'on', 64); // Medium velocity
            }
        });
        
        // Listen for keyup events
        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (keyMap[key]) {
                const noteName = keyMap[key];
                this.triggerNoteCallbacks(noteName, 'off', 0);
            }
        });
    }
    
    /**
     * Convert MIDI note number to note name
     * @param {number} midiNote - The MIDI note number
     * @returns {string} The note name (e.g., 'C', 'F#')
     */
    getNoteNameFromMIDI(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteNames[midiNote % 12];
    }
    
    /**
     * Register a callback for note events
     * @param {Function} callback - Function to call when a note event occurs
     */
    onNoteEvent(callback) {
        this.noteCallbacks.push(callback);
    }
    
    /**
     * Trigger all registered note callbacks
     * @param {string} note - The note name (e.g., 'C', 'F#')
     * @param {string} state - The note state ('on' or 'off')
     * @param {number} velocity - The note velocity (0-127)
     */
    triggerNoteCallbacks(note, state, velocity) {
        this.noteCallbacks.forEach(callback => callback(note, state, velocity));
    }
    
    /**
     * Update the MIDI connection status in the UI
     * @param {string} message - The status message (for console logging)
     * @param {boolean} connected - Whether a MIDI device is connected
     */
    updateStatus(message, connected) {
        if (this.statusElement) {
            // Keep the circle symbol (●) but just change the class for color
            this.statusElement.className = connected ? 'midi-light clickable connected' : 'midi-light clickable disconnected';
        }
        // Log status changes to console for debugging
        console.log(`MIDI Status: ${message} (${connected ? 'connected' : 'disconnected'})`);
    }
    
    /**
     * Check if MIDI connection is still active and try to reconnect if needed
     */
    checkMIDIConnection() {
        // Skip if we're already connected or actively trying to reconnect
        if (this.isConnected || this.reconnectAttempts > 0) {
            return;
        }
        
        // Check if we have MIDI access but no inputs
        if (this.midiAccess) {
            const inputs = Array.from(this.midiAccess.inputs.values());
            if (inputs.length === 0) {
                console.log('Periodic check: No MIDI devices found, attempting reconnection');
                this.setupMIDI();
            }
        } else {
            // No MIDI access at all, try to set up again
            console.log('Periodic check: No MIDI access, attempting reconnection');
            this.setupMIDI();
        }
    }
}
