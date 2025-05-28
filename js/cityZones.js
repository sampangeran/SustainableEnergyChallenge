/**
 * City Zones Management
 * Handles different city zones (residential, commercial, industrial) and their energy requirements
 */

class CityZone {
    constructor(type, name, energyDemand, description, population = 0, income = 0) {
        this.type = type;
        this.name = name;
        this.energyDemand = energyDemand; // kW per cell
        this.description = description;
        this.population = population;
        this.income = income; // $ per cell per hour
        this.cells = new Set(); // Grid cells belonging to this zone
        this.energySources = new Map(); // Energy sources in this zone
    }

    addCell(cellId) {
        this.cells.add(cellId);
    }

    removeCell(cellId) {
        this.cells.delete(cellId);
    }

    getTotalEnergyDemand() {
        return this.cells.size * this.energyDemand;
    }

    getTotalIncome() {
        return this.cells.size * this.income;
    }

    addEnergySource(cellId, sourceType) {
        if (!this.energySources.has(cellId)) {
            this.energySources.set(cellId, []);
        }
        this.energySources.get(cellId).push(sourceType);
    }

    removeEnergySource(cellId) {
        this.energySources.delete(cellId);
    }

    getTotalEnergyProduction(energyManager, weather) {
        let totalProduction = 0;
        
        this.energySources.forEach((sources, cellId) => {
            sources.forEach(sourceType => {
                const source = energyManager.getSource(sourceType);
                if (source) {
                    const baseOutput = source.getCurrentOutput(weather);
                    const terrainBonus = this.getTerrainBonus(sourceType);
                    totalProduction += (baseOutput * terrainBonus);
                }
            });
        });
        
        return totalProduction;
    }

    getTerrainBonus(sourceType) {
        // Define terrain bonuses for different energy sources
        const terrainBonuses = {
            forest: {
                biomass: 1.4, // 40% boost
                solar: 0.9,   // 10% penalty (trees block sunlight)
                wind: 0.95    // 5% penalty (trees reduce wind)
            },
            mountain: {
                geothermal: 1.5, // 50% boost
                wind: 1.3,       // 30% boost (higher elevation)
                solar: 1.1,      // 10% boost (less atmosphere)
                hydro: 0.8       // 20% penalty (less water flow)
            },
            beach: {
                wind: 1.35,   // 35% boost (coastal winds)
                solar: 1.25,  // 25% boost (reflection from water)
                hydro: 0.7    // 30% penalty (salt water issues)
            },
            river: {
                hydro: 1.6,      // 60% boost
                biomass: 1.2,    // 20% boost (fertile soil)
                geothermal: 0.9  // 10% penalty (water cooling)
            }
        };

        const zoneBonuses = terrainBonuses[this.type];
        if (!zoneBonuses) return 1.0; // No bonus for regular zones
        
        return zoneBonuses[sourceType] || 1.0; // Default to no bonus if not specified
    }

    getEnergyBalance(energyManager, weather) {
        const production = this.getTotalEnergyProduction(energyManager, weather);
        const demand = this.getTotalEnergyDemand();
        return production - demand;
    }

    isEnergyEfficient(energyManager, weather) {
        return this.getEnergyBalance(energyManager, weather) >= 0;
    }

    getEfficiencyPercentage(energyManager, weather) {
        const demand = this.getTotalEnergyDemand();
        if (demand === 0) return 100;
        
        const production = this.getTotalEnergyProduction(energyManager, weather);
        return Math.min(100, (production / demand) * 100);
    }

    getZoneInfo() {
        return {
            type: this.type,
            name: this.name,
            cellCount: this.cells.size,
            energyDemand: this.energyDemand,
            totalDemand: this.getTotalEnergyDemand(),
            description: this.description,
            population: this.population * this.cells.size
        };
    }
}

class CityZoneManager {
    constructor() {
        this.zones = new Map();
        this.gridCells = new Map(); // cellId -> zone type
        this.currentMode = 'zone'; // 'zone' or 'energy'
        this.selectedZoneType = 'residential';
        this.gridSize = { rows: 8, cols: 10 };
        this.initializeZones();
    }

    initializeZones() {
        // Initialize the three main zone types with realistic energy demands
        this.zones.set('residential', new CityZone(
            'residential',
            'Residential Zone',
            50, // 50 kW per cell
            'Housing areas with moderate energy consumption for lighting, heating, and appliances.',
            100, // 100 people per cell
            120 // $120 per cell per hour (taxes, utilities, fees)
        ));

        this.zones.set('commercial', new CityZone(
            'commercial',
            'Commercial Zone',
            100, // 100 kW per cell
            'Business districts with offices, shops, and services requiring steady power.',
            50, // 50 workers per cell
            250 // $250 per cell per hour (business taxes, licenses, permits)
        ));

        this.zones.set('industrial', new CityZone(
            'industrial',
            'Industrial Zone',
            200, // 200 kW per cell
            'Manufacturing and heavy industry with high energy demands for machinery.',
            25, // 25 workers per cell
            400 // $400 per cell per hour (industrial taxes, export revenue)
        ));

        // Add specialized terrain zones that boost renewable energy efficiency
        this.zones.set('forest', new CityZone(
            'forest',
            'Forest',
            0, // No energy demand
            'Dense woodland area - boosts biomass energy efficiency by 40%',
            0 // No population
        ));

        this.zones.set('mountain', new CityZone(
            'mountain',
            'Mountain',
            0, // No energy demand
            'Rocky terrain - boosts geothermal (+50%) and wind (+30%) efficiency',
            0 // No population
        ));

        this.zones.set('beach', new CityZone(
            'beach',
            'Beach',
            0, // No energy demand
            'Coastal area - boosts wind (+35%) and solar (+25%) efficiency',
            0 // No population
        ));

        this.zones.set('river', new CityZone(
            'river',
            'River',
            0, // No energy demand
            'Water source - boosts hydro energy efficiency by 60%',
            0 // No population
        ));
    }

    setMode(mode) {
        this.currentMode = mode;
    }

    getMode() {
        return this.currentMode;
    }

    setSelectedZoneType(zoneType) {
        if (this.zones.has(zoneType)) {
            this.selectedZoneType = zoneType;
        }
    }

    getSelectedZoneType() {
        return this.selectedZoneType;
    }

    setCellZone(row, col, zoneType) {
        const cellId = `${row}-${col}`;
        const previousZone = this.gridCells.get(cellId);
        
        // Remove from previous zone
        if (previousZone && this.zones.has(previousZone)) {
            this.zones.get(previousZone).removeCell(cellId);
        }
        
        // Add to new zone
        if (zoneType && this.zones.has(zoneType)) {
            this.zones.get(zoneType).addCell(cellId);
            this.gridCells.set(cellId, zoneType);
        } else {
            this.gridCells.delete(cellId);
        }
        
        return true;
    }

    getCellZone(row, col) {
        const cellId = `${row}-${col}`;
        return this.gridCells.get(cellId) || null;
    }

    addEnergySource(row, col, sourceType) {
        const cellId = `${row}-${col}`;
        const zoneType = this.gridCells.get(cellId);
        
        if (zoneType && this.zones.has(zoneType)) {
            const zone = this.zones.get(zoneType);
            zone.addEnergySource(cellId, sourceType);
            return true;
        }
        return false;
    }

    removeEnergySource(row, col) {
        const cellId = `${row}-${col}`;
        const zoneType = this.gridCells.get(cellId);
        
        if (zoneType && this.zones.has(zoneType)) {
            const zone = this.zones.get(zoneType);
            zone.removeEnergySource(cellId);
            return true;
        }
        return false;
    }

    hasEnergySource(row, col) {
        const cellId = `${row}-${col}`;
        const zoneType = this.gridCells.get(cellId);
        
        if (zoneType && this.zones.has(zoneType)) {
            const zone = this.zones.get(zoneType);
            return zone.energySources.has(cellId);
        }
        return false;
    }

    getEnergySourceAt(row, col) {
        const cellId = `${row}-${col}`;
        const zoneType = this.gridCells.get(cellId);
        
        if (zoneType && this.zones.has(zoneType)) {
            const zone = this.zones.get(zoneType);
            const sources = zone.energySources.get(cellId);
            return sources && sources.length > 0 ? sources[0] : null;
        }
        return null;
    }

    getTotalEnergyDemand() {
        return Array.from(this.zones.values())
            .reduce((total, zone) => total + zone.getTotalEnergyDemand(), 0);
    }

    getTotalEnergyProduction(energyManager, weather) {
        return Array.from(this.zones.values())
            .reduce((total, zone) => total + zone.getTotalEnergyProduction(energyManager, weather), 0);
    }

    getTotalIncome() {
        return Array.from(this.zones.values())
            .reduce((total, zone) => total + zone.getTotalIncome(), 0);
    }

    getIncomeByZoneType() {
        const incomeBreakdown = {};
        this.zones.forEach((zone, zoneType) => {
            const income = zone.getTotalIncome();
            if (income > 0) {
                incomeBreakdown[zoneType] = income;
            }
        });
        return incomeBreakdown;
    }

    getOverallEfficiency(energyManager, weather) {
        const totalDemand = this.getTotalEnergyDemand();
        if (totalDemand === 0) return 100;
        
        const totalProduction = this.getTotalEnergyProduction(energyManager, weather);
        return Math.min(100, (totalProduction / totalDemand) * 100);
    }

    getZoneStats(energyManager, weather) {
        const stats = {};
        
        this.zones.forEach((zone, type) => {
            stats[type] = {
                ...zone.getZoneInfo(),
                production: zone.getTotalEnergyProduction(energyManager, weather),
                balance: zone.getEnergyBalance(energyManager, weather),
                efficiency: zone.getEfficiencyPercentage(energyManager, weather),
                isEfficient: zone.isEnergyEfficient(energyManager, weather)
            };
        });
        
        return stats;
    }

    getUnpoweredZones(energyManager, weather) {
        const unpowered = [];
        
        this.zones.forEach((zone, type) => {
            if (!zone.isEnergyEfficient(energyManager, weather) && zone.cells.size > 0) {
                unpowered.push({
                    type: type,
                    name: zone.name,
                    deficit: Math.abs(zone.getEnergyBalance(energyManager, weather)),
                    efficiency: zone.getEfficiencyPercentage(energyManager, weather)
                });
            }
        });
        
        return unpowered;
    }

    getOptimalPlacements(sourceType, energyManager, weather) {
        const recommendations = [];
        const source = energyManager.getSource(sourceType);
        
        if (!source) return recommendations;
        
        // Check each zone for optimal placement
        this.zones.forEach((zone, zoneType) => {
            zone.cells.forEach(cellId => {
                if (!zone.energySources.has(cellId)) {
                    const [row, col] = cellId.split('-').map(Number);
                    const efficiency = source.weatherMultipliers[weather] || 1.0;
                    const zoneDeficit = Math.max(0, -zone.getEnergyBalance(energyManager, weather));
                    
                    let score = efficiency * 100;
                    
                    // Bonus for zones with energy deficit
                    if (zoneDeficit > 0) {
                        score += 50;
                    }
                    
                    // Zone-specific bonuses
                    if (zoneType === 'residential' && sourceType === 'solar') score += 20;
                    if (zoneType === 'commercial' && sourceType === 'wind') score += 25;
                    if (zoneType === 'industrial' && (sourceType === 'hydro' || sourceType === 'biomass')) score += 30;
                    
                    recommendations.push({
                        row: row,
                        col: col,
                        cellId: cellId,
                        zoneType: zoneType,
                        score: score,
                        reason: this.getPlacementReason(zoneType, sourceType, zoneDeficit, efficiency)
                    });
                }
            });
        });
        
        // Sort by score (highest first)
        return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    getPlacementReason(zoneType, sourceType, deficit, efficiency) {
        let reason = `${zoneType} zone`;
        
        if (deficit > 0) {
            reason += ` with ${Math.round(deficit)}kW energy deficit`;
        }
        
        if (efficiency > 1.2) {
            reason += '. Excellent weather conditions.';
        } else if (efficiency < 0.8) {
            reason += '. Consider waiting for better weather.';
        }
        
        return reason;
    }

    validatePlacement(row, col, sourceType) {
        const cellId = `${row}-${col}`;
        const zoneType = this.gridCells.get(cellId);
        
        // Must be in a zone
        if (!zoneType) {
            return { valid: false, reason: 'Must place energy source in a zoned area' };
        }
        
        // Cannot already have an energy source
        if (this.hasEnergySource(row, col)) {
            return { valid: false, reason: 'Cell already has an energy source' };
        }
        
        // Check zone compatibility
        const incompatible = this.checkZoneCompatibility(zoneType, sourceType);
        if (incompatible) {
            return { valid: false, reason: incompatible };
        }
        
        return { valid: true, reason: 'Valid placement location' };
    }

    checkZoneCompatibility(zoneType, sourceType) {
        // Define incompatible combinations
        const restrictions = {
            residential: {
                hydro: 'Hydro power requires water sources, not suitable for residential areas',
                biomass: 'Biomass plants may cause air quality concerns in residential areas'
            },
            commercial: {
                hydro: 'Hydro power requires specific geographical features'
            },
            industrial: {
                // Industrial zones are generally compatible with all sources
            },
            // Specialized terrain zones are compatible with all energy sources
            forest: {},
            mountain: {},
            beach: {},
            river: {}
        };
        
        const zoneRestrictions = restrictions[zoneType] || {};
        return zoneRestrictions[sourceType] || null;
    }

    reset() {
        this.gridCells.clear();
        this.zones.forEach(zone => {
            zone.cells.clear();
            zone.energySources.clear();
        });
    }

    exportData() {
        const data = {
            gridCells: Object.fromEntries(this.gridCells),
            energySources: {}
        };
        
        this.zones.forEach((zone, zoneType) => {
            data.energySources[zoneType] = Object.fromEntries(zone.energySources);
        });
        
        return data;
    }

    importData(data) {
        this.reset();
        
        // Restore grid cells
        if (data.gridCells) {
            Object.entries(data.gridCells).forEach(([cellId, zoneType]) => {
                const [row, col] = cellId.split('-').map(Number);
                this.setCellZone(row, col, zoneType);
            });
        }
        
        // Restore energy sources
        if (data.energySources) {
            Object.entries(data.energySources).forEach(([zoneType, sources]) => {
                const zone = this.zones.get(zoneType);
                if (zone) {
                    Object.entries(sources).forEach(([cellId, sourceTypes]) => {
                        if (Array.isArray(sourceTypes)) {
                            sourceTypes.forEach(sourceType => {
                                zone.energySources.set(cellId, sourceTypes);
                            });
                        }
                    });
                }
            });
        }
    }

    getGridDimensions() {
        return this.gridSize;
    }

    setGridDimensions(rows, cols) {
        this.gridSize = { rows, cols };
        // Clear any cells outside new dimensions
        const cellsToRemove = [];
        this.gridCells.forEach((zoneType, cellId) => {
            const [row, col] = cellId.split('-').map(Number);
            if (row >= rows || col >= cols) {
                cellsToRemove.push(cellId);
            }
        });
        
        cellsToRemove.forEach(cellId => {
            const [row, col] = cellId.split('-').map(Number);
            this.setCellZone(row, col, null);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CityZone, CityZoneManager };
}
