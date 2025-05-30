/**
 * Energy Sources Management
 * Handles renewable energy source types, costs, outputs, and characteristics
 */

class EnergySource {
    constructor(type, name, baseCost, baseOutput, description, carbonReduction) {
        this.type = type;
        this.name = name;
        this.baseCost = baseCost;
        this.baseOutput = baseOutput; // kW
        this.description = description;
        this.carbonReduction = carbonReduction; // tons CO2/year
        this.weatherMultipliers = this.getWeatherMultipliers();
        this.installationCount = 0;
    }

    getWeatherMultipliers() {
        const multipliers = {
            solar: {
                sunny: 1.2,
                cloudy: 0.6,
                rainy: 0.4,
                windy: 1.0,
                stormy: 0.3
            },
            wind: {
                sunny: 0.8,
                cloudy: 1.0,
                rainy: 0.9,
                windy: 1.4,
                stormy: 1.6
            },
            hydro: {
                sunny: 1.0,
                cloudy: 1.0,
                rainy: 1.3,
                windy: 1.0,
                stormy: 1.1
            },
            geothermal: {
                sunny: 1.0,
                cloudy: 1.0,
                rainy: 1.0,
                windy: 1.0,
                stormy: 1.0
            },
            biomass: {
                sunny: 1.0,
                cloudy: 1.0,
                rainy: 0.9,
                windy: 1.0,
                stormy: 0.8
            },
            coal: {
                sunny: 1.0,
                cloudy: 1.0,
                rainy: 0.95,
                windy: 1.0,
                stormy: 0.9
            },
            naturalgas: {
                sunny: 1.0,
                cloudy: 1.0,
                rainy: 0.98,
                windy: 1.0,
                stormy: 0.95
            }
        };
        return multipliers[this.type] || {};
    }

    getCurrentOutput(weather) {
        const weatherType = weather?.type || weather || 'sunny';
        const multipliers = this.getWeatherMultipliers();
        const multiplier = multipliers[weatherType] || 1.0;
        return this.baseOutput * multiplier;
    }

    getTotalCost() {
        return this.baseCost * this.installationCount;
    }

    getTotalOutput(weather) {
        return this.getCurrentOutput(weather) * this.installationCount;
    }

    getTotalCarbonReduction() {
        return this.carbonReduction * this.installationCount;
    }

    addInstallation() {
        this.installationCount++;
    }

    removeInstallation() {
        if (this.installationCount > 0) {
            this.installationCount--;
        }
    }

    getEfficiencyRating(weather) {
        const multiplier = this.weatherMultipliers[weather] || 1.0;
        if (multiplier >= 1.2) return 'Excellent';
        if (multiplier >= 1.0) return 'Good';
        if (multiplier >= 0.8) return 'Fair';
        return 'Poor';
    }

    getInstallationInfo() {
        return {
            type: this.type,
            name: this.name,
            count: this.installationCount,
            totalCost: this.getTotalCost(),
            baseCost: this.baseCost,
            baseOutput: this.baseOutput,
            description: this.description
        };
    }
}

class EnergySourceManager {
    constructor() {
        this.sources = new Map();
        this.initializeSources();
    }

    initializeSources() {
        // Initialize all renewable energy sources with realistic data
        this.sources.set('solar', new EnergySource(
            'solar',
            'Solar Panel',
            2500,
            50,
            'Harnesses sunlight to generate clean electricity. Most effective during sunny days.',
            1.2
        ));

        this.sources.set('wind', new EnergySource(
            'wind',
            'Wind Turbine',
            8000,
            100,
            'Converts wind energy into electricity. Performance increases with wind speed.',
            2.5
        ));

        this.sources.set('hydro', new EnergySource(
            'hydro',
            'Hydro Power',
            12000,
            200,
            'Uses flowing water to generate electricity. Enhanced by rainfall.',
            5.2
        ));

        this.sources.set('geothermal', new EnergySource(
            'geothermal',
            'Geothermal Plant',
            15000,
            180,
            'Taps into Earth\'s internal heat for consistent power generation.',
            4.5
        ));

        this.sources.set('biomass', new EnergySource(
            'biomass',
            'Biomass Plant',
            10000,
            120,
            'Burns organic materials to produce electricity. Weather-independent operation.',
            3.2
        ));

        this.sources.set('coal', new EnergySource(
            'coal',
            'Coal Power Plant',
            25000,
            400,
            'Burns coal to generate electricity. High carbon emissions and environmental impact.',
            -8.5
        ));

        this.sources.set('naturalgas', new EnergySource(
            'naturalgas',
            'Natural Gas Plant',
            18000,
            300,
            'Burns natural gas for electricity. Lower emissions than coal but still fossil fuel.',
            -5.2
        ));
    }

    getSource(type) {
        return this.sources.get(type);
    }

    getAllSources() {
        return Array.from(this.sources.values());
    }

    getTotalInstallations() {
        return Array.from(this.sources.values())
            .reduce((total, source) => total + source.installationCount, 0);
    }

    getTotalCost() {
        return Array.from(this.sources.values())
            .reduce((total, source) => total + source.getTotalCost(), 0);
    }

    getTotalOutput(weather) {
        return Array.from(this.sources.values())
            .reduce((total, source) => total + source.getTotalOutput(weather), 0);
    }

    getTotalCarbonReduction() {
        return Array.from(this.sources.values())
            .reduce((total, source) => total + source.getTotalCarbonReduction(), 0);
    }

    getEnergyMix() {
        const mix = {};
        const totalOutput = this.getTotalOutput('sunny'); // Base calculation
        
        this.sources.forEach((source, type) => {
            const output = source.getTotalOutput('sunny');
            mix[type] = {
                count: source.installationCount,
                output: output,
                percentage: totalOutput > 0 ? (output / totalOutput) * 100 : 0,
                cost: source.getTotalCost()
            };
        });

        return mix;
    }

    addInstallation(type) {
        const source = this.sources.get(type);
        if (source) {
            source.addInstallation();
            return true;
        }
        return false;
    }

    removeInstallation(type) {
        const source = this.sources.get(type);
        if (source) {
            source.removeInstallation();
            return true;
        }
        return false;
    }

    canAfford(type, budget) {
        const source = this.sources.get(type);
        return source && source.baseCost <= budget;
    }

    getRecommendations(weather, budget, zoneType) {
        const recommendations = [];
        
        this.sources.forEach((source, type) => {
            if (source.baseCost <= budget) {
                const efficiency = source.weatherMultipliers[weather] || 1.0;
                const score = this.calculateRecommendationScore(source, efficiency, zoneType);
                
                recommendations.push({
                    type: type,
                    name: source.name,
                    score: score,
                    efficiency: efficiency,
                    cost: source.baseCost,
                    output: source.getCurrentOutput(weather),
                    reason: this.getRecommendationReason(source, efficiency, zoneType)
                });
            }
        });

        // Sort by score (highest first)
        return recommendations.sort((a, b) => b.score - a.score);
    }

    calculateRecommendationScore(source, efficiency, zoneType) {
        let score = efficiency * 100; // Base score from weather efficiency
        
        // Zone-specific bonuses
        if (zoneType === 'residential') {
            if (source.type === 'solar') score += 20; // Solar popular for homes
            if (source.type === 'geothermal') score += 15; // Consistent for homes
        } else if (zoneType === 'commercial') {
            if (source.type === 'wind') score += 25; // Good for commercial
            if (source.type === 'solar') score += 15; // Scalable
        } else if (zoneType === 'industrial') {
            if (source.type === 'hydro') score += 30; // High output needed
            if (source.type === 'biomass') score += 20; // Reliable for industry
        }

        // Cost efficiency bonus (lower cost = higher score)
        score += (20000 - source.baseCost) / 1000;
        
        return Math.round(score);
    }

    getRecommendationReason(source, efficiency, zoneType) {
        let reason = `${source.getEfficiencyRating()} efficiency in current weather`;
        
        if (zoneType === 'residential' && source.type === 'solar') {
            reason += '. Ideal for homes with roof space.';
        } else if (zoneType === 'industrial' && source.type === 'hydro') {
            reason += '. High output suitable for industrial needs.';
        } else if (efficiency > 1.2) {
            reason += '. Excellent conditions boost performance.';
        } else if (efficiency < 0.8) {
            reason += '. Consider waiting for better weather.';
        }
        
        return reason;
    }

    reset() {
        this.sources.forEach(source => {
            source.installationCount = 0;
        });
    }

    getStats() {
        return {
            totalInstallations: this.getTotalInstallations(),
            totalCost: this.getTotalCost(),
            totalOutput: this.getTotalOutput('sunny'),
            totalCarbonReduction: this.getTotalCarbonReduction(),
            energyMix: this.getEnergyMix(),
            sources: Object.fromEntries(
                Array.from(this.sources.entries()).map(([key, source]) => [
                    key, source.getInstallationInfo()
                ])
            )
        };
    }

    exportData() {
        const data = {};
        this.sources.forEach((source, type) => {
            data[type] = source.installationCount;
        });
        return data;
    }

    importData(data) {
        this.reset();
        Object.entries(data).forEach(([type, count]) => {
            const source = this.sources.get(type);
            if (source) {
                source.installationCount = count || 0;
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnergySource, EnergySourceManager };
}
