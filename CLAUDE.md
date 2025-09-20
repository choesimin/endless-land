# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Endless Land is an AI-powered RPG game featuring multiple interconnected themed maps with scrolling viewport system. The game uses ASCII characters for visual representation and supports AI-generated world content through dedicated system prompts.

## Project Structure
```
endless-land/
├── index.html              # Main game file (HTML/CSS/JavaScript)
├── CLAUDE.md               # Development documentation
├── README.md               # Project description
├── LICENSE                 # Project license
└── prompts/
    └── world-generator.md  # AI system prompt for world generation
```

## Architecture
- **Single-file game**: All game logic, styling, and HTML in `index.html`
- **Configuration-driven**: Maps and themes defined in data structures
- **Modular functions**: Code organized into logical sections with single responsibilities
- **Scrolling viewport**: 35x20 visible area within 80x40 maps
- **Multi-map system**: 7+ interconnected themed areas with transition system
- **AI integration**: System prompts for procedural content generation

## Development Commands
This is a static HTML project with no build system:
- **Run locally**: Open `index.html` in a web browser
- **No build step required**: Direct file editing and browser refresh

## Language Usage Rules
- **Conversations**: Use Korean only when discussing with the user
- **Code and Documentation**: Use English only for all source code, comments, documentation files, commit messages, and technical content
- **CLAUDE.md file**: Always write in English
- **System prompts**: Write in English for AI agent compatibility

## Code Style Preferences
- Do not use emojis in code, documentation, or any file modifications
- Keep all text content emoji-free for this project
- English language is used for all UI text and user-facing messages
- Comments can be in English for clarity

## Commit Message Style
- Use simple one-line commit messages without periods
- Keep messages concise and abstract
- Example: "Add game screen" not "Add initial Endless Land ASCII RPG setup with English UI and arrow controls"

## Code Structure (Post-Refactoring)
The main `SimpleRPG` class is organized into clearly marked sections:

### Configuration Objects
- **CONSTANTS**: All game constants (map size, viewport, player position)
- **MAP_CONFIGS**: Map-specific settings (theme, exits, connections)
- **THEME_CONFIGS**: Theme-specific object definitions (type, count, probability)

### Code Sections
- **===== MAP INITIALIZATION =====**: Map loading and setup
- **===== MAP GENERATION HELPERS =====**: Modular map creation functions
- **===== INPUT HANDLING =====**: Keyboard input processing
- **===== PLAYER MOVEMENT =====**: Movement validation and execution
- **===== MAP TRANSITIONS =====**: Inter-map travel system
- **===== MAP MODE =====**: Map viewing and navigation system
- **===== RENDERING =====**: Viewport calculation and display
- **===== UI UPDATES =====**: User interface management

## Game Systems

### Map System
- **Map size**: 80x40 grid cells per map
- **Viewport**: 35x20 visible area (player-centered camera)
- **Multiple maps**: 7+ interconnected themed areas
- **Transitions**: 3-wide wall gaps connecting maps at specific coordinates
- **Themes**: forest, plains, desert, mountains, village, cave, lake (expandable)

### Map Mode System
- **Toggle**: M key switches between game mode and map mode
- **Exploration tracking**: Only visited areas (within viewport range) are revealed
- **Camera movement**: WASD keys move camera view within and between maps
- **Seamless navigation**: Camera automatically transitions to connected maps at boundaries
- **Split view**: Left side shows map view, right side shows connection diagram
- **Map indicators**: `>` (current viewing), `@` (player location), `(?)` (unvisited)
- **Exit detection**: Map transitions require exact coordinate positioning for player movement

### Control Scheme
- **Movement**: WASD keys for all directional movement (both game mode and map mode)
- **Map toggle**: M key switches between game mode and map mode
- **Map navigation**: Number keys (0-6) for direct map selection in map mode
- **Browser compatibility**: No arrow keys, space bar, or tab to avoid browser conflicts
- **Case insensitive**: Both uppercase and lowercase keys supported
- **Reserved for future**: Enter key available for additional functionality

### ASCII Character Rules
- **Reserved characters**: `.` (empty), `#` (wall), `@` (player)
- **Object characters**: Alphabet letters only (A-Z) for all game objects
- **No special symbols**: Numbers, Unicode, or special characters not allowed for objects

### Current Objects
- `T` = Tree, `C` = Cactus, `R` = Rock, `H` = House, `S` = Stalactite, `W` = Water
- **Expandable**: AI can create new objects using unused alphabet letters

## AI Integration

### World Generation System
- **Location**: `prompts/world-generator.md`
- **Purpose**: System prompt for AI agents to generate new maps, themes, and objects
- **Output**: JSON format compatible with game's configuration system
- **Capabilities**: Creates new themes, 80x40 map arrays, object definitions, exit connections

### Using AI Generation
1. Copy content from `prompts/world-generator.md` to AI agent
2. Request new content: "Create a crystal cave theme" or "Generate a steampunk city"
3. Receive JSON output with themeConfig, mapConfig, mapArray, and newObjects
4. Integrate output into game's THEME_CONFIGS and MAP_CONFIGS

## Development Workflow

### Adding New Maps
1. **Manual approach**: Update MAP_CONFIGS and THEME_CONFIGS in index.html
2. **AI approach**: Use world-generator.md prompt to generate content
3. **Testing**: Load index.html and navigate to new map areas

### Adding New Themes
1. Define objects array in THEME_CONFIGS format
2. Specify object types (alphabet letters), counts, and probabilities
3. Ensure objects follow ASCII character rules

### Adding New Objects
1. Choose unused alphabet letter (A-Z)
2. Add to collision detection in isObstacle() function
3. Update documentation with object meaning

## Map Mode Implementation Notes

### Key Design Decisions
- **Exploration-based revelation**: Players must physically visit areas to see them in map mode
- **Camera-based navigation**: Map mode uses independent camera movement separate from player position
- **Exit coordinate precision**: Player movement requires exact exit coordinates, but map mode camera uses proximity detection
- **Visual feedback**: Connection diagram provides context for current viewing position and overall world structure

### Technical Considerations
- **Visited area storage**: Uses Set data structure with coordinate strings for efficient lookup
- **Map transition detection**: Different tolerance levels for player movement vs camera movement
- **Viewport consistency**: Map mode camera uses same viewport dimensions as game mode
- **State management**: Separate tracking for map mode current map vs actual player map location
