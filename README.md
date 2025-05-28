# Scale Cafe

## A Musical Scale Practice Application with Voice Leading

![Scale Cafe Logo](https://lovejzzz.github.io/ScaleCafe/)

## Overview

Scale Cafe is an interactive web application designed to help musicians practice musical scales in a fun, cafe-themed environment. Players take on the role of a chef who must "cook" dishes by playing the correct notes of musical scales on their MIDI keyboard.

## Features

- **Cafe-Themed Interface**: Complete "orders" by playing correct scale notes
- **Multiple Scale Types**: Practice major, harmonic minor, and melodic minor scales
- **All 12 Musical Keys**: Support for all keys (C, C#/Db, D, etc.)
- **MIDI Integration**: Connect your MIDI keyboard to play scales in real-time
- **Voice Leading**: Advanced mode with voice leading between scales
- **Progress Tracking**: Earn XP and tips as you complete orders
- **Visual Feedback**: Immediate feedback on correct/incorrect notes

## How to Play

1. **Connect Your MIDI Keyboard**: The app will automatically detect your MIDI device
2. **Select an Order**: Choose from available orders on the Order Board
3. **Play the Notes**: Follow the highlighted notes and play them in sequence
4. **Complete the Order**: Successfully play all notes to complete the order and earn rewards

### Complexity Levels

- **Simple**: One scale (8 notes)
- **Complex**: Two scales with voice leading (16 notes)
- **Gourmet**: Three scales with voice leading (24 notes)

### Scale Types

- **Coffee Menu**: Major scales
- **Bakery Menu**: Harmonic minor scales
- **Snacks Menu**: Melodic minor scales (jazz approach - same ascending and descending)

## Voice Leading in Scale Cafe

Scale Cafe implements voice leading principles to create musical connections between different scales. Voice leading is a compositional technique that creates smooth transitions between chords or scales by minimizing the movement between notes.

### How Voice Leading Works in Scale Cafe

1. **Smooth Transitions**: When playing Complex or Gourmet orders, the app creates smooth transitions between scales by finding starting points in the second scale that are close to the ending note of the first scale.

2. **Proximity Principle**: The app looks for notes in the next scale that are within a small interval (half step, whole step, or minor 3rd) from the last note of the previous scale.

3. **Directional Consistency**: The app maintains the same direction (ascending or descending) throughout the entire order, ensuring a consistent musical phrase.

4. **Melodic Coherence**: By connecting scales through closely related notes, the resulting sequence sounds more musical and less like disconnected exercises.

### Example

When transitioning from a C major scale ending on C to a G major scale:

- Instead of starting the G major scale on G (which would be a large jump from C), the app might choose to start on D (a whole step above C).
- This creates a smoother melodic line: C → D → E → F# → G → A → B → C

### Benefits for Musicians

- Develops a better ear for melodic connections between scales
- Improves ability to modulate between keys
- Creates more musical practice sessions
- Builds skills for improvisation and composition

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses WebMIDI API for MIDI device integration
- Implements custom scale engine for accurate scale generation
- Supports enharmonic equivalents for proper musical notation

## Future Enhancements

- Sound generation for users without MIDI keyboards
- Additional scale types (pentatonic, blues, modes)
- Chord progression practice
- Customizable difficulty settings

## Update Log

### May 28, 2025

#### Economy System Refinement
- **Revised Menu Prices**: Updated all dish prices across all scale types for better game balance
  - Major Scales (Coffee): Adjusted to range from $3.00-$4.50 with an average of ~$3.73
  - Harmonic Minor Scales (Bakery): Increased to $2.50-$4.00 with an average of ~$3.23
  - Melodic Minor Scales (Snacks): Adjusted to $1.75-$3.25 with an average of ~$2.35
- **Improved Reward Calculation**: Implemented a more sophisticated reward system
  - Base Reward = Base Price × Complexity Multiplier × Serving Style Multiplier
  - Complexity Multipliers: Simple (1.0×), Complex (2.5×), Gourmet (4.0×)
  - Serving Style Multipliers: Quarter (1.0×), 8th (1.2×), Triplet (1.5×)
- **Refined Tip System**: Updated tip calculation with perfect order bonus reduced to 20% (from 30%)
- **Price Display**: Added consistent rounding to two decimal places for all monetary values
- **Multiplier Transparency**: Added multiplier information to UI descriptions

#### Serving Style Feature
- **Dynamic Note Slots**: Implemented different note counts based on serving style
  - Quarter: 4 notes per scale
  - 8th: 8 notes per scale
  - Triplet: 12 notes per scale
- **UI Improvements**: Positioned serving style icons between customer name and direction badge
- **Auto-Selection**: Added automatic selection of the first order after applying menu settings

### May 27, 2025

#### UI Improvements
- **Responsive Design**: Made the layout adaptive to different screen sizes using percentage-based widths and media queries
- **Square Note Slots**: Implemented aspect-ratio property to maintain square proportions for note slots
- **Direction Indicators**: Added Wing Emoji (🪽) for ascending scales and Falling Leaf Emoji (🍂) for descending scales
- **Perfect Stamp Enhancement**: Added magical radial gradient effect with subtle shining animation
- **Personalized Messages**: Added customer names with honorifics (Mr., Ms., Dr., etc.) in completion messages

#### Technical Improvements
- **MIDI Reconnection**: Enhanced MIDI handler with automatic reconnection attempts for better device reliability
- **Animation Consistency**: Fixed angle inconsistency in the Perfect stamp animation

## Credits

Developed by Tian Xing
