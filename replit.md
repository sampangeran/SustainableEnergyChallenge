# Renewable Energy City Simulator

## Overview

This is a web-based educational simulation game that teaches users about renewable energy planning and city management. Players design sustainable cities by strategically placing different energy sources on a grid-based map while managing budgets, weather conditions, and energy demands across various city zones.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure JavaScript/HTML/CSS**: No frameworks used, relying on vanilla JavaScript for all functionality
- **Class-based Architecture**: Each major system is implemented as a JavaScript class for modularity
- **Event-driven Design**: Uses custom event listeners and DOM events for inter-component communication
- **Component-based UI**: Modular UI components that can be independently managed and updated

### Core Application Structure
- **Main Controller** (`main.js`): Central orchestrator that coordinates all systems
- **Modular Systems**: Each major feature is separated into its own JavaScript module
- **CSS Grid Layout**: Uses CSS Grid for the main city grid and Flexbox for UI panels
- **Local Storage Persistence**: All game state is saved locally in the browser

## Key Components

### Energy Management System (`energySources.js`)
- Manages different types of renewable energy sources (solar, wind, hydro, geothermal, biomass)
- Handles non-renewable sources (coal, natural gas) for comparison
- Calculates energy output based on weather conditions and terrain placement
- Tracks installation costs and carbon reduction metrics

### City Zone Management (`cityZones.js`)
- Defines three zone types: residential, commercial, and industrial
- Each zone has different energy demands and income generation potential
- Implements energy distribution logic across zones
- Manages population and economic metrics per zone

### Weather System (`weatherSystem.js`)
- Dynamic weather conditions that affect energy production
- Five weather types: sunny, cloudy, windy, rainy, stormy
- Weather-specific multipliers for each energy source type
- Realistic probability and duration modeling

### Budget Management (`budgetManager.js`)
- Tracks city budget, expenses, and revenue
- Calculates ongoing income from powered zones
- Implements financial constraints on energy infrastructure placement
- Provides detailed financial reporting and projections

### Grid-based City Planning
- 2D grid system for placing energy sources and zones
- Terrain-aware placement with bonuses/penalties
- Drag-and-drop interface for intuitive city building
- Visual feedback for valid/invalid placements

### Tutorial System (`tutorial-simple.js`)
- Interactive step-by-step guidance for new users
- Contextual highlighting of UI elements
- Educational content about renewable energy concepts
- Progressive disclosure of game mechanics

### Dashboard and Analytics (`dashboard.js`)
- Real-time energy production and consumption metrics
- Performance charts and historical data tracking
- Sustainability scoring system
- Carbon footprint calculations and environmental impact metrics

## Data Flow

1. **User Input**: Player interactions (clicks, drags) trigger events
2. **State Updates**: Core managers update their internal state
3. **Cross-system Communication**: Systems notify each other of relevant changes
4. **UI Refresh**: Visual elements update to reflect new state
5. **Persistence**: Game state is automatically saved to localStorage

### Key Data Flows:
- **Energy Calculation**: Weather → Energy Sources → Zone Satisfaction → Budget Impact
- **Zone Management**: Population Growth → Energy Demand → Infrastructure Requirements
- **Financial Flow**: Energy Production → Zone Income → Budget Updates → New Construction Capacity

## External Dependencies

### Third-party Libraries
- **Font Awesome 6.0.0**: Icon library for UI elements
- **No JavaScript frameworks**: Intentionally framework-free for educational transparency

### External Assets
- Calvin Institute of Technology logo (hosted on Wikimedia)
- Web fonts from system defaults and CDN resources

## Deployment Strategy

### Static Web Application
- **No backend required**: Completely client-side application
- **Local storage only**: No database or server persistence needed
- **CDN-friendly**: All assets can be served statically
- **Cross-browser compatible**: Uses standard web APIs only

### File Structure
- `index.html`: Main application entry point
- `js/`: All JavaScript modules organized by functionality
- `styles/`: CSS files separated by purpose (main styles, animations)
- `simple-grid-test.html`: Development testing utility

### Browser Requirements
- Modern browser with ES6+ support
- Local storage capability
- Canvas API support for charts and visualizations
- No special permissions or plugins required

### Performance Considerations
- Efficient DOM manipulation with minimal reflows
- Event delegation for grid interactions
- Optimized animation loops and timers
- Modular loading prevents initial bundle bloat

The application is designed to be completely self-contained and can run from any web server or even locally via file:// protocol, making it ideal for educational environments with limited infrastructure requirements.