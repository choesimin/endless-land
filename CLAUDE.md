# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Endless Land is an AI-powered RPG game featuring multiple interconnected themed maps with scrolling viewport system. The game uses ASCII characters for visual representation and supports AI-generated world content through dedicated system prompts.

## Project Structure
```
endless-land/
├── web/
│   ├── index.html          # Main game frontend (HTML/CSS/JavaScript)
│   └── deploy.sh           # Frontend deployment script
├── api/                    # Backend API (Node.js/TypeScript)
│   ├── index.ts            # Lambda handlers (REST + WebSocket)
│   ├── bedrock.ts          # AI map generation using Bedrock
│   ├── types/              # All TypeScript types
│   │   ├── game.ts         # Game-related types
│   │   ├── api.ts          # API request/response types
│   │   ├── lambda.ts       # Lambda and backend-specific types
│   │   └── index.ts        # Type exports
│   ├── package.json        # Node.js dependencies
│   ├── package-lock.json   # Dependency lock file
│   ├── tsconfig.json       # TypeScript configuration
│   ├── template.yaml       # SAM CloudFormation template
│   ├── samconfig.toml      # SAM deployment configuration
│   └── deploy.sh           # Deployment script
├── .env.example            # Environment variables template
├── .env                    # Environment configuration (gitignored)
├── CLAUDE.md               # Development documentation
├── README.md               # Project description
├── LICENSE                 # Project license
└── docs/
    └── prompts/
        └── world-generator.md  # AI system prompt for world generation
```

## Architecture

### Frontend Architecture
- **Single-file game**: All game logic, styling, and HTML in `web/index.html`
- **Configuration-driven**: Maps and themes defined in data structures
- **Modular functions**: Code organized into logical sections with single responsibilities
- **Scrolling viewport**: 35x20 visible area within 80x40 maps
- **Multi-map system**: 7+ interconnected themed areas with transition system
- **AI integration**: Real-time AI generation via backend APIs

### Backend Architecture (AWS SAM)
- **Serverless**: Lambda functions for compute, API Gateway for endpoints
- **Database**: DynamoDB for persistent map and session storage
- **AI Integration**: Amazon Bedrock (Claude 3.5 Sonnet) for map generation
- **Static Hosting**: S3 for frontend deployment
- **Infrastructure as Code**: CloudFormation via SAM template
- **TypeScript**: Type-safe backend with comprehensive type definitions

## Development Commands

### Frontend Development
- **Run locally**: Open `web/index.html` in a web browser
- **No build step required**: Direct file editing and browser refresh
- **Deploy to S3**: `cd web && ./deploy.sh` (deploys to S3 static website)

### Backend Development
- **Install dependencies**: `cd api && npm install`
- **Build TypeScript**: `cd api && npm run build` (compiles TypeScript to dist/)
- **Type checking**: TypeScript compilation validates all types

### Full Stack Deployment
- **Setup environment**: Copy `.env.example` to `.env` and configure (shared by both deployments)
- **Backend deployment**: `cd api && ./deploy.sh` (SAM build + deployment)
- **Frontend deployment**: `cd web && ./deploy.sh` (S3 upload + endpoint auto-detection)
- **Manual deployment**: `cd api && sam build && sam deploy` then `cd web && ./deploy.sh`

### Environment Configuration
- **Shared configuration**: Single `.env` file at project root
- **Used by**: Both `api/deploy.sh` and `web/deploy.sh` scripts
- **Key settings**: AWS region, project name, bucket names, API stage
- **Path handling**: Deploy scripts automatically reference `../.env`
- **Optional**: Most settings have sensible defaults

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
- **AI map generation**: G key generates new AI map using Bedrock
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

## Cloud Architecture

### AWS SAM Stack
- **Frontend**: S3 Static Website hosting (`web/index.html`)
- **API**: API Gateway (REST + WebSocket)
- **Compute**: Lambda Functions (TypeScript)
- **Database**: DynamoDB (Maps + GameSessions tables)
- **AI**: Amazon Bedrock (Claude 3.5 Sonnet)

### Key Components
- **api/index.ts**: Consolidated Lambda handlers (REST + WebSocket)
- **api/bedrock.ts**: AI map generation using Bedrock
- **api/types/**: All TypeScript type definitions (game, api, lambda)
- **api/template.yaml**: SAM CloudFormation infrastructure definition
- **api/samconfig.toml**: SAM deployment configuration

### API Endpoints
- `POST /maps/generate` - Generate AI map using Bedrock
- `GET /maps/{mapId}` - Retrieve map data from DynamoDB
- `POST /maps/{mapId}` - Save map data to DynamoDB
- `GET /sessions/{sessionId}` - Get game session from DynamoDB
- `PUT /sessions/{sessionId}` - Update game session in DynamoDB

### WebSocket Events
- `$connect` - WebSocket connection established
- `$disconnect` - WebSocket connection closed
- `$default` - Handle all WebSocket messages (joinGame, move, generateMap, saveGameState)

### DynamoDB Tables
- **Maps Table**: 
  - Primary Key: `mapId` (string), Sort Key: `version` (string)
  - Stores generated maps with versioning support
- **GameSessions Table**:
  - Primary Key: `sessionId` (string)
  - TTL enabled for automatic session cleanup

## AI Integration

### World Generation System
- **Cloud Integration**: Real-time AI generation via Bedrock API
- **Frontend Access**: Press 'G' key to generate AI maps in-game
- **System Prompt**: `docs/prompts/world-generator.md` embedded in Lambda functions
- **Output**: JSON format directly integrated into game
- **Capabilities**: Creates new themes, 80x40 map arrays, object definitions, exit connections

### Using AI Generation
1. **In-Game**: Press 'G' key for instant AI map generation via backend API
2. **REST API**: POST to `/maps/generate` with theme and description parameters
3. **WebSocket**: Real-time updates during generation process
4. **Automatic Integration**: Generated maps stored in DynamoDB and loaded in game
5. **Versioning**: Maps support multiple versions for iterative generation

## Development Workflow

### Adding New Maps
1. **Frontend approach**: Update MAP_CONFIGS and THEME_CONFIGS in `web/index.html`
2. **AI approach**: Use backend `/maps/generate` API with Bedrock integration
3. **Database approach**: Store maps in DynamoDB via REST API
4. **Testing**: Load `web/index.html` and navigate to new map areas

### Adding New Themes
1. Define objects array in THEME_CONFIGS format
2. Specify object types (alphabet letters), counts, and probabilities
3. Ensure objects follow ASCII character rules

### Adding New Objects
1. Choose unused alphabet letter (A-Z)
2. Add to collision detection in isObstacle() function in `web/index.html`
3. Update backend Bedrock prompts if needed for AI generation
4. Update documentation with object meaning

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

## Deployment and Infrastructure

### AWS Permissions Required
- **AdministratorAccess**: Full administrative access for comprehensive deployment

### Deployment Process
1. **Setup IAM**: Create IAM user with AdministratorAccess policy
2. **Configure AWS CLI**: Set credentials for deployment user
3. **Environment Setup**: Configure `.env` file with deployment parameters
4. **Deploy Backend**: Run `cd api && ./deploy.sh` (creates S3 bucket, Lambda functions, API Gateway)
5. **Deploy Frontend**: Run `cd web && ./deploy.sh` (uploads to S3, auto-detects API endpoints)
6. **Testing**: Verify deployed application functionality

### Key Files for Deployment
- **api/template.yaml**: SAM CloudFormation template
- **api/samconfig.toml**: SAM deployment configuration
- **api/deploy.sh**: Backend deployment script
- **web/deploy.sh**: Frontend deployment script
- **.env**: Shared environment variables for deployment

### Deployment Strategy
- **Independent Stacks**: Frontend and backend deploy separately but share configuration
- **Backend First**: API deployment creates S3 bucket and provides endpoints
- **Frontend Second**: Web deployment auto-detects backend endpoints from CloudFormation
- **No Build Dependencies**: Frontend has no Node.js dependencies or build process
- **Shared Environment**: Single `.env` file manages configuration for both deployments
- **Documentation Separation**: `docs/` contains reference materials, not deployed content

### Known Issues and Solutions
- **Permission Errors**: If deployment fails with AWS permission errors, create dedicated IAM user with AdministratorAccess policy
- **Stack Rollback**: If CloudFormation stack gets stuck in ROLLBACK_COMPLETE, delete stack and redeploy with new name
- **Lambda Layer Issues**: Removed SharedLayer from template due to permission issues
- **S3 Website Config**: Requires administrative permissions for static website hosting

### Development History Notes
- **Project Evolution**: Started as single-file game, evolved to full-stack with AWS SAM backend
- **Architecture Decisions**: Consolidated multiple handler files into single `api/index.ts` for cleaner structure
- **Type Safety**: Implemented TypeScript types organized in `api/types/` directory
- **Structure Simplification**: Moved from shared types directory to backend-only types in `api/types/`
- **Backend Independence**: Moved all Node.js/TypeScript files to `api/` directory for complete separation
- **Environment Management**: Moved from hardcoded values to single `.env` configuration for deployment flexibility
- **Documentation Organization**: Moved prompts to `docs/` following standard project structure conventions
- **Deployment Strategy**: Separated frontend and backend deployment while maintaining shared configuration
- **File Role Clarification**: System prompts embedded in code, not deployed to web (docs are for reference only)
