# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Endless Land is an AI-powered RPG game with procedurally generated maps, stories, and endless gameplay possibilities. The current implementation is a single-file HTML/CSS/JavaScript application that provides a basic ASCII RPG interface.

## Architecture
- **Single-file application**: All game logic, styling, and HTML are contained in `index.html`
- **Game engine**: Pure JavaScript class-based architecture (`SimpleRPG` class)
- **Rendering**: Text-based map rendering using ASCII characters in a pre-formatted div
- **Input handling**: Keyboard event listeners for WASD movement
- **Game state**: In-memory JavaScript objects for map, player position, and game state

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

## Game Components
- **Map system**: Large scrolling maps (80x40) with viewport system (35x20)
- **Multiple themed maps**: 7 interconnected maps with different themes (forest, plains, desert, mountains, village, cave, lake)
- **Map transitions**: Wall gaps as exits, 3-wide openings connecting maps
- **ASCII representation**: `.` = empty, `#` = wall, `T` = tree, `C` = cactus, `R` = rock, `H` = house, `S` = stalactite, `W` = water
- **Camera system**: Player-centered viewport that scrolls with movement
- **Object placement**: Theme-specific random object generation with collision avoidance

## Gameplay Design
- **Controls**: Arrow keys for player movement (not WASD)
- **Input philosophy**: All game interactions should be keyboard-only (no mouse required)
- **Future features**: AI-powered procedural generation for maps and stories
