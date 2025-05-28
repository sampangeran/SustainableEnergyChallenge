/**
 * Main Application Controller
 * Coordinates all systems and manages the overall application state
 */

class RenewableEnergySimulator {
    constructor() {
        this.energyManager = null;
        this.zoneManager = null;
        this.weatherSystem = null;
        this.dashboard = null;
        this.dragDropHandler = null;
        this.tutorialSystem = null;
        this.storageManager = null;
        
        this.isInitialized = false;
        this.isPaused = false;
        this.simulationSpeed = 1;
        
        // Drag selection state
        this.isDragging = false;
        this.dragStartCell = null;
        this.selectedCells = new Set();
        
        this.initialize();
    }

    async initialize() {
        try {
            console.log('Initializing Renewable Energy City Simulator...');
            
            // Initialize core systems
            this.initializeManagers();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load saved data if available
            await this.loadSavedState();
            
            // Start systems
            this.startSystems();
            
            this.isInitialized = true;
            console.log('Simulator initialized successfully');
            
            // Show welcome tutorial if first time user
            this.checkFirstTimeUser();
            
        } catch (error) {
            console.error('Failed to initialize simulator:', error);
            this.showError('Failed to initialize the simulator. Please refresh the page.');
        }
    }

    initializeManagers() {
        // Initialize energy source management
        this.energyManager = new EnergySourceManager();
        
        // Initialize city zone management
        this.zoneManager = new CityZoneManager();
        
        // Initialize weather system
        this.weatherSystem = new WeatherSystem();
        
        // Initialize dashboard
        this.dashboard = new EnergyDashboard(
            this.energyManager,
            this.zoneManager,
            this.weatherSystem
        );
        
        // Initialize drag and drop
        this.dragDropHandler = new DragDropHandler(
            this.energyManager,
            this.zoneManager,
            this.weatherSystem
        );
        
        // Initialize budget planner
        this.budgetPlanner = new BudgetPlanner(this.energyManager, this.zoneManager);
        
        // Initialize tutorial system
        this.tutorialSystem = new TutorialSystem(this);
        
        // Initialize storage manager
        this.storageManager = new StorageManager(this);
        
        // Make budget planner globally accessible for HTML onclick handlers
        window.budgetPlanner = this.budgetPlanner;
    }

    initializeUI() {
        // Generate city grid
        this.generateCityGrid();
        
        // Setup energy source draggables
        this.setupEnergySourceDraggables();
        
        // Initialize mode controls
        this.initializeModeControls();
        
        // Setup weather display
        this.updateWeatherDisplay();
    }

    generateCityGrid() {
        const gridContainer = document.getElementById('city-grid');
        if (!gridContainer) return;

        const { rows, cols } = this.zoneManager.getGridDimensions();
        
        // Clear existing grid
        gridContainer.innerHTML = '';
        
        // Set CSS grid template
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // Generate pre-defined terrain layout
        this.generateTerrainLayout(rows, cols);
        
        // Generate grid cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = this.createGridCell(row, col);
                gridContainer.appendChild(cell);
            }
        }
        
        // Update display to show terrain zones
        this.updateGridDisplay();
    }

    generateTerrainLayout(rows, cols) {
        // Create a realistic terrain layout with fixed specialized zones
        const terrainPlacements = [
            // Forest areas (top-left region)
            { type: 'forest', positions: [[0, 0], [0, 1], [1, 0], [1, 1], [0, 2], [2, 0]] },
            // Mountain area (top-right corner)
            { type: 'mountain', positions: [[0, 8], [0, 9], [1, 8], [1, 9]] },
            // River running through middle
            { type: 'river', positions: [[3, 2], [3, 3], [3, 4], [4, 4], [4, 5], [4, 6], [5, 6]] },
            // Beach area (bottom-right)
            { type: 'beach', positions: [[6, 7], [6, 8], [6, 9], [7, 7], [7, 8], [7, 9]] }
        ];

        // Apply terrain to grid
        terrainPlacements.forEach(terrain => {
            terrain.positions.forEach(([row, col]) => {
                if (row < rows && col < cols) {
                    this.zoneManager.setCellZone(row, col, terrain.type);
                }
            });
        });
    }

    createGridCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.id = `cell-${row}-${col}`;
        
        // Add click handler for zone mode
        cell.addEventListener('click', (e) => {
            // Prevent click if we're in the middle of dragging
            if (this.isDragging || this.dragStartCell) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            this.handleCellClick(row, col, e);
        });
        
        // Add context menu for advanced options
        cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showCellContextMenu(row, col, e);
        });
        
        // Add drag and drop event listeners to each cell
        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dragDropHandler.handleDragOver(e);
        });
        
        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dragDropHandler.handleDrop(e);
        });
        
        cell.addEventListener('dragenter', (e) => {
            e.preventDefault();
        });
        
        cell.addEventListener('dragleave', (e) => {
            this.dragDropHandler.handleDragLeave(e);
        });
        
        return cell;
    }

    setupEnergySourceDraggables() {
        const energySources = document.querySelectorAll('.energy-source[draggable="true"]');
        
        energySources.forEach(source => {
            source.addEventListener('dragstart', (e) => {
                this.dragDropHandler.handleDragStart(e);
            });
            
            source.addEventListener('dragend', (e) => {
                this.dragDropHandler.handleDragEnd(e);
            });
            
            // Add click handler for placement mode
            source.addEventListener('click', (e) => {
                if (e.detail === 1) { // Single click
                    this.setEnergyPlacementMode(source.dataset.type);
                } else if (e.detail === 2) { // Double click
                    this.showEnergySourceInfo(source.dataset.type);
                }
            });
        });
    }

    setEnergyPlacementMode(sourceType) {
        // Clear any existing placement mode
        document.querySelectorAll('.energy-source').forEach(source => {
            source.classList.remove('selected-for-placement');
        });
        
        // Set new placement mode
        this.selectedEnergyType = sourceType;
        const sourceElement = document.querySelector(`[data-type="${sourceType}"]`);
        if (sourceElement) {
            sourceElement.classList.add('selected-for-placement');
        }
        
        // Update mode to energy placement
        this.setMode('energy');
        this.zoneManager.setMode('energy');
        
        // Show notification
        this.showNotification(`Click on a zone cell to place ${sourceType} panels`, 'info');
        
        console.log(`Energy placement mode activated: ${sourceType}`);
    }

    initializeModeControls() {
        const zoneModeBtn = document.getElementById('zone-mode');
        const energyModeBtn = document.getElementById('energy-mode');
        const zoneSelector = document.getElementById('zone-selector');
        
        if (zoneModeBtn) {
            zoneModeBtn.addEventListener('click', () => {
                this.setMode('zone');
            });
        }
        
        if (energyModeBtn) {
            energyModeBtn.addEventListener('click', () => {
                this.setMode('energy');
            });
        }
        
        if (zoneSelector) {
            zoneSelector.addEventListener('change', (e) => {
                this.zoneManager.setSelectedZoneType(e.target.value);
                this.updateGridDisplay();
            });
        }
    }

    setupEventListeners() {
        // Header controls
        this.setupHeaderControls();
        
        // Weather system events
        this.weatherSystem.addEventListener((weatherData) => {
            this.handleWeatherChange(weatherData);
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Grid drag and drop events
        this.setupGridDragDropEvents();
    }

    setupHeaderControls() {
        const tutorialBtn = document.getElementById('tutorial-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                this.tutorialSystem.start();
            });
        }
        
        const budgetBtn = document.getElementById('budget-btn');
        if (budgetBtn) {
            budgetBtn.addEventListener('click', () => {
                this.budgetPlanner.show();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.confirmReset();
            });
        }
    }

    setupGridDragDropEvents() {
        const gridContainer = document.getElementById('city-grid');
        if (!gridContainer) return;
        
        gridContainer.addEventListener('dragover', (e) => {
            this.dragDropHandler.handleDragOver(e);
        });
        
        gridContainer.addEventListener('drop', (e) => {
            this.dragDropHandler.handleDrop(e);
        });
        
        gridContainer.addEventListener('dragleave', (e) => {
            this.dragDropHandler.handleDragLeave(e);
        });

        // Add drag selection events
        gridContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0 && e.target.closest('.grid-cell') && !e.target.closest('.energy-placement')) { 
                // Left mouse button, on a grid cell, but not on an energy source
                this.startDragSelection(e);
            }
        });

        gridContainer.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateDragSelection(e);
            }
        });

        gridContainer.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.endDragSelection(e);
            }
        });

        // Global mouse up to handle drag end outside grid
        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.endDragSelection(e);
            }
        });

        // Prevent context menu during drag
        gridContainer.addEventListener('contextmenu', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    startDragSelection(event) {
        const cellElement = event.target.closest('.grid-cell');
        if (!cellElement) return;

        const [row, col] = cellElement.id.split('-').slice(1).map(Number);
        
        // Set up drag detection with a small delay
        this.dragStartTime = Date.now();
        this.dragStartPosition = { x: event.clientX, y: event.clientY };
        this.dragStartCell = { row, col };
        this.selectedCells.clear();
        this.selectedCells.add(`${row}-${col}`);
        
        // Small delay before considering it a drag operation
        setTimeout(() => {
            if (this.dragStartCell && Date.now() - this.dragStartTime > 50) {
                this.isDragging = true;
                this.updateSelectedCellsDisplay();
            }
        }, 50);
        
        // Prevent text selection during drag
        event.preventDefault();
    }

    updateDragSelection(event) {
        // Check if we have started dragging and moved enough distance
        if (!this.dragStartCell) return;
        
        const distance = Math.sqrt(
            Math.pow(event.clientX - this.dragStartPosition.x, 2) + 
            Math.pow(event.clientY - this.dragStartPosition.y, 2)
        );
        
        // Only start dragging if moved more than 5 pixels
        if (distance > 5 && !this.isDragging) {
            this.isDragging = true;
        }
        
        if (!this.isDragging) return;

        const cellElement = event.target.closest('.grid-cell');
        if (!cellElement) return;

        const [currentRow, currentCol] = cellElement.id.split('-').slice(1).map(Number);
        
        // Calculate selection rectangle
        const startRow = this.dragStartCell.row;
        const startCol = this.dragStartCell.col;
        
        const minRow = Math.min(startRow, currentRow);
        const maxRow = Math.max(startRow, currentRow);
        const minCol = Math.min(startCol, currentCol);
        const maxCol = Math.max(startCol, currentCol);
        
        // Clear previous selection
        this.selectedCells.clear();
        
        // Add all cells in rectangle to selection
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                this.selectedCells.add(`${row}-${col}`);
            }
        }
        
        this.updateSelectedCellsDisplay();
    }

    endDragSelection(event) {
        const wasDragging = this.isDragging;
        const hadDragStart = this.dragStartCell !== null;
        
        // Reset drag state
        this.isDragging = false;
        this.dragStartCell = null;
        this.dragStartTime = null;
        this.dragStartPosition = null;
        
        if (wasDragging) {
            // Apply the current mode action to all selected cells
            const mode = this.zoneManager.getMode();
            
            if (mode === 'zone') {
                this.applyZoneToSelectedCells();
            } else if (mode === 'energy') {
                this.applyEnergyToSelectedCells(event);
            }
            
            // Clear selection after action
            setTimeout(() => {
                this.clearSelection();
            }, 100);
        } else if (hadDragStart) {
            // This was a single click, not a drag
            const cellElement = event.target.closest('.grid-cell');
            if (cellElement) {
                const [row, col] = cellElement.id.split('-').slice(1).map(Number);
                this.handleCellClick(row, col, event);
            }
            this.clearSelection();
        }
    }

    applyZoneToSelectedCells() {
        const selectedZoneType = this.zoneManager.getSelectedZoneType();
        
        this.selectedCells.forEach(cellKey => {
            const [row, col] = cellKey.split('-').map(Number);
            this.handleZoneClick(row, col);
        });
    }

    applyEnergyToSelectedCells(event) {
        // For energy mode, we'll just handle the first cell for now
        // since placing multiple energy sources requires more complex logic
        if (this.selectedCells.size > 0) {
            const firstCell = Array.from(this.selectedCells)[0];
            const [row, col] = firstCell.split('-').map(Number);
            this.handleEnergyClick(row, col, event);
        }
    }

    updateSelectedCellsDisplay() {
        // Clear previous selection styling
        document.querySelectorAll('.grid-cell.drag-selected').forEach(cell => {
            cell.classList.remove('drag-selected');
        });
        
        // Add selection styling to selected cells
        this.selectedCells.forEach(cellKey => {
            const [row, col] = cellKey.split('-').map(Number);
            const cellElement = document.getElementById(`cell-${row}-${col}`);
            if (cellElement) {
                cellElement.classList.add('drag-selected');
            }
        });
    }

    clearSelection() {
        this.selectedCells.clear();
        this.updateSelectedCellsDisplay();
    }

    handleCellClick(row, col, event) {
        // Skip if we just finished dragging
        if (this.isDragging) return;
        
        const mode = this.zoneManager.getMode();
        
        if (mode === 'zone') {
            this.handleZoneClick(row, col);
        } else if (mode === 'energy') {
            this.handleEnergyClick(row, col, event);
        }
    }

    handleZoneClick(row, col) {
        const selectedZoneType = this.zoneManager.getSelectedZoneType();
        const currentZone = this.zoneManager.getCellZone(row, col);
        
        // Check if this is a protected terrain zone
        const protectedTerrains = ['forest', 'mountain', 'beach', 'river'];
        if (protectedTerrains.includes(currentZone)) {
            this.showNotification('Terrain zones cannot be changed - they represent fixed geographical features', 'warning');
            return;
        }
        
        // Only allow placing residential, commercial, and industrial zones
        const allowedZones = ['residential', 'commercial', 'industrial'];
        if (!allowedZones.includes(selectedZoneType)) {
            this.showNotification('You can only place residential, commercial, and industrial zones', 'warning');
            return;
        }
        
        // Toggle zone assignment
        if (currentZone === selectedZoneType) {
            this.zoneManager.setCellZone(row, col, null);
        } else {
            this.zoneManager.setCellZone(row, col, selectedZoneType);
        }
        
        this.updateCellDisplay(row, col);
        this.dashboard.updateDashboard();
    }

    handleEnergyClick(row, col, event) {
        const hasEnergySource = this.zoneManager.hasEnergySource(row, col);
        
        if (hasEnergySource) {
            this.removeEnergySource(row, col);
        } else if (this.selectedEnergyType) {
            // Place the selected energy source
            this.placeEnergySource(row, col, this.selectedEnergyType);
        } else {
            this.showEnergyPlacementOptions(row, col, event);
        }
    }

    removeEnergySource(row, col) {
        const sourceType = this.zoneManager.getEnergySourceAt(row, col);
        
        if (sourceType) {
            // Remove from zone manager
            this.zoneManager.removeEnergySource(row, col);
            
            // Remove from energy manager
            this.energyManager.removeInstallation(sourceType);
            
            // Update entire grid display to refresh power indicators
            this.updateGridDisplay();
            this.dashboard.updateDashboard();
            
            // Show feedback
            this.showNotification(`Removed ${sourceType} energy source`, 'info');
        }
    }

    showEnergyPlacementOptions(row, col, event) {
        const zoneType = this.zoneManager.getCellZone(row, col);
        
        if (!zoneType) {
            this.showNotification('Please assign a zone to this cell first', 'warning');
            return;
        }
        
        // Get recommendations for this location
        const weather = this.weatherSystem.getCurrentWeatherType();
        const recommendations = this.energyManager.getRecommendations(weather, 50000, zoneType);
        
        this.showEnergySourceMenu(row, col, recommendations, event);
    }

    showEnergySourceMenu(row, col, recommendations, event) {
        // Create popup menu for energy source selection
        const menu = document.createElement('div');
        menu.className = 'energy-source-menu';
        menu.style.position = 'absolute';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
        menu.style.zIndex = '1000';
        menu.style.background = 'white';
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '8px';
        menu.style.padding = '8px';
        menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.style.padding = '8px 12px';
            item.style.cursor = 'pointer';
            item.style.borderRadius = '4px';
            
            item.innerHTML = `
                <strong>${rec.name}</strong><br>
                <small>Cost: $${rec.cost.toLocaleString()} | Output: ${Math.round(rec.output)}kW</small><br>
                <small style="color: #666;">${rec.reason}</small>
            `;
            
            item.addEventListener('click', () => {
                this.placeEnergySource(row, col, rec.type);
                document.body.removeChild(menu);
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f0f0f0';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
            
            menu.appendChild(item);
        });
        
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        
        document.addEventListener('click', closeMenu);
        document.body.appendChild(menu);
    }

    placeEnergySource(row, col, sourceType) {
        // Validate placement
        const validation = this.zoneManager.validatePlacement(row, col, sourceType);
        
        if (!validation.valid) {
            this.showNotification(validation.reason, 'error');
            return false;
        }
        
        // Add to managers
        this.energyManager.addInstallation(sourceType);
        this.zoneManager.addEnergySource(row, col, sourceType);
        
        // Update entire grid display to refresh power indicators
        this.updateGridDisplay();
        this.dashboard.updateDashboard();
        
        // Show success feedback
        const source = this.energyManager.getSource(sourceType);
        this.showNotification(`Placed ${source.name} (Cost: $${source.baseCost.toLocaleString()})`, 'success');
        
        return true;
    }

    updateCellDisplay(row, col) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (!cell) return;
        
        const zoneType = this.zoneManager.getCellZone(row, col);
        const energySource = this.zoneManager.getEnergySourceAt(row, col);
        
        // Clear previous classes and content
        cell.className = 'grid-cell';
        cell.innerHTML = '';
        
        // Add zone class
        if (zoneType) {
            cell.classList.add(`zone-${zoneType}`);
            
            // Check if zone is underpowered (only for income-generating zones)
            if (this.energyManager && this.weatherSystem && zoneType) {
                const zone = this.zoneManager.zones.get(zoneType);
                if (zone && zone.income > 0) { // Only check income-generating zones
                    const currentWeather = this.weatherSystem.getCurrentWeather();
                    const weatherType = currentWeather?.type || 'sunny';
                    const totalProduction = this.energyManager.getTotalOutput(weatherType);
                    const totalDemand = this.zoneManager.getTotalEnergyDemand();
                    
                    // Only show power shortage if there's actual demand and insufficient production
                    if (totalDemand > 0 && totalProduction < totalDemand) {
                        const overallRatio = totalProduction / totalDemand;
                        cell.classList.add('underpowered');
                        // Add power deficit indicator
                        const powerIcon = document.createElement('div');
                        powerIcon.className = 'power-status';
                        powerIcon.innerHTML = '⚡';
                        powerIcon.title = `Power shortage: ${Math.round(overallRatio * 100)}% supplied (${currentWeather?.name || 'Sunny'} weather)`;
                        cell.appendChild(powerIcon);
                    }
                }
            }
        }
        
        // Add energy source if present
        if (energySource) {
            cell.classList.add('occupied');
            
            const energyIcon = document.createElement('div');
            energyIcon.className = `energy-placement`;
            energyIcon.dataset.type = energySource;
            
            const iconMap = {
                solar: 'fas fa-sun',
                wind: 'fas fa-fan',
                hydro: 'fas fa-water',
                geothermal: 'fas fa-mountain',
                biomass: 'fas fa-seedling',
                coal: 'fas fa-industry',
                naturalgas: 'fas fa-fire'
            };
            
            energyIcon.innerHTML = `<i class="${iconMap[energySource] || 'fas fa-bolt'}"></i>`;
            cell.appendChild(energyIcon);
        }
    }

    updateGridDisplay() {
        const { rows, cols } = this.zoneManager.getGridDimensions();
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.updateCellDisplay(row, col);
            }
        }
    }

    setMode(mode) {
        this.zoneManager.setMode(mode);
        
        // Update UI
        const zoneModeBtn = document.getElementById('zone-mode');
        const energyModeBtn = document.getElementById('energy-mode');
        
        if (zoneModeBtn && energyModeBtn) {
            zoneModeBtn.classList.toggle('active', mode === 'zone');
            energyModeBtn.classList.toggle('active', mode === 'energy');
        }
        
        // Update cursor and grid state
        const gridContainer = document.getElementById('city-grid');
        if (gridContainer) {
            gridContainer.classList.toggle('zone-mode', mode === 'zone');
            gridContainer.classList.toggle('energy-mode', mode === 'energy');
        }
    }

    handleWeatherChange(weatherData) {
        this.updateWeatherDisplay();
        this.dashboard.updateDashboard();
        
        // Update grid display to reflect weather-affected power shortages
        this.updateGridDisplay();
        
        // Show weather change notification
        const weather = weatherData.current;
        this.showNotification(`Weather changed to ${weather.name}`, 'info');
        
        // Update energy source visual effects
        this.updateEnergySourceEffects(weather);
    }

    updateWeatherDisplay() {
        const weatherDisplay = document.getElementById('current-weather');
        if (!weatherDisplay) return;
        
        const currentWeather = this.weatherSystem.getCurrentWeather();
        if (!currentWeather) return;
        
        const weatherIcon = weatherDisplay.querySelector('.weather-icon');
        const weatherText = weatherDisplay.querySelector('.weather-text');
        const effectsContainer = weatherDisplay.querySelector('.weather-effects');
        
        if (weatherIcon) {
            weatherIcon.className = `weather-icon ${currentWeather.icon}`;
        }
        
        if (weatherText) {
            weatherText.textContent = currentWeather.name;
        }
        
        if (effectsContainer) {
            const effects = this.weatherSystem.getAllWeatherEffects();
            effectsContainer.innerHTML = '';
            
            Object.entries(effects).forEach(([energyType, effect]) => {
                if (effect.multiplier !== 1.0) {
                    const effectElement = document.createElement('span');
                    effectElement.className = 'effect-text';
                    const percentage = Math.round((effect.multiplier - 1) * 100);
                    const sign = percentage >= 0 ? '+' : '';
                    effectElement.textContent = `${energyType}: ${sign}${percentage}%`;
                    effectsContainer.appendChild(effectElement);
                }
            });
        }
        
        // Update weather class on display
        weatherDisplay.className = `weather-info weather-${currentWeather.type}`;
    }

    updateEnergySourceEffects(weather) {
        const energyPlacements = document.querySelectorAll('.energy-placement');
        
        energyPlacements.forEach(placement => {
            const sourceType = placement.dataset.type;
            const effect = weather.getEffect(sourceType);
            
            // Add visual effect based on efficiency
            placement.classList.remove('high-efficiency', 'low-efficiency');
            
            if (effect.multiplier > 1.2) {
                placement.classList.add('high-efficiency');
            } else if (effect.multiplier < 0.8) {
                placement.classList.add('low-efficiency');
            }
        });
    }

    startSystems() {
        // Start weather system
        this.weatherSystem.startWeatherSystem();
        
        // Start dashboard updates
        this.dashboard.start();
    }

    stopSystems() {
        this.weatherSystem.stopWeatherSystem();
        this.dashboard.stop();
    }

    saveState() {
        try {
            this.storageManager.saveState();
            this.showNotification('Game saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save state:', error);
            this.showNotification('Failed to save game', 'error');
        }
    }

    async loadState() {
        try {
            const loaded = await this.storageManager.loadState();
            if (loaded) {
                this.updateGridDisplay();
                this.dashboard.updateDashboard();
                this.showNotification('Game loaded successfully!', 'success');
            } else {
                this.showNotification('No saved game found', 'info');
            }
        } catch (error) {
            console.error('Failed to load state:', error);
            this.showNotification('Failed to load game', 'error');
        }
    }

    async loadSavedState() {
        // Auto-load on startup
        try {
            await this.storageManager.loadState();
        } catch (error) {
            console.warn('No saved state to load:', error);
        }
    }

    autoSave() {
        try {
            this.storageManager.autoSave();
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    confirmReset() {
        const modal = this.createConfirmationModal(
            'Reset Simulation',
            'Are you sure you want to reset the simulation? All progress will be lost.',
            () => this.resetSimulation()
        );
        document.body.appendChild(modal);
    }

    resetSimulation() {
        // Reset all managers
        this.energyManager.reset();
        this.zoneManager.reset();
        this.weatherSystem.reset();
        this.dashboard.reset();
        
        // Clear storage
        this.storageManager.clearStorage();
        
        // Update display
        this.updateGridDisplay();
        this.updateWeatherDisplay();
        
        // Restart systems
        this.startSystems();
        
        this.showNotification('Simulation reset successfully', 'info');
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + S = Save
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.saveState();
        }
        
        // Ctrl/Cmd + O = Load
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
            event.preventDefault();
            this.loadState();
        }
        
        // Space = Pause/Resume
        if (event.key === ' ' && event.target === document.body) {
            event.preventDefault();
            this.togglePause();
        }
        
        // H = Help/Tutorial
        if (event.key === 'h' || event.key === 'H') {
            this.tutorialSystem.start();
        }
        
        // Z = Zone mode
        if (event.key === 'z' || event.key === 'Z') {
            this.setMode('zone');
        }
        
        // E = Energy mode
        if (event.key === 'e' || event.key === 'E') {
            this.setMode('energy');
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.stopSystems();
            this.showNotification('Simulation paused', 'info');
        } else {
            this.startSystems();
            this.showNotification('Simulation resumed', 'info');
        }
    }

    checkFirstTimeUser() {
        const hasVisited = localStorage.getItem('renewableEnergySimulator_hasVisited');
        
        if (!hasVisited) {
            localStorage.setItem('renewableEnergySimulator_hasVisited', 'true');
            
            // Show welcome tutorial after a short delay
            setTimeout(() => {
                this.tutorialSystem.start();
            }, 1000);
        }
    }

    showEnergySourceInfo(sourceType) {
        const source = this.energyManager.getSource(sourceType);
        if (!source) return;
        
        const modal = this.createInfoModal(source);
        document.body.appendChild(modal);
    }

    showCellContextMenu(row, col, event) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'absolute';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
        menu.style.zIndex = '1000';
        menu.style.background = 'white';
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '8px';
        menu.style.padding = '8px';
        menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        
        const zoneType = this.zoneManager.getCellZone(row, col);
        const hasEnergy = this.zoneManager.hasEnergySource(row, col);
        
        // Add context menu options
        if (zoneType) {
            this.addContextMenuItem(menu, `Zone: ${zoneType}`, null);
            this.addContextMenuItem(menu, 'Clear Zone', () => {
                this.zoneManager.setCellZone(row, col, null);
                this.updateCellDisplay(row, col);
            });
        }
        
        if (hasEnergy) {
            const energyType = this.zoneManager.getEnergySourceAt(row, col);
            this.addContextMenuItem(menu, `Energy: ${energyType}`, null);
            this.addContextMenuItem(menu, 'Remove Energy Source', () => {
                this.removeEnergySource(row, col);
            });
        }
        
        this.addContextMenuItem(menu, 'Show Recommendations', () => {
            this.showLocationRecommendations(row, col);
        });
        
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        
        document.addEventListener('click', closeMenu);
        document.body.appendChild(menu);
    }

    addContextMenuItem(menu, text, onClick) {
        const item = document.createElement('div');
        item.className = 'context-menu-item';
        item.style.padding = '8px 12px';
        item.style.cursor = onClick ? 'pointer' : 'default';
        item.style.borderRadius = '4px';
        item.textContent = text;
        
        if (onClick) {
            item.addEventListener('click', onClick);
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f0f0f0';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
        } else {
            item.style.fontWeight = 'bold';
            item.style.color = '#666';
        }
        
        menu.appendChild(item);
    }

    showLocationRecommendations(row, col) {
        const weather = this.weatherSystem.getCurrentWeatherType();
        const recommendations = this.zoneManager.getOptimalPlacements('solar', this.energyManager, weather);
        
        // Find recommendation for this specific cell
        const cellRec = recommendations.find(rec => rec.row === row && rec.col === col);
        
        if (cellRec) {
            this.showNotification(`Recommendation: ${cellRec.reason}`, 'info');
        } else {
            this.showNotification('No specific recommendations for this location', 'info');
        }
    }

    createInfoModal(source) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const weather = this.weatherSystem.getCurrentWeatherType();
        const currentOutput = source.getCurrentOutput(weather);
        const efficiency = source.getEfficiencyRating(weather);
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div id="info-content">
                    <h2>${source.name}</h2>
                    <p><strong>Description:</strong> ${source.description}</p>
                    <hr>
                    <p><strong>Base Cost:</strong> $${source.baseCost.toLocaleString()}</p>
                    <p><strong>Base Output:</strong> ${source.baseOutput} kW</p>
                    <p><strong>Current Output:</strong> ${Math.round(currentOutput)} kW</p>
                    <p><strong>Current Efficiency:</strong> ${efficiency}</p>
                    <p><strong>CO₂ Reduction:</strong> ${source.carbonReduction} tons/year</p>
                    <p><strong>Installations:</strong> ${source.installationCount}</p>
                    <hr>
                    <h4>Weather Effects:</h4>
                    <ul>
                        ${Object.entries(source.weatherMultipliers).map(([weather, multiplier]) => 
                            `<li>${weather}: ${multiplier > 1 ? '+' : ''}${Math.round((multiplier - 1) * 100)}%</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        // Close button handler
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        return modal;
    }

    createConfirmationModal(title, message, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <p>${message}</p>
                <div style="margin-top: 20px; text-align: right;">
                    <button class="btn btn-secondary cancel-btn" style="margin-right: 10px;">Cancel</button>
                    <button class="btn btn-warning confirm-btn">Confirm</button>
                </div>
            </div>
        `;
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            onConfirm();
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        return modal;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            info: '#3498DB'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    getSimulationData() {
        return {
            energyManager: this.energyManager.exportData(),
            zoneManager: this.zoneManager.exportData(),
            weatherSystem: this.weatherSystem.exportData(),
            dashboard: this.dashboard.exportData(),
            timestamp: Date.now(),
            version: '1.0.0'
        };
    }

    loadSimulationData(data) {
        if (!data || !data.version) {
            throw new Error('Invalid simulation data');
        }
        
        try {
            this.energyManager.importData(data.energyManager || {});
            this.zoneManager.importData(data.zoneManager || {});
            this.weatherSystem.importData(data.weatherSystem || {});
            this.dashboard.importData(data.dashboard || {});
            
            return true;
        } catch (error) {
            console.error('Failed to load simulation data:', error);
            return false;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.renewableEnergySimulator = new RenewableEnergySimulator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RenewableEnergySimulator };
}
