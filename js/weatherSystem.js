/**
 * Weather System Management
 * Handles dynamic weather conditions that affect renewable energy output
 */

class WeatherCondition {
    constructor(type, name, icon, description, probability, duration) {
        this.type = type;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.probability = probability; // Probability of occurring (0-1)
        this.duration = duration; // Duration in minutes (simulation time)
        this.effects = this.getEffects();
    }

    getEffects() {
        const effects = {
            sunny: {
                solar: { multiplier: 1.2, description: 'Solar panels operating at peak efficiency' },
                wind: { multiplier: 0.8, description: 'Light winds reduce turbine output' },
                hydro: { multiplier: 1.0, description: 'Normal water flow' },
                geothermal: { multiplier: 1.0, description: 'Unaffected by surface weather' },
                biomass: { multiplier: 1.0, description: 'Normal operation' }
            },
            cloudy: {
                solar: { multiplier: 0.6, description: 'Reduced sunlight limits solar output' },
                wind: { multiplier: 1.0, description: 'Moderate wind conditions' },
                hydro: { multiplier: 1.0, description: 'Normal water flow' },
                geothermal: { multiplier: 1.0, description: 'Unaffected by surface weather' },
                biomass: { multiplier: 1.0, description: 'Normal operation' }
            },
            windy: {
                solar: { multiplier: 1.0, description: 'Normal solar conditions' },
                wind: { multiplier: 1.4, description: 'Strong winds boost turbine performance' },
                hydro: { multiplier: 1.0, description: 'Normal water flow' },
                geothermal: { multiplier: 1.0, description: 'Unaffected by surface weather' },
                biomass: { multiplier: 1.0, description: 'Normal operation' }
            },
            rainy: {
                solar: { multiplier: 0.4, description: 'Heavy clouds block sunlight' },
                wind: { multiplier: 0.9, description: 'Rain dampens wind efficiency slightly' },
                hydro: { multiplier: 1.3, description: 'Increased water flow boosts output' },
                geothermal: { multiplier: 1.0, description: 'Unaffected by surface weather' },
                biomass: { multiplier: 0.9, description: 'Moisture affects fuel efficiency' }
            },
            stormy: {
                solar: { multiplier: 0.3, description: 'Storm clouds severely limit solar' },
                wind: { multiplier: 1.6, description: 'High winds maximize turbine output' },
                hydro: { multiplier: 1.1, description: 'Storm runoff increases flow' },
                geothermal: { multiplier: 1.0, description: 'Unaffected by surface weather' },
                biomass: { multiplier: 0.8, description: 'Storm conditions affect operations' }
            }
        };
        return effects[this.type] || {};
    }

    getEffect(energyType) {
        return this.effects[energyType] || { multiplier: 1.0, description: 'No effect' };
    }
}

class WeatherSystem {
    constructor() {
        this.conditions = new Map();
        this.currentWeather = null;
        this.weatherHistory = [];
        this.weatherTimer = null;
        this.eventListeners = [];
        this.forecastDays = 3;
        this.forecast = [];
        this.isRunning = false;
        this.changeInterval = 30000; // 30 seconds in real time
        
        this.initializeConditions();
        this.generateInitialWeather();
        this.generateForecast();
    }

    initializeConditions() {
        // Define all weather conditions with their characteristics
        this.conditions.set('sunny', new WeatherCondition(
            'sunny',
            'Sunny',
            'fas fa-sun',
            'Clear skies with bright sunshine. Excellent for solar power generation.',
            0.3,
            45 // 45 minutes average duration
        ));

        this.conditions.set('cloudy', new WeatherCondition(
            'cloudy',
            'Cloudy',
            'fas fa-cloud',
            'Overcast skies with scattered clouds. Reduced solar efficiency.',
            0.25,
            60
        ));

        this.conditions.set('windy', new WeatherCondition(
            'windy',
            'Windy',
            'fas fa-wind',
            'Strong winds across the area. Ideal for wind turbine operation.',
            0.2,
            40
        ));

        this.conditions.set('rainy', new WeatherCondition(
            'rainy',
            'Rainy',
            'fas fa-cloud-rain',
            'Steady rainfall increases water levels. Great for hydroelectric power.',
            0.15,
            75
        ));

        this.conditions.set('stormy', new WeatherCondition(
            'stormy',
            'Stormy',
            'fas fa-bolt',
            'Severe weather with high winds and heavy rain. Mixed energy effects.',
            0.1,
            30
        ));
    }

    generateInitialWeather() {
        // Start with a random weather condition based on probabilities
        const weatherTypes = Array.from(this.conditions.keys());
        const randomWeather = this.selectRandomWeather();
        this.setWeather(randomWeather);
    }

    selectRandomWeather() {
        const conditions = Array.from(this.conditions.values());
        const totalProbability = conditions.reduce((sum, condition) => sum + condition.probability, 0);
        let random = Math.random() * totalProbability;
        
        for (const condition of conditions) {
            random -= condition.probability;
            if (random <= 0) {
                return condition.type;
            }
        }
        
        return 'sunny'; // Fallback
    }

    setWeather(weatherType) {
        const condition = this.conditions.get(weatherType);
        if (!condition) return false;

        const previousWeather = this.currentWeather;
        this.currentWeather = condition;

        // Add to history
        this.weatherHistory.push({
            weather: weatherType,
            timestamp: Date.now(),
            duration: condition.duration
        });

        // Keep history manageable
        if (this.weatherHistory.length > 50) {
            this.weatherHistory.shift();
        }

        // Notify listeners of weather change
        this.notifyWeatherChange(previousWeather, condition);

        return true;
    }

    getCurrentWeather() {
        return this.currentWeather;
    }

    getCurrentWeatherType() {
        return this.currentWeather ? this.currentWeather.type : 'sunny';
    }

    getWeatherEffect(energyType) {
        if (!this.currentWeather) return { multiplier: 1.0, description: 'No weather data' };
        return this.currentWeather.getEffect(energyType);
    }

    getAllWeatherEffects() {
        if (!this.currentWeather) return {};
        
        const effects = {};
        const energyTypes = ['solar', 'wind', 'hydro', 'geothermal', 'biomass'];
        
        energyTypes.forEach(type => {
            effects[type] = this.currentWeather.getEffect(type);
        });
        
        return effects;
    }

    startWeatherSystem() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.scheduleNextWeatherChange();
    }

    stopWeatherSystem() {
        if (this.weatherTimer) {
            clearTimeout(this.weatherTimer);
            this.weatherTimer = null;
        }
        this.isRunning = false;
    }

    scheduleNextWeatherChange() {
        if (!this.isRunning) return;

        const currentCondition = this.currentWeather;
        const baseDuration = currentCondition ? currentCondition.duration * 1000 : this.changeInterval;
        
        // Add some randomness to the duration (±30%)
        const variation = baseDuration * 0.3;
        const actualDuration = baseDuration + (Math.random() - 0.5) * 2 * variation;

        this.weatherTimer = setTimeout(() => {
            this.changeWeather();
            this.scheduleNextWeatherChange();
        }, Math.max(actualDuration, 10000)); // Minimum 10 seconds
    }

    changeWeather() {
        const currentType = this.getCurrentWeatherType();
        let newWeatherType;
        
        // Use transition probabilities for more realistic weather patterns
        const transitions = this.getWeatherTransitions(currentType);
        newWeatherType = this.selectWeatherFromTransitions(transitions);
        
        this.setWeather(newWeatherType);
        this.updateForecast();
    }

    getWeatherTransitions(currentWeather) {
        // Define realistic weather transition probabilities
        const transitions = {
            sunny: {
                sunny: 0.4,
                cloudy: 0.35,
                windy: 0.15,
                rainy: 0.08,
                stormy: 0.02
            },
            cloudy: {
                sunny: 0.3,
                cloudy: 0.3,
                windy: 0.2,
                rainy: 0.17,
                stormy: 0.03
            },
            windy: {
                sunny: 0.25,
                cloudy: 0.25,
                windy: 0.25,
                rainy: 0.15,
                stormy: 0.1
            },
            rainy: {
                sunny: 0.15,
                cloudy: 0.35,
                windy: 0.2,
                rainy: 0.2,
                stormy: 0.1
            },
            stormy: {
                sunny: 0.1,
                cloudy: 0.3,
                windy: 0.25,
                rainy: 0.25,
                stormy: 0.1
            }
        };
        
        return transitions[currentWeather] || transitions.sunny;
    }

    selectWeatherFromTransitions(transitions) {
        let random = Math.random();
        
        for (const [weatherType, probability] of Object.entries(transitions)) {
            random -= probability;
            if (random <= 0) {
                return weatherType;
            }
        }
        
        return 'sunny'; // Fallback
    }

    generateForecast() {
        this.forecast = [];
        let currentType = this.getCurrentWeatherType();
        
        for (let day = 1; day <= this.forecastDays; day++) {
            const transitions = this.getWeatherTransitions(currentType);
            const nextWeather = this.selectWeatherFromTransitions(transitions);
            const condition = this.conditions.get(nextWeather);
            
            this.forecast.push({
                day: day,
                weather: nextWeather,
                condition: condition,
                confidence: this.calculateForecastConfidence(day)
            });
            
            currentType = nextWeather;
        }
    }

    updateForecast() {
        // Shift forecast and add new day
        this.forecast.shift();
        
        if (this.forecast.length > 0) {
            const lastForecast = this.forecast[this.forecast.length - 1];
            const transitions = this.getWeatherTransitions(lastForecast.weather);
            const nextWeather = this.selectWeatherFromTransitions(transitions);
            const condition = this.conditions.get(nextWeather);
            
            this.forecast.push({
                day: this.forecastDays,
                weather: nextWeather,
                condition: condition,
                confidence: this.calculateForecastConfidence(this.forecastDays)
            });
        } else {
            this.generateForecast();
        }
    }

    calculateForecastConfidence(day) {
        // Confidence decreases with time
        return Math.max(0.5, 1 - (day - 1) * 0.15);
    }

    getForecast() {
        return this.forecast.slice(); // Return copy
    }

    getWeatherHistory(limit = 10) {
        return this.weatherHistory.slice(-limit);
    }

    addEventListener(callback) {
        this.eventListeners.push(callback);
    }

    removeEventListener(callback) {
        const index = this.eventListeners.indexOf(callback);
        if (index > -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    notifyWeatherChange(previousWeather, newWeather) {
        const eventData = {
            previous: previousWeather,
            current: newWeather,
            timestamp: Date.now(),
            effects: this.getAllWeatherEffects()
        };

        this.eventListeners.forEach(callback => {
            try {
                callback(eventData);
            } catch (error) {
                console.error('Weather event listener error:', error);
            }
        });
    }

    // Manual weather control for educational purposes
    forceWeatherChange(weatherType) {
        if (this.conditions.has(weatherType)) {
            this.setWeather(weatherType);
            this.updateForecast();
            return true;
        }
        return false;
    }

    getWeatherStats() {
        const stats = {
            current: this.currentWeather ? this.currentWeather.type : null,
            totalChanges: this.weatherHistory.length,
            averageDuration: 0,
            weatherFrequency: {}
        };

        // Calculate frequency and average duration
        if (this.weatherHistory.length > 0) {
            const weatherCounts = {};
            let totalDuration = 0;

            this.weatherHistory.forEach(entry => {
                weatherCounts[entry.weather] = (weatherCounts[entry.weather] || 0) + 1;
                totalDuration += entry.duration;
            });

            stats.averageDuration = totalDuration / this.weatherHistory.length;
            
            Object.entries(weatherCounts).forEach(([weather, count]) => {
                stats.weatherFrequency[weather] = (count / this.weatherHistory.length) * 100;
            });
        }

        return stats;
    }

    reset() {
        this.stopWeatherSystem();
        this.weatherHistory = [];
        this.forecast = [];
        this.generateInitialWeather();
        this.generateForecast();
    }

    exportData() {
        return {
            currentWeather: this.currentWeather ? this.currentWeather.type : null,
            weatherHistory: this.weatherHistory.slice(-10), // Last 10 weather changes
            isRunning: this.isRunning
        };
    }

    importData(data) {
        if (data.currentWeather) {
            this.setWeather(data.currentWeather);
        }
        
        if (data.weatherHistory) {
            this.weatherHistory = data.weatherHistory;
        }
        
        if (data.isRunning) {
            this.startWeatherSystem();
        }
        
        this.generateForecast();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeatherCondition, WeatherSystem };
}
