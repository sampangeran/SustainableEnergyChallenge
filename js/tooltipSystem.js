/**
 * Tooltip System
 * Provides contextual explanations when hovering over features and elements
 */

class TooltipSystem {
    constructor() {
        this.tooltip = null;
        this.tooltipTimeout = null;
        this.isVisible = false;
        this.currentTarget = null;
        
        this.tooltipData = {
            // Energy source tooltips
            'solar': {
                title: 'Solar Panel',
                description: 'Converts sunlight into electricity. Works best in sunny weather and on beaches/mountains. Cost: $15,000, Output: 80kW'
            },
            'wind': {
                title: 'Wind Turbine',
                description: 'Generates power from wind. Excellent on beaches and mountains. Performs well in windy weather. Cost: $20,000, Output: 100kW'
            },
            'hydro': {
                title: 'Hydroelectric Dam',
                description: 'Uses flowing water to generate electricity. Must be placed near rivers. Very reliable power source. Cost: $30,000, Output: 150kW'
            },
            'geothermal': {
                title: 'Geothermal Plant',
                description: 'Harnesses underground heat. Works best on mountains. Weather-independent power. Cost: $25,000, Output: 120kW'
            },
            'biomass': {
                title: 'Biomass Plant',
                description: 'Burns organic materials for energy. Works excellently in forests. Renewable but produces some emissions. Cost: $18,000, Output: 90kW'
            },
            'coal': {
                title: 'Coal Power Plant',
                description: 'Burns coal for electricity. Cheap and reliable but high carbon emissions. Cost: $12,000, Output: 200kW'
            },
            'natural-gas': {
                title: 'Natural Gas Plant',
                description: 'Burns natural gas for power. Cleaner than coal but still produces emissions. Cost: $16,000, Output: 180kW'
            },
            
            // Zone tooltips
            'residential': {
                title: 'Residential Zone',
                description: 'Houses for city residents. Generates $120/month when powered. Requires 50kW of electricity.'
            },
            'commercial': {
                title: 'Commercial Zone',
                description: 'Shops and offices. Generates $250/month when powered. Requires 75kW of electricity.'
            },
            'industrial': {
                title: 'Industrial Zone',
                description: 'Factories and manufacturing. Generates $400/month when powered. Requires 150kW of electricity.'
            },
            
            // Terrain tooltips
            'forest': {
                title: 'Forest Terrain',
                description: 'Natural forest area. Provides +40% bonus to biomass, -10% to solar, -5% to wind energy production.'
            },
            'mountain': {
                title: 'Mountain Terrain',
                description: 'Rocky mountain area. Provides +50% to geothermal, +30% to wind, +10% to solar, -20% to hydro.'
            },
            'beach': {
                title: 'Beach Terrain',
                description: 'Coastal area with steady winds. Provides +35% to wind, +25% to solar, -30% to hydro energy.'
            },
            'river': {
                title: 'River Terrain',
                description: 'Flowing water source. Provides +60% to hydro, +20% to biomass, -10% to geothermal energy.'
            },
            
            // UI element tooltips
            'budget-panel': {
                title: 'City Budget',
                description: 'Shows your current funds, monthly income, and spending. Click to view detailed financial information.'
            },
            'weather-panel': {
                title: 'Weather System',
                description: 'Current weather conditions affect energy production. Sunny boosts solar, windy helps wind turbines.'
            },
            'dashboard-panel': {
                title: 'Performance Dashboard',
                description: 'Real-time metrics showing energy efficiency, sustainability score, and city performance.'
            },
            'power-status': {
                title: 'Power Warning',
                description: 'This zone lacks sufficient electricity. Build energy sources or the zone won\'t generate income.'
            },
            'energy-source-panel': {
                title: 'Energy Sources',
                description: 'Drag and drop renewable energy sources onto the grid. Each has different costs and outputs.'
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        this.createTooltip();
        this.setupEventListeners();
        this.injectTooltipStyles();
    }
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'custom-tooltip';
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
    }
    
    setupEventListeners() {
        // Mouse enter/leave for hoverable elements
        document.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Hide tooltip when scrolling or clicking
        document.addEventListener('scroll', this.hideTooltip.bind(this));
        document.addEventListener('click', this.hideTooltip.bind(this));
        window.addEventListener('resize', this.hideTooltip.bind(this));
    }
    
    handleMouseEnter(event) {
        const target = event.target;
        const tooltipInfo = this.getTooltipInfo(target);
        
        if (tooltipInfo) {
            this.currentTarget = target;
            this.tooltipTimeout = setTimeout(() => {
                this.showTooltip(tooltipInfo, event);
            }, 500); // 500ms delay before showing
        }
    }
    
    handleMouseLeave(event) {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        
        // Check if we're moving to the tooltip itself
        const relatedTarget = event.relatedTarget;
        if (relatedTarget && relatedTarget.closest('.custom-tooltip')) {
            return;
        }
        
        this.hideTooltip();
    }
    
    handleMouseMove(event) {
        if (this.isVisible) {
            this.positionTooltip(event);
        }
    }
    
    getTooltipInfo(element) {
        // Check if element exists and has required properties
        if (!element || !element.dataset || !element.classList) {
            return null;
        }
        
        // Check for explicit tooltip data attribute
        if (element.dataset.tooltip) {
            return {
                title: element.dataset.tooltipTitle || '',
                description: element.dataset.tooltip
            };
        }
        
        // Check for energy source draggables
        if (element.classList.contains('energy-source-item')) {
            const sourceType = element.dataset.sourceType;
            return this.tooltipData[sourceType];
        }
        
        // Check for grid cells with zones or energy sources
        if (element.classList.contains('grid-cell')) {
            return this.getGridCellTooltip(element);
        }
        
        // Check for power status indicators
        if (element.classList.contains('power-status')) {
            return this.tooltipData['power-status'];
        }
        
        // Check for UI panels
        if (element.id === 'budget-panel' || element.closest('#budget-panel')) {
            return this.tooltipData['budget-panel'];
        }
        
        if (element.id === 'weather-panel' || element.closest('#weather-panel')) {
            return this.tooltipData['weather-panel'];
        }
        
        if (element.id === 'dashboard-panel' || element.closest('#dashboard-panel')) {
            return this.tooltipData['dashboard-panel'];
        }
        
        if (element.closest('.energy-sources')) {
            return this.tooltipData['energy-source-panel'];
        }
        
        return null;
    }
    
    getGridCellTooltip(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (isNaN(row) || isNaN(col)) return null;
        
        // Check if cell has energy source
        if (window.simulator && window.simulator.zoneManager.hasEnergySource(row, col)) {
            const sourceType = window.simulator.zoneManager.getEnergySourceAt(row, col);
            const sourceInfo = this.tooltipData[sourceType];
            if (sourceInfo) {
                const weather = window.simulator.weatherSystem.getCurrentWeather();
                const source = window.simulator.energyManager.getSource(sourceType);
                
                // Calculate output with terrain bonus
                const zoneType = window.simulator.zoneManager.getCellZone(row, col);
                const zone = window.simulator.zoneManager.zones.get(zoneType);
                const terrainBonus = zone ? zone.getTerrainBonus(sourceType) : 1.0;
                const baseOutput = source ? source.getCurrentOutput(weather) : 0;
                const outputWithTerrain = Math.round(baseOutput * terrainBonus);
                
                let description = `${sourceInfo.description}\nCurrent output: ${outputWithTerrain}kW`;
                if (terrainBonus > 1.0) {
                    description += ` (+${Math.round((terrainBonus - 1) * 100)}% terrain bonus)`;
                } else if (terrainBonus < 1.0) {
                    description += ` (${Math.round((terrainBonus - 1) * 100)}% terrain penalty)`;
                }
                description += ` (${weather.name} weather)`;
                
                return {
                    title: sourceInfo.title,
                    description: description
                };
            }
        }
        
        // Check for zone type
        const zoneType = window.simulator ? window.simulator.zoneManager.getCellZone(row, col) : null;
        if (zoneType && this.tooltipData[zoneType]) {
            const zoneInfo = this.tooltipData[zoneType];
            
            // Add power status information for user zones
            if (['residential', 'commercial', 'industrial'].includes(zoneType)) {
                const isPowered = this.isZonePowered(row, col);
                const powerStatus = isPowered ? '✅ Powered' : '⚠️ Needs Power';
                
                return {
                    title: zoneInfo.title,
                    description: `${zoneInfo.description}\nStatus: ${powerStatus}`
                };
            }
            
            return zoneInfo;
        }
        
        // Empty cell
        return {
            title: 'Empty Cell',
            description: 'Click to place a city zone, or drag an energy source here. Consider terrain bonuses for optimal placement.'
        };
    }
    
    isZonePowered(row, col) {
        if (!window.simulator) return false;
        
        const totalProduction = window.simulator.zoneManager.getTotalEnergyProduction(
            window.simulator.energyManager, 
            window.simulator.weatherSystem.getCurrentWeather()
        );
        const totalDemand = window.simulator.zoneManager.getTotalEnergyDemand();
        
        return totalProduction >= totalDemand;
    }
    
    showTooltip(tooltipInfo, event) {
        if (!tooltipInfo || !this.tooltip) return;
        
        this.tooltip.innerHTML = `
            <div class="tooltip-header">${tooltipInfo.title}</div>
            <div class="tooltip-content">${tooltipInfo.description.replace(/\n/g, '<br>')}</div>
        `;
        
        this.tooltip.style.display = 'block';
        this.isVisible = true;
        
        this.positionTooltip(event);
    }
    
    positionTooltip(event) {
        if (!this.isVisible || !this.tooltip) return;
        
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = mouseX + 15;
        let top = mouseY - 10;
        
        // Adjust if tooltip goes off screen
        if (left + tooltipRect.width > viewportWidth) {
            left = mouseX - tooltipRect.width - 15;
        }
        
        if (top + tooltipRect.height > viewportHeight) {
            top = mouseY - tooltipRect.height - 10;
        }
        
        if (left < 0) left = 10;
        if (top < 0) top = 10;
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }
    
    hideTooltip() {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
            this.isVisible = false;
            this.currentTarget = null;
        }
    }
    
    injectTooltipStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-tooltip {
                position: fixed;
                background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.4;
                max-width: 300px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(5px);
                animation: tooltipFadeIn 0.2s ease-out forwards;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            @keyframes tooltipFadeIn {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .tooltip-header {
                font-weight: bold;
                font-size: 15px;
                margin-bottom: 6px;
                color: #ecf0f1;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                padding-bottom: 4px;
            }
            
            .tooltip-content {
                color: #bdc3c7;
                font-size: 13px;
            }
            
            /* Add hover states for elements that have tooltips */
            .grid-cell:hover,
            .energy-source-item:hover,
            .power-status:hover {
                cursor: default;
            }
            
            #budget-panel:hover,
            #weather-panel:hover,
            #dashboard-panel:hover {
                cursor: default;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add custom tooltip to an element
    addTooltip(element, title, description) {
        element.dataset.tooltipTitle = title;
        element.dataset.tooltip = description;
    }
    
    // Remove tooltip from an element
    removeTooltip(element) {
        delete element.dataset.tooltipTitle;
        delete element.dataset.tooltip;
    }
    
    // Update tooltip data
    updateTooltipData(key, data) {
        this.tooltipData[key] = data;
    }
    
    destroy() {
        if (this.tooltip) {
            this.tooltip.remove();
        }
        
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
        }
        
        document.removeEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
        document.removeEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('scroll', this.hideTooltip.bind(this));
        document.removeEventListener('click', this.hideTooltip.bind(this));
        window.removeEventListener('resize', this.hideTooltip.bind(this));
    }
}

// Export for use in main application
window.TooltipSystem = TooltipSystem;