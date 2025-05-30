/**
 * Drag and Drop Handler
 * Manages interactive drag-and-drop functionality for energy source placement
 */

class DragDropHandler {
    constructor(energyManager, zoneManager, weatherSystem) {
        this.energyManager = energyManager;
        this.zoneManager = zoneManager;
        this.weatherSystem = weatherSystem;
        
        this.draggedElement = null;
        this.draggedSourceType = null;
        this.dropTargetCell = null;
        this.dragPreview = null;
        this.validDropZones = [];
        
        this.initializeDragDropStyles();
    }

    initializeDragDropStyles() {
        // Add dynamic styles for drag and drop feedback
        const style = document.createElement('style');
        style.textContent = `
            .grid-cell.drop-target {
                border: 2px dashed hsl(var(--accent-color)) !important;
                background: hsl(var(--accent-color) / 0.1) !important;
                transform: scale(1.02);
                transition: all 0.2s ease;
            }
            
            .grid-cell.drop-target.valid {
                border-color: hsl(var(--success));
                background: hsl(var(--success) / 0.1);
            }
            
            .grid-cell.drop-target.invalid {
                border-color: hsl(var(--danger));
                background: hsl(var(--danger) / 0.1);
            }
            
            .energy-source.dragging {
                opacity: 0.5;
                transform: rotate(5deg) scale(0.95);
                z-index: 1000;
                pointer-events: none;
            }
            
            .drag-preview {
                position: fixed;
                pointer-events: none;
                z-index: 1001;
                background: white;
                border: 2px solid hsl(var(--primary-color));
                border-radius: 8px;
                padding: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                transform: translate(-50%, -50%);
                opacity: 0.9;
            }
            
            .drop-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: hsl(var(--accent-color));
                animation: pulse 1s infinite;
                pointer-events: none;
                z-index: 10;
            }
            
            .cost-indicator {
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: hsl(var(--text-primary));
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);
    }

    handleDragStart(event) {
        this.draggedElement = event.target.closest('.energy-source');
        this.draggedSourceType = this.draggedElement.dataset.type;
        
        // Add dragging class
        this.draggedElement.classList.add('dragging');
        
        // Set drag data with fallback
        if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', this.draggedSourceType);
            event.dataTransfer.setData('application/json', JSON.stringify({
                type: this.draggedSourceType
            }));
            event.dataTransfer.effectAllowed = 'copy';
        }
        
        // Store in global variable as backup
        window.currentDraggedType = this.draggedSourceType;
        
        // Create drag preview
        this.createDragPreview(event);
        
        // Highlight valid drop zones
        this.highlightValidDropZones();
        
        // Update cursor
        document.body.style.cursor = 'grabbing';
        
        console.log(`Started dragging ${this.draggedSourceType}`);
    }

    handleDragEnd(event) {
        // Clean up dragging state
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        // Remove drag preview
        this.removeDragPreview();
        
        // Clear drop zone highlights
        this.clearDropZoneHighlights();
        
        // Reset cursor
        document.body.style.cursor = '';
        
        // Clear references
        this.draggedElement = null;
        this.draggedSourceType = null;
        this.dropTargetCell = null;
        
        console.log('Drag operation ended');
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        
        const cell = event.target.closest('.grid-cell');
        if (!cell) return;
        
        // Update drop target
        if (this.dropTargetCell !== cell) {
            this.clearDropTargetHighlight();
            this.dropTargetCell = cell;
            this.updateDropTargetHighlight();
        }
        
        // Update drag preview position
        this.updateDragPreview(event);
    }

    handleDragLeave(event) {
        const cell = event.target.closest('.grid-cell');
        
        // Only clear if leaving the grid entirely
        if (!cell || !event.currentTarget.contains(event.relatedTarget)) {
            this.clearDropTargetHighlight();
            this.dropTargetCell = null;
        }
    }

    handleDrop(event) {
        event.preventDefault();
        console.log('Drop event triggered!');
        
        const cell = event.target.closest('.grid-cell');
        if (!cell) {
            console.log('No grid cell found for drop');
            return;
        }
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Try multiple ways to get the source type
        let sourceType = this.draggedSourceType;
        if (!sourceType && event.dataTransfer) {
            sourceType = event.dataTransfer.getData('text/plain');
        }
        if (!sourceType && event.dataTransfer) {
            try {
                const jsonData = event.dataTransfer.getData('application/json');
                if (jsonData) {
                    const parsed = JSON.parse(jsonData);
                    sourceType = parsed.type;
                }
            } catch (e) {}
        }
        if (!sourceType) {
            sourceType = window.currentDraggedType;
        }
        
        console.log(`Attempting to drop ${sourceType} at ${row},${col}`);
        
        // Validate and place energy source
        const success = this.attemptPlacement(row, col, sourceType);
        
        if (success) {
            this.showSuccessEffect(cell);
            this.playSuccessSound();
        } else {
            this.showErrorEffect(cell);
            this.playErrorSound();
        }
        
        // Clean up
        this.clearDropTargetHighlight();
    }

    attemptPlacement(row, col, sourceType) {
        console.log(`Validating placement of ${sourceType} at ${row},${col}`);
        
        // Validate placement
        const validation = this.zoneManager.validatePlacement(row, col, sourceType);
        console.log('Validation result:', validation);
        
        if (!validation.valid) {
            console.log('Placement failed validation:', validation.reason);
            this.showPlacementError(validation.reason);
            return false;
        }
        
        // Check if cell already has energy source
        if (this.zoneManager.hasEnergySource(row, col)) {
            console.log('Cell already has energy source');
            this.showPlacementError('Cell already has an energy source');
            return false;
        }
        
        // Get source information
        const source = this.energyManager.getSource(sourceType);
        if (!source) {
            console.log('Invalid energy source type:', sourceType);
            this.showPlacementError('Invalid energy source type');
            return false;
        }
        
        console.log('Placing energy source:', sourceType);
        
        // Place the energy source
        this.energyManager.addInstallation(sourceType);
        this.zoneManager.addEnergySource(row, col, sourceType);
        
        // Update entire grid display to refresh power indicators
        this.mainApp.updateGridDisplay();
        
        console.log('Energy source placed successfully');
        
        // Show placement feedback
        this.showPlacementSuccess(source, row, col);
        
        return true;
    }

    createDragPreview(event) {
        const source = this.energyManager.getSource(this.draggedSourceType);
        if (!source) return;
        
        this.dragPreview = document.createElement('div');
        this.dragPreview.className = 'drag-preview';
        
        const weather = this.weatherSystem.getCurrentWeatherType();
        const currentOutput = source.getCurrentOutput(weather);
        const efficiency = source.getEfficiencyRating(weather);
        
        this.dragPreview.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="energy-icon" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; background: var(--${this.draggedSourceType}-color, #666);">
                    <i class="${this.getEnergyIcon(this.draggedSourceType)}"></i>
                </div>
                <div>
                    <strong>${source.name}</strong><br>
                    <small>Cost: $${source.baseCost.toLocaleString()}</small><br>
                    <small>Output: ${Math.round(currentOutput)}kW (${efficiency})</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.dragPreview);
        
        // Position preview at cursor
        this.updateDragPreview(event);
    }

    updateDragPreview(event) {
        if (!this.dragPreview) return;
        
        this.dragPreview.style.left = `${event.clientX}px`;
        this.dragPreview.style.top = `${event.clientY}px`;
    }

    removeDragPreview() {
        if (this.dragPreview && this.dragPreview.parentNode) {
            document.body.removeChild(this.dragPreview);
        }
        this.dragPreview = null;
    }

    highlightValidDropZones() {
        const gridCells = document.querySelectorAll('.grid-cell');
        this.validDropZones = [];
        
        gridCells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            const validation = this.zoneManager.validatePlacement(row, col, this.draggedSourceType);
            const hasExistingSource = this.zoneManager.hasEnergySource(row, col);
            
            if (validation.valid && !hasExistingSource) {
                cell.classList.add('drop-target', 'valid');
                this.validDropZones.push(cell);
                
                // Add cost indicator
                this.addCostIndicator(cell);
            } else {
                cell.classList.add('drop-target', 'invalid');
            }
        });
        
        console.log(`Highlighted ${this.validDropZones.length} valid drop zones`);
    }

    clearDropZoneHighlights() {
        const dropTargets = document.querySelectorAll('.drop-target');
        dropTargets.forEach(cell => {
            cell.classList.remove('drop-target', 'valid', 'invalid');
            this.removeCostIndicator(cell);
        });
        this.validDropZones = [];
    }

    updateDropTargetHighlight() {
        if (!this.dropTargetCell) return;
        
        const row = parseInt(this.dropTargetCell.dataset.row);
        const col = parseInt(this.dropTargetCell.dataset.col);
        
        const validation = this.zoneManager.validatePlacement(row, col, this.draggedSourceType);
        const hasExistingSource = this.zoneManager.hasEnergySource(row, col);
        
        // Add drop indicator
        if (validation.valid && !hasExistingSource) {
            this.addDropIndicator(this.dropTargetCell);
        } else {
            this.removeDropIndicator(this.dropTargetCell);
        }
    }

    clearDropTargetHighlight() {
        if (this.dropTargetCell) {
            this.removeDropIndicator(this.dropTargetCell);
        }
    }

    addDropIndicator(cell) {
        this.removeDropIndicator(cell);
        
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        indicator.innerHTML = '<i class="fas fa-plus"></i>';
        cell.appendChild(indicator);
    }

    removeDropIndicator(cell) {
        const indicator = cell.querySelector('.drop-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    addCostIndicator(cell) {
        const source = this.energyManager.getSource(this.draggedSourceType);
        if (!source) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'cost-indicator';
        indicator.textContent = `$${source.baseCost.toLocaleString()}`;
        cell.appendChild(indicator);
    }

    removeCostIndicator(cell) {
        const indicator = cell.querySelector('.cost-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateCellDisplay(row, col) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (!cell) return;
        
        const zoneType = this.zoneManager.getCellZone(row, col);
        const energySource = this.zoneManager.getEnergySourceAt(row, col);
        
        // Clear previous classes and content
        cell.className = 'grid-cell';
        cell.innerHTML = '';
        
        // Add zone class and icon
        if (zoneType) {
            cell.classList.add(`zone-${zoneType}`);
            
            // Add zone icon
            const zoneIcon = document.createElement('div');
            zoneIcon.className = 'zone-icon';
            
            const zoneIconMap = {
                residential: '🏠',
                commercial: '🏢', 
                industrial: '🏭'
            };
            
            zoneIcon.innerHTML = zoneIconMap[zoneType] || '';
            cell.appendChild(zoneIcon);
        }
        
        // Add energy source if present
        if (energySource) {
            cell.classList.add('occupied');
            
            const energyIcon = document.createElement('div');
            energyIcon.className = 'energy-placement';
            energyIcon.dataset.type = energySource;
            energyIcon.innerHTML = `<i class="${this.getEnergyIcon(energySource)}"></i>`;
            
            cell.appendChild(energyIcon);
            
            // Add energy flow animation
            this.addEnergyFlowEffect(cell, energySource);
        }
    }

    getEnergyIcon(sourceType) {
        const iconMap = {
            solar: 'fas fa-sun',
            wind: 'fas fa-fan',
            hydro: 'fas fa-water',
            geothermal: 'fas fa-mountain',
            biomass: 'fas fa-seedling',
            coal: 'fas fa-industry',
            naturalgas: 'fas fa-fire'
        };
        return iconMap[sourceType] || 'fas fa-bolt';
    }

    addEnergyFlowEffect(cell, sourceType) {
        // Create energy flow particles
        const particleCount = 3;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createEnergyParticle(cell, sourceType);
            }, i * 200);
        }
    }

    createEnergyParticle(cell, sourceType) {
        const particle = document.createElement('div');
        particle.className = `energy-flow ${sourceType}`;
        
        const rect = cell.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        
        document.body.appendChild(particle);
        
        // Animate particle
        const animation = particle.animate([
            { 
                transform: 'translate(0, 0) scale(0.5)',
                opacity: 0.8
            },
            {
                transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1)`,
                opacity: 1
            },
            {
                transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0.5)`,
                opacity: 0
            }
        ], {
            duration: 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.addEventListener('finish', () => {
            if (particle.parentNode) {
                document.body.removeChild(particle);
            }
        });
    }

    showSuccessEffect(cell) {
        cell.classList.add('success-animation');
        
        setTimeout(() => {
            cell.classList.remove('success-animation');
        }, 600);
        
        // Create success particles
        this.createSuccessParticles(cell);
    }

    showErrorEffect(cell) {
        cell.classList.add('error-animation');
        
        setTimeout(() => {
            cell.classList.remove('error-animation');
        }, 600);
    }

    createSuccessParticles(cell) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: hsl(var(--success));
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${centerX}px;
                top: ${centerY}px;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;
            
            const animation = particle.animate([
                {
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 1
                },
                {
                    transform: `translate(calc(${endX - centerX}px - 50%), calc(${endY - centerY}px - 50%)) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `translate(calc(${endX - centerX}px - 50%), calc(${endY - centerY}px - 50%)) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });
            
            animation.addEventListener('finish', () => {
                if (particle.parentNode) {
                    document.body.removeChild(particle);
                }
            });
        }
    }

    showPlacementSuccess(source, row, col) {
        const message = `Placed ${source.name} at (${row}, ${col}) - Cost: $${source.baseCost.toLocaleString()}`;
        this.showNotification(message, 'success');
        
        // Trigger dashboard update (if available)
        if (window.renewableEnergySimulator && window.renewableEnergySimulator.dashboard) {
            window.renewableEnergySimulator.dashboard.updateDashboard();
        }
    }

    showPlacementError(reason) {
        this.showNotification(reason, 'error');
    }

    showNotification(message, type = 'info') {
        // Create or use existing notification system
        if (window.renewableEnergySimulator && window.renewableEnergySimulator.showNotification) {
            window.renewableEnergySimulator.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    playSuccessSound() {
        // Create a simple success sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Audio not supported or allowed
        }
    }

    playErrorSound() {
        // Create a simple error sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Audio not supported or allowed
        }
    }

    // Touch device support
    setupTouchSupport() {
        let touchItem = null;
        let touchOffset = { x: 0, y: 0 };
        
        document.addEventListener('touchstart', (e) => {
            const energySource = e.target.closest('.energy-source');
            if (energySource) {
                touchItem = energySource;
                const touch = e.touches[0];
                const rect = energySource.getBoundingClientRect();
                touchOffset.x = touch.clientX - rect.left;
                touchOffset.y = touch.clientY - rect.top;
                
                this.handleDragStart({
                    target: energySource,
                    dataTransfer: {
                        setData: () => {},
                        effectAllowed: 'copy'
                    }
                });
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!touchItem) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            
            this.handleDragOver({
                preventDefault: () => {},
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: document.elementFromPoint(touch.clientX, touch.clientY),
                dataTransfer: { dropEffect: 'copy' }
            });
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchItem) return;
            
            const touch = e.changedTouches[0];
            const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (dropTarget) {
                this.handleDrop({
                    preventDefault: () => {},
                    target: dropTarget,
                    dataTransfer: {
                        getData: () => touchItem.dataset.type
                    }
                });
            }
            
            this.handleDragEnd({});
            touchItem = null;
        });
    }

    initialize() {
        // Setup touch support for mobile devices
        this.setupTouchSupport();
        
        console.log('DragDropHandler initialized');
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Will be initialized by main.js
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DragDropHandler };
}
