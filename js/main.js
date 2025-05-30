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
        
        // Grid selection state
        this.isSelecting = false;
        this.selectedCells = new Set();
        this.startCell = null;
        this.currentSelectionArea = null;
        this.dragStartTimer = null;
        this.isDragging = false;
        this.justFinishedDrag = false;
        
        this.initialize();
    }

    async initialize() {
        try {
            console.log('Initializing Renewable Energy City Simulator...');
            
            // Initialize core systems
            console.log('Step 1: Initializing managers...');
            this.initializeManagers();
            
            // Initialize UI components
            console.log('Step 2: Initializing UI...');
            this.initializeUI();
            
            // Setup event listeners
            console.log('Step 3: Setting up event listeners...');
            this.setupEventListeners();
            
            // Load saved data if available
            console.log('Step 4: Loading saved state...');
            await this.loadSavedState();
            
            // Initialize budget system
            console.log('Step 5: Initializing budget system...');
            this.budgetManager.initialize();
            
            // Start systems
            console.log('Step 6: Starting systems...');
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
        
        // Initialize budget manager
        this.budgetManager = new BudgetManager();
        
        // Initialize tutorial system
        this.tutorialSystem = new SimpleTutorial(this);
        
        // Initialize tooltip system
        if (typeof TooltipSystem !== 'undefined') {
            this.tooltipSystem = new TooltipSystem();
        }
        
        // Initialize storage manager
        this.storageManager = new StorageManager(this);
        
        // Set up budget manager event listeners
        this.budgetManager.addEventListener((budgetData) => {
            this.handleBudgetChange(budgetData);
        });
    }

    // Handle budget changes and update income
    handleBudgetChange(budgetData) {
        // Update monthly income based on current zones
        this.budgetManager.updateIncome(this.zoneManager, this.energyManager, this.weatherSystem);
        
        // Update dashboard if available
        if (this.dashboard) {
            this.dashboard.updateDashboard();
        }
    }

    initializeUI() {
        console.log('initializeUI called');
        
        // Generate city grid
        console.log('About to call generateCityGrid');
        this.generateCityGrid();
        
        // Setup energy source draggables
        this.setupEnergySourceDraggables();
        
        // Setup grid click and drag handlers
        this.setupGridClickHandlers();
        
        // Initialize mode controls
        this.initializeModeControls();
        
        // Setup weather display
        this.updateWeatherDisplay();
        
        console.log('initializeUI completed');
    }

    generateCityGrid() {
        console.log('generateCityGrid called');
        const gridContainer = document.getElementById('city-grid');
        if (!gridContainer) {
            console.error('Grid container not found in generateCityGrid');
            return;
        }
        console.log('Grid container found successfully');

        const { rows, cols } = this.zoneManager.getGridDimensions();
        console.log(`Grid dimensions: ${rows}x${cols}`);
        
        // Clear existing grid
        gridContainer.innerHTML = '';
        
        // Set CSS grid template
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // Generate pre-defined terrain layout
        this.generateTerrainLayout(rows, cols);
        
        // Generate grid cells with working click handlers
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.id = `cell-${row}-${col}`;
                
                // Apply terrain first
                const terrainGrid = this.terrainLayout;
                if (terrainGrid && terrainGrid[row] && terrainGrid[row][col]) {
                    const terrainType = terrainGrid[row][col];
                    this.zoneManager.setCellZone(row, col, terrainType);
                    cell.classList.add(`zone-${terrainType}`);
                }
                
                // Remove direct handlers to enable drag-to-select
                // Events are handled by the grid container now
                
                gridContainer.appendChild(cell);
            }
        }
        
        // Update display to show terrain zones
        this.updateGridDisplay();
        
        // Event delegation is now used for drag-to-select functionality
        console.log('Grid cells created for drag-to-select system');
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
        
        // Add simple, direct click handler that works
        cell.onclick = () => {
            console.log(`Direct click handler: Cell ${row}, ${col}`);
            this.handleCellClick(row, col, null);
        };
        
        // Set initial terrain if this is a terrain zone
        const terrainGrid = this.terrainLayout;
        if (terrainGrid && terrainGrid[row] && terrainGrid[row][col]) {
            const terrainType = terrainGrid[row][col];
            this.zoneManager.setCellZone(row, col, terrainType);
            cell.classList.add(`zone-${terrainType}`);
        }
        
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

        // Temporarily disable drag selection to fix single clicks
        // TODO: Re-implement drag selection properly later
    }

    setupGridClickHandlers() {
        console.log('Setting up grid click handlers...');
        const gridContainer = document.getElementById('city-grid');
        if (!gridContainer) {
            console.error('Grid container not found!');
            return;
        }
        
        // Remove any existing handlers
        const oldClickHandler = this.boundGridClickHandler;
        const oldMouseDownHandler = this.boundGridMouseDownHandler;
        const oldMouseMoveHandler = this.boundGridMouseMoveHandler;
        const oldMouseUpHandler = this.boundGridMouseUpHandler;
        
        if (oldClickHandler) gridContainer.removeEventListener('click', oldClickHandler);
        if (oldMouseDownHandler) gridContainer.removeEventListener('mousedown', oldMouseDownHandler);
        if (oldMouseMoveHandler) gridContainer.removeEventListener('mousemove', oldMouseMoveHandler);
        if (oldMouseUpHandler) document.removeEventListener('mouseup', oldMouseUpHandler);
        
        // Click handler for single cell selection
        this.boundGridClickHandler = (event) => {
            console.log('Click handler triggered');
            // Skip if we just finished a drag selection
            if (this.justFinishedDrag) {
                console.log('Skipping click - just finished drag');
                this.justFinishedDrag = false;
                return;
            }
            
            // Skip if we're currently dragging
            if (this.isDragging || this.isSelecting) {
                console.log('Skipping click - currently dragging');
                return;
            }
            
            const cell = event.target.closest('.grid-cell');
            if (!cell) {
                console.log('No cell found for click');
                return;
            }
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (isNaN(row) || isNaN(col)) {
                console.log('Invalid coordinates for click');
                return;
            }
            
            console.log(`Processing single click on ${row}, ${col}`);
            this.handleCellClick(row, col, event);
        };
        
        // Mouse down handler for starting drag selection
        this.boundGridMouseDownHandler = (event) => {
            console.log('Mouse down detected on grid!');
            // Only handle left mouse button
            if (event.button !== 0) return;
            
            const cell = event.target.closest('.grid-cell');
            if (!cell) {
                console.log('No cell found for mousedown');
                return;
            }
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (isNaN(row) || isNaN(col)) {
                console.log('Invalid coordinates for mousedown');
                return;
            }
            
            console.log(`Mouse down on cell ${row}, ${col}`);
            // Immediately start selection
            this.isDragging = true;
            this.startDragSelection(row, col, event);
        };
        
        // Mouse move handler for updating drag selection  
        this.boundGridMouseMoveHandler = (event) => {
            if (!this.isDragging || !this.isSelecting) return;
            
            console.log('Mouse move during drag selection');
            const cell = event.target.closest('.grid-cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (isNaN(row) || isNaN(col)) return;
            
            console.log(`Updating drag selection to ${row}, ${col}`);
            this.updateDragSelection(row, col);
        };
        
        // Mouse up handler for ending drag selection
        this.boundGridMouseUpHandler = (event) => {
            console.log('Mouse up event detected');
            if (this.isDragging) {
                console.log('Ending drag selection');
                this.isDragging = false;
                
                if (this.isSelecting) {
                    this.endDragSelection();
                }
            }
        };
        
        // Add event listeners
        gridContainer.addEventListener('click', this.boundGridClickHandler);
        gridContainer.addEventListener('mousedown', this.boundGridMouseDownHandler);
        gridContainer.addEventListener('mousemove', this.boundGridMouseMoveHandler);
        document.addEventListener('mouseup', this.boundGridMouseUpHandler);
        
        console.log('Grid click and drag handlers set up successfully');
    }

    startDragSelection(row, col, event) {
        // Prevent text selection during drag
        event.preventDefault();
        
        console.log(`Starting drag selection at ${row}, ${col}`);
        this.isSelecting = true;
        this.startCell = { row, col };
        this.selectedCells.clear();
        
        // Clear any previous selection highlights
        this.clearCellSelections();
        
        // Add initial cell to selection
        this.selectedCells.add(`${row}-${col}`);
        this.highlightSelectedCells();
        
        console.log(`Drag selection started successfully`);
    }
    
    updateDragSelection(row, col) {
        if (!this.isSelecting || !this.startCell) return;
        
        // Clear previous selection
        this.selectedCells.clear();
        
        // Calculate selection rectangle
        const minRow = Math.min(this.startCell.row, row);
        const maxRow = Math.max(this.startCell.row, row);
        const minCol = Math.min(this.startCell.col, col);
        const maxCol = Math.max(this.startCell.col, col);
        
        // Add all cells in rectangle to selection
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                this.selectedCells.add(`${r}-${c}`);
            }
        }
        
        this.highlightSelectedCells();
    }
    
    endDragSelection() {
        console.log(`Ending drag selection with ${this.selectedCells.size} cells selected`);
        this.isSelecting = false;
        this.justFinishedDrag = true;
        
        if (this.selectedCells.size > 1) {
            console.log(`Selected ${this.selectedCells.size} cells for bulk action`);
            this.showBulkActionMenu();
        } else if (this.selectedCells.size === 1) {
            // Handle single cell selection like a normal click
            const cellKey = Array.from(this.selectedCells)[0];
            const [row, col] = cellKey.split('-').map(Number);
            this.clearCellSelections();
            // Allow single click to work normally after short delay
            setTimeout(() => {
                this.handleCellClick(row, col, { target: document.getElementById(`cell-${row}-${col}`) });
            }, 50);
        }
        
        this.startCell = null;
        
        // Reset the drag flag after a short delay
        setTimeout(() => {
            this.justFinishedDrag = false;
            console.log('Drag flag reset - single clicks enabled');
        }, 300);
    }
    
    clearCellSelections() {
        // Remove selection highlighting from all cells
        document.querySelectorAll('.grid-cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        this.selectedCells.clear();
    }
    
    highlightSelectedCells() {
        console.log(`Highlighting ${this.selectedCells.size} selected cells`);
        
        // Remove highlights from all cells first
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('selected');
            cell.style.border = '';
            cell.style.backgroundColor = '';
        });
        
        // Add selection highlight to selected cells
        this.selectedCells.forEach(cellKey => {
            const [row, col] = cellKey.split('-').map(Number);
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (cell) {
                cell.classList.add('selected');
                cell.style.border = '3px solid #007bff';
                cell.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                console.log(`Highlighted cell ${row}, ${col}`);
            }
        });
    }
    
    showBulkActionMenu() {
        console.log('showBulkActionMenu called');
        const selectedArray = Array.from(this.selectedCells);
        const currentMode = this.zoneManager.getMode();
        console.log(`Current mode: ${currentMode}`);
        
        if (currentMode === 'energy') {
            // Handle energy source placement for multiple cells
            console.log(`Auto-placing energy sources on ${selectedArray.length} cells`);
            this.bulkPlaceEnergySource();
        } else {
            // Handle zone assignment for multiple cells
            console.log(`Auto-assigning ${selectedArray.length} cells to selected zone type`);
            
            // Get the currently selected zone type from the zone selector
            const selectedZoneType = this.zoneManager.getSelectedZoneType();
            console.log(`Current zone type selected: ${selectedZoneType}`);
            
            if (selectedZoneType && selectedZoneType !== 'none') {
                // Automatically assign selected cells to the current zone type
                this.bulkSetZone(selectedZoneType);
            } else {
                // Fallback to prompt if no zone is selected
                const choice = prompt(`You have selected ${selectedArray.length} cells.\n\nChoose zone type:\n1 - Residential\n2 - Commercial\n3 - Industrial\n\nEnter 1, 2, or 3:`);
                
                if (choice === '1') {
                    this.bulkSetZone('residential');
                } else if (choice === '2') {
                    this.bulkSetZone('commercial');
                } else if (choice === '3') {
                    this.bulkSetZone('industrial');
                } else {
                    this.clearCellSelections();
                }
            }
        }
    }
    
    bulkPlaceEnergySource() {
        // Get the currently selected energy source type
        const selectedEnergyType = this.selectedEnergyType;
        console.log(`Current energy type selected: ${selectedEnergyType}`);
        
        if (!selectedEnergyType) {
            this.showNotification('Please select an energy source type first', 'warning');
            this.clearCellSelections();
            return;
        }
        
        const cellCount = this.selectedCells.size;
        let placedCount = 0;
        let skippedCount = 0;
        let errors = [];
        
        // Place energy sources on all selected cells
        this.selectedCells.forEach(cellKey => {
            const [row, col] = cellKey.split('-').map(Number);
            
            try {
                // Check if placement is valid
                const validationResult = this.zoneManager.validatePlacement(row, col, selectedEnergyType);
                
                if (validationResult.valid === true) {
                    // Check budget before placement
                    if (this.budgetManager.canAfford(selectedEnergyType)) {
                        // Purchase and place the energy source
                        if (this.budgetManager.purchaseEnergySource(selectedEnergyType)) {
                            this.zoneManager.addEnergySource(row, col, selectedEnergyType);
                            this.energyManager.addInstallation(selectedEnergyType);
                            this.updateCellDisplay(row, col);
                            placedCount++;
                            console.log(`Placed ${selectedEnergyType} at ${row}, ${col}`);
                        } else {
                            skippedCount++;
                            const errorMessage = 'Insufficient funds';
                            if (!errors.includes(errorMessage)) {
                                errors.push(errorMessage);
                            }
                            console.log(`Skipped ${row}, ${col}: ${errorMessage}`);
                        }
                    } else {
                        skippedCount++;
                        const errorMessage = 'Insufficient funds';
                        if (!errors.includes(errorMessage)) {
                            errors.push(errorMessage);
                        }
                        console.log(`Skipped ${row}, ${col}: ${errorMessage}`);
                    }
                } else {
                    skippedCount++;
                    const errorMessage = validationResult.reason || 'Invalid placement';
                    if (!errors.includes(errorMessage)) {
                        errors.push(errorMessage);
                    }
                    console.log(`Skipped ${row}, ${col}: ${errorMessage}`);
                }
            } catch (error) {
                skippedCount++;
                console.log(`Error placing energy source at ${row}, ${col}: ${error.message}`);
            }
        });
        
        // Clear selection
        this.clearCellSelections();
        
        // Update income calculation after energy source changes
        if (placedCount > 0) {
            // Force a full grid refresh to update all power indicators
            this.updateGridDisplay();
            this.budgetManager.updateIncome(this.zoneManager, this.energyManager, this.weatherSystem);
            this.dashboard.updateDashboard();
        }
        
        // Show appropriate notification
        if (placedCount > 0 && skippedCount > 0) {
            this.showNotification(`Placed ${placedCount} ${selectedEnergyType} sources (${skippedCount} cells skipped)`, 'success');
        } else if (placedCount > 0) {
            this.showNotification(`Placed ${placedCount} ${selectedEnergyType} sources`, 'success');
        } else if (skippedCount > 0) {
            const reason = errors.length > 0 ? errors[0] : 'Invalid placement';
            this.showNotification(`Cannot place energy sources: ${reason}`, 'warning');
        }
    }
    
    bulkSetZone(zoneType) {
        // Store count before clearing
        const cellCount = this.selectedCells.size;
        let assignedCount = 0;
        let skippedTerrain = 0;
        
        // Apply zone type to all selected cells (except terrain)
        this.selectedCells.forEach(cellKey => {
            const [row, col] = cellKey.split('-').map(Number);
            
            // Check if cell has terrain using zone manager
            const currentZone = this.zoneManager.getCellZone(row, col);
            
            // Check if cell has terrain (forest, mountain, beach, river)
            if (currentZone === 'forest' || currentZone === 'mountain' || 
                currentZone === 'beach' || currentZone === 'river') {
                skippedTerrain++;
                console.log(`Skipping terrain cell at ${row}, ${col} (type: ${currentZone})`);
            } else {
                this.zoneManager.setCellZone(row, col, zoneType);
                this.updateCellDisplay(row, col);
                assignedCount++;
            }
        });
        
        // Clear selection and remove menu
        this.clearCellSelections();
        const menu = document.querySelector('.bulk-action-menu');
        if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
        
        // Update income calculation after zone changes
        if (assignedCount > 0) {
            // Force a full grid refresh to update all power indicators
            setTimeout(() => {
                this.updateGridDisplay();
                this.budgetManager.updateIncome(this.zoneManager, this.energyManager, this.weatherSystem);
                this.dashboard.updateDashboard();
            }, 50);
        }
        
        // Show appropriate notification
        if (assignedCount > 0 && skippedTerrain > 0) {
            this.showNotification(`Set ${assignedCount} cells to ${zoneType} zone (${skippedTerrain} terrain cells protected)`, 'success');
        } else if (assignedCount > 0) {
            this.showNotification(`Set ${assignedCount} cells to ${zoneType} zone`, 'success');
        } else if (skippedTerrain > 0) {
            this.showNotification(`Cannot assign zones to terrain cells (${skippedTerrain} cells protected)`, 'warning');
        }
    }

    handleCellClick(row, col, event) {
        console.log(`Cell clicked: ${row}, ${col}`);
        const mode = this.zoneManager.getMode();
        console.log(`Current mode: ${mode}`);
        
        if (mode === 'zone') {
            console.log('Handling zone click');
            this.handleZoneClick(row, col);
        } else if (mode === 'energy') {
            console.log('Handling energy click');
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
        this.budgetManager.updateIncome(this.zoneManager, this.energyManager, this.weatherSystem);
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
            // Get source info before removal
            const source = this.energyManager.getSource(sourceType);
            const refund = Math.round(source.baseCost * 0.7);
            
            // Remove from zone manager
            this.zoneManager.removeEnergySource(row, col);
            
            // Remove from energy manager
            this.energyManager.removeInstallation(sourceType);
            
            // Process refund
            this.budgetManager.sellEnergySource(sourceType);
            
            // Force budget display update
            this.budgetManager.updateBudgetDisplay();
            
            // Update entire grid display to refresh power indicators
            this.updateGridDisplay();
            this.budgetManager.updateIncome(this.zoneManager, this.energyManager, this.weatherSystem);
            this.dashboard.updateDashboard();
            
            // Show feedback with refund info
            this.showNotification(`Removed ${source.name} (Refund: $${refund.toLocaleString()})`, 'info');
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
        
        // Check budget before placement
        if (!this.budgetManager.canAfford(sourceType)) {
            this.showNotification('Insufficient funds for this energy source', 'error');
            return false;
        }
        
        // Purchase energy source
        if (!this.budgetManager.purchaseEnergySource(sourceType)) {
            this.showNotification('Purchase failed - insufficient funds', 'error');
            return false;
        }
        
        // Add to managers
        this.energyManager.addInstallation(sourceType);
        this.zoneManager.addEnergySource(row, col, sourceType);
        
        // Update entire grid display to refresh power indicators
        this.updateGridDisplay();
        this.budgetManager.updateIncome(this.zoneManager, this.energyManager, this.weatherSystem);
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
            
            // Check if city has insufficient power for income-generating zones
            if (this.energyManager && this.weatherSystem && zoneType) {
                const zone = this.zoneManager.zones.get(zoneType);
                if (zone && zone.income > 0) { // Only check income-generating zones
                    const currentWeather = this.weatherSystem.getCurrentWeather();
                    
                    // Check city-wide power balance (shared power grid)
                    const totalProduction = this.zoneManager.getTotalEnergyProduction(this.energyManager, currentWeather);
                    const totalDemand = this.zoneManager.getTotalEnergyDemand();
                    const cityEfficiency = totalDemand > 0 ? (totalProduction / totalDemand) * 100 : 100;
                    
                    // Show power shortage if city-wide production is insufficient
                    if (totalProduction < totalDemand && zone.cells.size > 0) {
                        cell.classList.add('underpowered');
                        // Add power deficit indicator
                        const powerIcon = document.createElement('div');
                        powerIcon.className = 'power-status';
                        powerIcon.innerHTML = '⚡';
                        powerIcon.title = `City underpowered: ${Math.round(cityEfficiency)}% efficiency (${currentWeather?.name || 'Sunny'} weather)`;
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
        this.budgetManager.reset();
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
        // Get or create notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 320px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            `;
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
            word-wrap: break-word;
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
        
        // Add to container
        container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        container.removeChild(notification);
                        // Remove container if empty
                        if (container.children.length === 0) {
                            document.body.removeChild(container);
                        }
                    }
                }, 300);
            }
        }, 4000);
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
            budgetManager: this.budgetManager.exportData(),
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
            this.budgetManager.importData(data.budgetManager || {});
            
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
