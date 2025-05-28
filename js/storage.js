/**
 * Storage Manager
 * Handles save/load functionality using localStorage with backup and versioning
 */

class StorageManager {
    constructor(mainApp) {
        this.mainApp = mainApp;
        this.storageKey = 'renewableEnergySimulator';
        this.versionKey = 'renewableEnergySimulator_version';
        this.backupKey = 'renewableEnergySimulator_backup';
        this.autoSaveKey = 'renewableEnergySimulator_autosave';
        
        this.currentVersion = '1.0.0';
        this.maxBackups = 5;
        this.autoSaveInterval = 300000; // 5 minutes
        this.autoSaveTimer = null;
        
        this.setupAutoSave();
    }

    setupAutoSave() {
        // Auto-save every 5 minutes
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.autoSaveInterval);
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
        
        // Auto-save on visibility change (when user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.autoSave();
            }
        });
    }

    saveState(slotName = 'default') {
        try {
            const gameData = this.collectGameData();
            const saveData = {
                version: this.currentVersion,
                timestamp: Date.now(),
                slotName: slotName,
                data: gameData,
                metadata: this.generateMetadata()
            };
            
            const storageKey = slotName === 'default' ? this.storageKey : `${this.storageKey}_${slotName}`;
            
            // Create backup before saving
            this.createBackup(storageKey);
            
            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(saveData));
            
            // Update save list
            this.updateSaveList(slotName, saveData.timestamp);
            
            console.log(`Game saved to slot: ${slotName}`);
            return true;
            
        } catch (error) {
            console.error('Failed to save game:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    loadState(slotName = 'default') {
        try {
            const storageKey = slotName === 'default' ? this.storageKey : `${this.storageKey}_${slotName}`;
            const savedData = localStorage.getItem(storageKey);
            
            if (!savedData) {
                console.log(`No saved data found for slot: ${slotName}`);
                return false;
            }
            
            const saveData = JSON.parse(savedData);
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid save data format');
            }
            
            // Check version compatibility
            if (!this.isVersionCompatible(saveData.version)) {
                const migrated = this.migrateSaveData(saveData);
                if (!migrated) {
                    throw new Error(`Incompatible save version: ${saveData.version}`);
                }
            }
            
            // Load the data into the application
            this.loadGameData(saveData.data);
            
            console.log(`Game loaded from slot: ${slotName}`);
            return true;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            this.handleLoadError(error, slotName);
            return false;
        }
    }

    autoSave() {
        try {
            const gameData = this.collectGameData();
            const autoSaveData = {
                version: this.currentVersion,
                timestamp: Date.now(),
                data: gameData,
                isAutoSave: true
            };
            
            localStorage.setItem(this.autoSaveKey, JSON.stringify(autoSaveData));
            console.log('Auto-save completed');
            
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    loadAutoSave() {
        try {
            const savedData = localStorage.getItem(this.autoSaveKey);
            if (!savedData) return false;
            
            const autoSaveData = JSON.parse(savedData);
            
            if (!this.validateSaveData(autoSaveData)) {
                return false;
            }
            
            this.loadGameData(autoSaveData.data);
            console.log('Auto-save loaded');
            return true;
            
        } catch (error) {
            console.warn('Failed to load auto-save:', error);
            return false;
        }
    }

    collectGameData() {
        return {
            energyManager: this.mainApp.energyManager.exportData(),
            zoneManager: this.mainApp.zoneManager.exportData(),
            weatherSystem: this.mainApp.weatherSystem.exportData(),
            dashboard: this.mainApp.dashboard.exportData(),
            timestamp: Date.now(),
            gameVersion: this.currentVersion
        };
    }

    loadGameData(gameData) {
        if (!gameData) throw new Error('No game data provided');
        
        // Load data into each manager
        if (gameData.energyManager) {
            this.mainApp.energyManager.importData(gameData.energyManager);
        }
        
        if (gameData.zoneManager) {
            this.mainApp.zoneManager.importData(gameData.zoneManager);
        }
        
        if (gameData.weatherSystem) {
            this.mainApp.weatherSystem.importData(gameData.weatherSystem);
        }
        
        if (gameData.dashboard) {
            this.mainApp.dashboard.importData(gameData.dashboard);
        }
        
        // Update the UI
        if (this.mainApp.updateGridDisplay) {
            this.mainApp.updateGridDisplay();
        }
        
        if (this.mainApp.updateWeatherDisplay) {
            this.mainApp.updateWeatherDisplay();
        }
    }

    generateMetadata() {
        const stats = {
            totalZones: 0,
            totalEnergySources: this.mainApp.energyManager.getTotalInstallations(),
            totalCost: this.mainApp.energyManager.getTotalCost(),
            currentWeather: this.mainApp.weatherSystem.getCurrentWeatherType(),
            efficiency: 0
        };
        
        // Calculate total zones
        const zoneStats = this.mainApp.zoneManager.getZoneStats(
            this.mainApp.energyManager,
            this.mainApp.weatherSystem.getCurrentWeatherType()
        );
        
        Object.values(zoneStats).forEach(zone => {
            stats.totalZones += zone.cellCount;
        });
        
        // Calculate efficiency
        const totalProduction = this.mainApp.energyManager.getTotalOutput(stats.currentWeather);
        const totalConsumption = this.mainApp.zoneManager.getTotalEnergyDemand();
        
        if (totalConsumption > 0) {
            stats.efficiency = Math.min(100, (totalProduction / totalConsumption) * 100);
        }
        
        return stats;
    }

    validateSaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        // Check required fields
        const requiredFields = ['version', 'timestamp', 'data'];
        for (const field of requiredFields) {
            if (!(field in saveData)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate timestamp
        if (!Number.isInteger(saveData.timestamp) || saveData.timestamp <= 0) {
            console.error('Invalid timestamp');
            return false;
        }
        
        // Validate data structure
        if (!saveData.data || typeof saveData.data !== 'object') {
            console.error('Invalid data structure');
            return false;
        }
        
        return true;
    }

    isVersionCompatible(version) {
        // Simple version compatibility check
        const current = this.parseVersion(this.currentVersion);
        const saved = this.parseVersion(version);
        
        // Major version must match, minor version can be backward compatible
        return current.major === saved.major && current.minor >= saved.minor;
    }

    parseVersion(versionString) {
        const parts = versionString.split('.').map(Number);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    }

    migrateSaveData(saveData) {
        try {
            const savedVersion = this.parseVersion(saveData.version);
            const currentVersion = this.parseVersion(this.currentVersion);
            
            console.log(`Migrating save data from ${saveData.version} to ${this.currentVersion}`);
            
            // Add migration logic here for future versions
            // For now, attempt basic compatibility
            
            saveData.version = this.currentVersion;
            return saveData;
            
        } catch (error) {
            console.error('Migration failed:', error);
            return null;
        }
    }

    createBackup(storageKey) {
        try {
            const existingData = localStorage.getItem(storageKey);
            if (!existingData) return;
            
            const backups = this.getBackups();
            const newBackup = {
                timestamp: Date.now(),
                data: existingData,
                originalKey: storageKey
            };
            
            backups.push(newBackup);
            
            // Keep only the latest backups
            if (backups.length > this.maxBackups) {
                backups.splice(0, backups.length - this.maxBackups);
            }
            
            localStorage.setItem(this.backupKey, JSON.stringify(backups));
            
        } catch (error) {
            console.warn('Failed to create backup:', error);
        }
    }

    getBackups() {
        try {
            const backupsData = localStorage.getItem(this.backupKey);
            return backupsData ? JSON.parse(backupsData) : [];
        } catch (error) {
            console.warn('Failed to load backups:', error);
            return [];
        }
    }

    restoreFromBackup(backupIndex = 0) {
        try {
            const backups = this.getBackups();
            if (backupIndex >= backups.length) {
                throw new Error('Backup index out of range');
            }
            
            const backup = backups[backups.length - 1 - backupIndex]; // Most recent first
            const saveData = JSON.parse(backup.data);
            
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid backup data');
            }
            
            this.loadGameData(saveData.data);
            console.log(`Restored from backup (${new Date(backup.timestamp).toLocaleString()})`);
            return true;
            
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    }

    updateSaveList(slotName, timestamp) {
        try {
            const saveListKey = `${this.storageKey}_saveList`;
            const saveList = JSON.parse(localStorage.getItem(saveListKey) || '{}');
            
            saveList[slotName] = {
                timestamp: timestamp,
                metadata: this.generateMetadata()
            };
            
            localStorage.setItem(saveListKey, JSON.stringify(saveList));
            
        } catch (error) {
            console.warn('Failed to update save list:', error);
        }
    }

    getSaveList() {
        try {
            const saveListKey = `${this.storageKey}_saveList`;
            const saveList = JSON.parse(localStorage.getItem(saveListKey) || '{}');
            
            // Convert to array and sort by timestamp
            return Object.entries(saveList)
                .map(([slotName, data]) => ({
                    slotName,
                    timestamp: data.timestamp,
                    metadata: data.metadata,
                    formattedDate: new Date(data.timestamp).toLocaleString()
                }))
                .sort((a, b) => b.timestamp - a.timestamp);
                
        } catch (error) {
            console.error('Failed to get save list:', error);
            return [];
        }
    }

    deleteSave(slotName) {
        try {
            const storageKey = slotName === 'default' ? this.storageKey : `${this.storageKey}_${slotName}`;
            localStorage.removeItem(storageKey);
            
            // Update save list
            const saveListKey = `${this.storageKey}_saveList`;
            const saveList = JSON.parse(localStorage.getItem(saveListKey) || '{}');
            delete saveList[slotName];
            localStorage.setItem(saveListKey, JSON.stringify(saveList));
            
            console.log(`Save slot deleted: ${slotName}`);
            return true;
            
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }

    clearStorage() {
        try {
            // Get all storage keys related to this app
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storageKey)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all app-related data
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log('Storage cleared');
            return true;
            
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    exportSave(slotName = 'default') {
        try {
            const storageKey = slotName === 'default' ? this.storageKey : `${this.storageKey}_${slotName}`;
            const savedData = localStorage.getItem(storageKey);
            
            if (!savedData) {
                throw new Error('No save data found');
            }
            
            // Create downloadable file
            const blob = new Blob([savedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `renewable-energy-city-${slotName}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`Save exported: ${slotName}`);
            return true;
            
        } catch (error) {
            console.error('Failed to export save:', error);
            return false;
        }
    }

    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    if (!this.validateSaveData(saveData)) {
                        throw new Error('Invalid save file format');
                    }
                    
                    // Generate unique slot name
                    const slotName = `imported_${Date.now()}`;
                    const storageKey = `${this.storageKey}_${slotName}`;
                    
                    localStorage.setItem(storageKey, JSON.stringify(saveData));
                    this.updateSaveList(slotName, saveData.timestamp);
                    
                    console.log(`Save imported as: ${slotName}`);
                    resolve(slotName);
                    
                } catch (error) {
                    console.error('Failed to import save:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    getStorageUsage() {
        try {
            let totalSize = 0;
            const usage = {};
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storageKey)) {
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    usage[key] = size;
                    totalSize += size;
                }
            }
            
            return {
                totalSize: totalSize,
                totalSizeFormatted: this.formatBytes(totalSize),
                breakdown: usage,
                percentageUsed: this.calculateStoragePercentage(totalSize)
            };
            
        } catch (error) {
            console.error('Failed to calculate storage usage:', error);
            return null;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    calculateStoragePercentage(usedBytes) {
        // Estimate localStorage limit (usually 5-10MB)
        const estimatedLimit = 5 * 1024 * 1024; // 5MB
        return Math.min(100, (usedBytes / estimatedLimit) * 100);
    }

    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            console.error('Storage quota exceeded');
            this.showStorageFullDialog();
        } else {
            console.error('Storage error:', error);
        }
    }

    handleLoadError(error, slotName) {
        console.error(`Failed to load from slot ${slotName}:`, error);
        
        // Try to restore from backup
        const backups = this.getBackups();
        if (backups.length > 0) {
            console.log('Attempting to restore from backup...');
            if (this.restoreFromBackup(0)) {
                console.log('Successfully restored from backup');
            }
        }
    }

    showStorageFullDialog() {
        if (this.mainApp && this.mainApp.showNotification) {
            this.mainApp.showNotification(
                'Storage is full! Please delete some saves or export them to free up space.',
                'warning'
            );
        }
    }

    // Cleanup method
    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager };
}
