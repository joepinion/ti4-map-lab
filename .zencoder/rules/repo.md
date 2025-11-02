---
description: Repository Information Overview
alwaysApply: true
---

# TI4 Map Lab Information

## Summary
TI4 Map Lab is a React-based web application for creating and editing Twilight Imperium 4 (TI4) game maps. The application allows users to manipulate hexagonal tiles, planets, and various map elements with specialized editors. It provides interactive visualization of game maps with support for multiple layout configurations and evaluators. The project is deployed to GitHub Pages at https://joepinion.github.io/ti4-map-lab.

## Structure
The project follows a standard Create React App structure:
- **src/**: Application source code including React components, utilities, and styling
  - **index.js**: Main application entry point
  - **map-components.js**: Core map visualization components
  - **map-logic.js**: Map manipulation and game logic
  - **evaluator-components.js**: Evaluator UI components
  - **editors/**: Specialized editor modules (map-editor, layout-editor, eval-editor, base-editor)
  - **data/**: Game data files (tile_data.js, warp_data.js, default_layouts.json, default_evaluators.json)
  - **styles/**: SCSS stylesheets with responsive design
- **public/**: Static assets including HTML template, icons, and web fonts
- **build/**: Production build output

## Language & Runtime
**Language**: JavaScript (ES6+) with React
**React Version**: 16.9.0
**Node.js**: v18.10.0 (recommended)
**Package Manager**: Yarn
**Build System**: react-scripts (Create React App)

## Dependencies
**Main Dependencies**:
- react (^16.9.0): Core React library for UI components
- react-dom (^16.9.0): React DOM rendering
- react-scripts (3.1.1): Create React App build configuration
- bulma (^0.7.5): CSS framework for responsive UI
- sass (^1.22.10): SCSS compiler for styling
- jquery (^3.4.1): DOM manipulation utilities
- local-storage (^2.0.0): Local storage management
- gh-pages (^2.1.1): GitHub Pages deployment tool

**Development Dependencies**:
- eslint-utils (^1.4.3): ESLint utility functions

## Build & Installation
```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Build for production
yarn build

# Deploy to GitHub Pages
yarn run predeploy
yarn run deploy
```

Development server runs on http://localhost:3000 with hot reloading enabled. The build script uses legacy OpenSSL provider for Node.js compatibility.

## Main Entry Points
- **src/index.js**: React application root that renders to index.html
- **public/index.html**: HTML template file served by development and production builds
- **src/map-components.js**: Contains primary map visualization components
- **src/map-logic.js**: Contains core game logic and map manipulation functions

## Application Features
- Interactive hexagonal tile-based map editor
- Multiple map layouts support
- Planet and resource visualization
- Specialized evaluators for map analysis
- SCSS-based responsive design with three breakpoints (small, medium, large)
- Local storage for saving user configurations
- Service worker for offline support
