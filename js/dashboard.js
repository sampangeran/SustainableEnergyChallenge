/**
 * Dashboard Management
 * Handles real-time energy performance metrics, charts, and reporting
 */

class EnergyDashboard {
    constructor(energyManager, zoneManager, weatherSystem) {
        this.energyManager = energyManager;
        this.zoneManager = zoneManager;
        this.weatherSystem = weatherSystem;
        
        this.updateInterval = 2000; // Update every 2 seconds
        this.updateTimer = null;
        this.isRunning = false;
        
        this.performanceHistory = [];
        this.maxHistoryLength = 100;
        
        this.chartCanvas = null;
        this.chartContext = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Cache DOM elements for performance
        this.elements = {
            totalProduction: document.getElementById('total-production'),
            totalConsumption: document.getElementById('total-consumption'),
            efficiency: document.getElementById('efficiency'),
            totalCost: document.getElementById('total-cost'),
            annualSavings: document.getElementById('annual-savings'),
            co2Reduction: document.getElementById('co2-reduction'),
            sustainabilityScore: document.getElementById('sustainability-score'),
            energyChart: document.getElementById('energy-chart'),
            performanceFill: document.getElementById('performance-fill')
        };

        // Initialize chart canvas
        if (this.elements.energyChart) {
            this.chartCanvas = this.elements.energyChart;
            this.chartContext = this.chartCanvas.getContext('2d');
        }
    }

    setupEventListeners() {
        // Listen for weather changes to update dashboard
        this.weatherSystem.addEventListener((weatherData) => {
            this.updateDashboard();
        });

        // Update dashboard when window becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isRunning) {
                this.updateDashboard();
            }
        });
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateDashboard();
        this.scheduleUpdate();
    }

    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        this.isRunning = false;
    }

    scheduleUpdate() {
        if (!this.isRunning) return;
        
        this.updateTimer = setInterval(() => {
            this.updateDashboard();
        }, this.updateInterval);
    }

    updateDashboard() {
        const currentWeather = this.weatherSystem.getCurrentWeatherType();
        const metrics = this.calculateMetrics(currentWeather);
        
        this.updateEnergyMetrics(metrics);
        this.updateFinancialMetrics(metrics);
        this.updateEnvironmentalMetrics(metrics);
        this.updatePerformanceBar(metrics);
        this.updateEnergyChart(metrics);
        
        this.recordPerformanceHistory(metrics);
    }

    calculateMetrics(weather) {
        const totalProduction = this.energyManager.getTotalOutput(weather);
        const totalConsumption = this.zoneManager.getTotalEnergyDemand();
        const totalCost = this.energyManager.getTotalCost();
        const totalInstallations = this.energyManager.getTotalInstallations();
        const carbonReduction = this.energyManager.getTotalCarbonReduction();
        
        // Calculate efficiency
        const efficiency = totalConsumption > 0 ? 
            Math.min(100, (totalProduction / totalConsumption) * 100) : 0;
        
        // Calculate annual savings (simplified model)
        const annualSavings = this.calculateAnnualSavings(totalProduction, carbonReduction);
        
        // Calculate sustainability score
        const sustainabilityScore = this.calculateSustainabilityScore(
            efficiency, carbonReduction, totalInstallations
        );
        
        // Get energy mix
        const energyMix = this.energyManager.getEnergyMix();
        
        // Get zone statistics
        const zoneStats = this.zoneManager.getZoneStats(this.energyManager, weather);
        
        return {
            totalProduction,
            totalConsumption,
            efficiency,
            totalCost,
            annualSavings,
            carbonReduction,
            sustainabilityScore,
            energyMix,
            zoneStats,
            weather,
            timestamp: Date.now()
        };
    }

    calculateAnnualSavings(totalProduction, carbonReduction) {
        // Simplified calculation based on energy production and carbon reduction
        const energyCostSaving = totalProduction * 8760 * 0.12; // $0.12 per kWh annually
        const carbonCreditValue = carbonReduction * 25; // $25 per ton CO2
        return energyCostSaving + carbonCreditValue;
    }

    calculateSustainabilityScore(efficiency, carbonReduction, installations) {
        let score = 0;
        
        // Efficiency component (40% of score)
        score += (efficiency / 100) * 40;
        
        // Carbon reduction component (35% of score)
        const maxCarbonReduction = 100; // Assumed maximum
        score += Math.min(carbonReduction / maxCarbonReduction, 1) * 35;
        
        // Installation diversity component (25% of score)
        const energyMix = this.energyManager.getEnergyMix();
        const sourceCount = Object.values(energyMix).filter(mix => mix.count > 0).length;
        const maxSources = 5;
        score += (sourceCount / maxSources) * 25;
        
        return Math.round(score);
    }

    updateEnergyMetrics(metrics) {
        if (this.elements.totalProduction) {
            this.elements.totalProduction.textContent = `${Math.round(metrics.totalProduction)} kW`;
            this.addUpdateAnimation(this.elements.totalProduction);
        }

        if (this.elements.totalConsumption) {
            this.elements.totalConsumption.textContent = `${Math.round(metrics.totalConsumption)} kW`;
            this.addUpdateAnimation(this.elements.totalConsumption);
        }

        if (this.elements.efficiency) {
            const efficiencyText = `${Math.round(metrics.efficiency)}%`;
            this.elements.efficiency.textContent = efficiencyText;
            this.elements.efficiency.style.color = this.getEfficiencyColor(metrics.efficiency);
            this.addUpdateAnimation(this.elements.efficiency);
        }
    }

    updateFinancialMetrics(metrics) {
        if (this.elements.totalCost) {
            this.elements.totalCost.textContent = `$${metrics.totalCost.toLocaleString()}`;
            this.addUpdateAnimation(this.elements.totalCost);
        }

        if (this.elements.annualSavings) {
            this.elements.annualSavings.textContent = `$${Math.round(metrics.annualSavings).toLocaleString()}`;
            this.addUpdateAnimation(this.elements.annualSavings);
        }
    }

    updateEnvironmentalMetrics(metrics) {
        if (this.elements.co2Reduction) {
            this.elements.co2Reduction.textContent = `${metrics.carbonReduction.toFixed(1)} tons/year`;
            this.addUpdateAnimation(this.elements.co2Reduction);
        }

        if (this.elements.sustainabilityScore) {
            this.elements.sustainabilityScore.textContent = `${metrics.sustainabilityScore}/100`;
            this.elements.sustainabilityScore.style.color = this.getSustainabilityColor(metrics.sustainabilityScore);
            this.addUpdateAnimation(this.elements.sustainabilityScore);
        }
    }

    updatePerformanceBar(metrics) {
        if (this.elements.performanceFill) {
            const performance = Math.min(100, metrics.efficiency);
            this.elements.performanceFill.style.width = `${performance}%`;
            
            // Update color based on performance
            const color = this.getPerformanceColor(performance);
            this.elements.performanceFill.style.background = color;
        }
    }

    updateEnergyChart(metrics) {
        if (!this.chartContext) return;
        
        const energyMix = metrics.energyMix;
        const canvas = this.chartCanvas;
        const ctx = this.chartContext;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Chart dimensions
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Data preparation
        const totalOutput = Object.values(energyMix)
            .reduce((sum, mix) => sum + mix.output, 0);
        
        if (totalOutput === 0) {
            this.drawEmptyChart(ctx, centerX, centerY, radius);
            return;
        }
        
        // Draw pie chart
        let currentAngle = -Math.PI / 2; // Start at top
        const colors = {
            solar: '#FFC107',
            wind: '#42A5F5',
            hydro: '#26C6DA',
            geothermal: '#FF7043',
            biomass: '#66BB6A'
        };
        
        Object.entries(energyMix).forEach(([type, mix]) => {
            if (mix.output > 0) {
                const sliceAngle = (mix.output / totalOutput) * 2 * Math.PI;
                
                // Draw slice
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[type] || '#999';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw label
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${Math.round(mix.percentage)}%`, labelX, labelY);
                
                currentAngle += sliceAngle;
            }
        });
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
        
        // Center text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Energy', centerX, centerY - 8);
        ctx.font = '12px Arial';
        ctx.fillText('Mix', centerX, centerY + 8);
    }

    drawEmptyChart(ctx, centerX, centerY, radius) {
        // Draw empty circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f5f5f5';
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Empty state text
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Energy', centerX, centerY - 8);
        ctx.fillText('Sources', centerX, centerY + 8);
    }

    addUpdateAnimation(element) {
        if (!element) return;
        
        element.classList.remove('animate-pulse');
        element.classList.add('animate-pulse');
        
        setTimeout(() => {
            element.classList.remove('animate-pulse');
        }, 600);
    }

    getEfficiencyColor(efficiency) {
        if (efficiency >= 80) return 'hsl(120, 70%, 50%)'; // Green
        if (efficiency >= 60) return 'hsl(45, 100%, 50%)'; // Yellow
        if (efficiency >= 40) return 'hsl(30, 100%, 50%)'; // Orange
        return 'hsl(0, 70%, 50%)'; // Red
    }

    getSustainabilityColor(score) {
        if (score >= 80) return 'hsl(120, 70%, 50%)'; // Green
        if (score >= 60) return 'hsl(60, 70%, 50%)'; // Light green
        if (score >= 40) return 'hsl(45, 100%, 50%)'; // Yellow
        return 'hsl(0, 70%, 50%)'; // Red
    }

    getPerformanceColor(performance) {
        if (performance >= 80) {
            return 'linear-gradient(90deg, hsl(120, 70%, 50%), hsl(120, 70%, 60%))';
        } else if (performance >= 60) {
            return 'linear-gradient(90deg, hsl(45, 100%, 50%), hsl(45, 100%, 60%))';
        } else if (performance >= 40) {
            return 'linear-gradient(90deg, hsl(30, 100%, 50%), hsl(30, 100%, 60%))';
        } else {
            return 'linear-gradient(90deg, hsl(0, 70%, 50%), hsl(0, 70%, 60%))';
        }
    }

    recordPerformanceHistory(metrics) {
        this.performanceHistory.push({
            timestamp: metrics.timestamp,
            efficiency: metrics.efficiency,
            production: metrics.totalProduction,
            consumption: metrics.totalConsumption,
            sustainabilityScore: metrics.sustainabilityScore,
            weather: metrics.weather
        });

        // Keep history manageable
        if (this.performanceHistory.length > this.maxHistoryLength) {
            this.performanceHistory.shift();
        }
    }

    generateReport() {
        const currentMetrics = this.calculateMetrics(this.weatherSystem.getCurrentWeatherType());
        const history = this.performanceHistory;
        
        // Calculate trends
        const trends = this.calculateTrends(history);
        
        // Get zone analysis
        const zoneAnalysis = this.analyzeZonePerformance(currentMetrics.zoneStats);
        
        // Get energy source recommendations
        const recommendations = this.generateRecommendations(currentMetrics);
        
        return {
            summary: {
                timestamp: Date.now(),
                currentEfficiency: currentMetrics.efficiency,
                totalProduction: currentMetrics.totalProduction,
                totalConsumption: currentMetrics.totalConsumption,
                totalCost: currentMetrics.totalCost,
                sustainabilityScore: currentMetrics.sustainabilityScore,
                carbonReduction: currentMetrics.carbonReduction
            },
            trends: trends,
            zoneAnalysis: zoneAnalysis,
            energyMix: currentMetrics.energyMix,
            recommendations: recommendations,
            performance: {
                averageEfficiency: this.calculateAverageEfficiency(),
                peakProduction: this.findPeakProduction(),
                totalUptime: this.calculateUptime()
            }
        };
    }

    calculateTrends(history) {
        if (history.length < 2) return null;
        
        const recent = history.slice(-10); // Last 10 data points
        const older = history.slice(-20, -10); // Previous 10 data points
        
        if (older.length === 0) return null;
        
        const recentAvg = recent.reduce((sum, h) => sum + h.efficiency, 0) / recent.length;
        const olderAvg = older.reduce((sum, h) => sum + h.efficiency, 0) / older.length;
        
        return {
            efficiency: {
                current: recentAvg,
                previous: olderAvg,
                trend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
                change: recentAvg - olderAvg
            },
            sustainability: {
                current: recent[recent.length - 1]?.sustainabilityScore || 0,
                trend: this.calculateTrend(recent.map(h => h.sustainabilityScore))
            }
        };
    }

    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const first = values[0];
        const last = values[values.length - 1];
        const change = last - first;
        
        if (Math.abs(change) < 2) return 'stable';
        return change > 0 ? 'improving' : 'declining';
    }

    analyzeZonePerformance(zoneStats) {
        const analysis = {};
        
        Object.entries(zoneStats).forEach(([zoneType, stats]) => {
            analysis[zoneType] = {
                efficiency: stats.efficiency,
                isEfficient: stats.isEfficient,
                deficit: Math.max(0, -stats.balance),
                surplus: Math.max(0, stats.balance),
                recommendation: this.getZoneRecommendation(stats)
            };
        });
        
        return analysis;
    }

    getZoneRecommendation(zoneStats) {
        if (zoneStats.efficiency >= 100) {
            return 'Zone is well-powered. Consider expanding or adding energy storage.';
        } else if (zoneStats.efficiency >= 80) {
            return 'Zone performance is good. Minor improvements may help.';
        } else if (zoneStats.efficiency >= 50) {
            return 'Zone needs additional energy sources to meet demand.';
        } else {
            return 'Zone critically underpowered. Immediate action required.';
        }
    }

    generateRecommendations(metrics) {
        const recommendations = [];
        const weather = metrics.weather;
        
        // Energy efficiency recommendations
        if (metrics.efficiency < 80) {
            recommendations.push({
                type: 'efficiency',
                priority: 'high',
                title: 'Increase Energy Production',
                description: `Current efficiency is ${Math.round(metrics.efficiency)}%. Add more energy sources to meet demand.`,
                action: 'Add renewable energy installations'
            });
        }
        
        // Weather-specific recommendations
        const weatherEffects = this.weatherSystem.getAllWeatherEffects();
        Object.entries(weatherEffects).forEach(([energyType, effect]) => {
            if (effect.multiplier > 1.2) {
                recommendations.push({
                    type: 'weather',
                    priority: 'medium',
                    title: `Optimal ${energyType} conditions`,
                    description: effect.description,
                    action: `Consider adding more ${energyType} energy sources`
                });
            }
        });
        
        // Cost optimization recommendations
        if (metrics.totalCost > 100000) {
            recommendations.push({
                type: 'cost',
                priority: 'medium',
                title: 'High Installation Costs',
                description: 'Consider cost-effective energy sources for future expansions.',
                action: 'Balance cost with performance'
            });
        }
        
        // Sustainability recommendations
        if (metrics.sustainabilityScore < 60) {
            recommendations.push({
                type: 'sustainability',
                priority: 'low',
                title: 'Improve Sustainability',
                description: 'Diversify energy sources to improve environmental impact.',
                action: 'Add variety to energy mix'
            });
        }
        
        return recommendations.slice(0, 5); // Limit to top 5 recommendations
    }

    calculateAverageEfficiency() {
        if (this.performanceHistory.length === 0) return 0;
        
        const sum = this.performanceHistory.reduce((total, record) => total + record.efficiency, 0);
        return sum / this.performanceHistory.length;
    }

    findPeakProduction() {
        if (this.performanceHistory.length === 0) return 0;
        
        return Math.max(...this.performanceHistory.map(record => record.production));
    }

    calculateUptime() {
        // Calculate percentage of time with energy production > 0
        if (this.performanceHistory.length === 0) return 0;
        
        const productiveRecords = this.performanceHistory.filter(record => record.production > 0);
        return (productiveRecords.length / this.performanceHistory.length) * 100;
    }

    exportData() {
        return {
            performanceHistory: this.performanceHistory.slice(-20), // Last 20 records
            isRunning: this.isRunning
        };
    }

    importData(data) {
        if (data.performanceHistory) {
            this.performanceHistory = data.performanceHistory;
        }
        
        if (data.isRunning) {
            this.start();
        }
    }

    reset() {
        this.stop();
        this.performanceHistory = [];
        
        // Clear dashboard display
        Object.values(this.elements).forEach(element => {
            if (element && element.textContent !== undefined) {
                element.textContent = '0';
            }
        });
        
        // Clear chart
        if (this.chartContext) {
            this.chartContext.clearRect(0, 0, this.chartCanvas.width, this.chartCanvas.height);
        }
        
        // Reset performance bar
        if (this.elements.performanceFill) {
            this.elements.performanceFill.style.width = '0%';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnergyDashboard };
}
