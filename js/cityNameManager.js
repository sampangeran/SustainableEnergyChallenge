/**
 * City Name Manager
 * Handles city naming functionality and display
 */

class CityNameManager {
    constructor() {
        this.cityName = '';
        this.defaultName = 'New City';
        this.isNameSet = false;
    }
    
    initialize() {
        this.createCityNameDisplay();
        this.loadSavedCityName();
    }
    
    createCityNameDisplay() {
        // Add city name display to header
        const header = document.querySelector('.header');
        if (header) {
            const cityNameDisplay = document.createElement('div');
            cityNameDisplay.id = 'city-name-display';
            cityNameDisplay.className = 'city-name-display';
            cityNameDisplay.innerHTML = `
                <div class="city-name-container">
                    <div class="city-badge">
                        <div class="city-icon">
                            <span>🏙️</span>
                        </div>
                        <div class="city-info">
                            <span class="city-label">Mayor of</span>
                            <span id="city-name-text" class="city-name">${this.cityName || this.defaultName}</span>
                        </div>
                        <button id="edit-city-name" class="edit-name-btn" title="Edit city name">
                            <span>✏️</span>
                        </button>
                    </div>
                </div>
            `;
            
            // Insert after the title
            const title = header.querySelector('h1');
            if (title) {
                title.after(cityNameDisplay);
            } else {
                header.appendChild(cityNameDisplay);
            }
            
            // Add click handler for edit button
            const editButton = document.getElementById('edit-city-name');
            if (editButton) {
                editButton.addEventListener('click', () => {
                    // Use the main app's working dialog instead
                    if (window.simulator) {
                        window.simulator.showEditCityNameDialog();
                    }
                });
            }
        }
        
        this.injectCityNameStyles();
    }
    
    showCityNameDialog(isEdit = false) {
        console.log('Attempting to show city name dialog, isEdit:', isEdit);
        
        // Remove any existing city name modals
        const existingModal = document.querySelector('.city-name-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay city-name-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        modal.innerHTML = `
            <div class="modal city-name-input-modal" style="
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                position: relative;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: #2c5530; font-size: 1.5rem; font-weight: bold;">${isEdit ? 'Rename Your City' : 'Name Your City'}</h3>
                    ${isEdit ? '<button class="modal-close" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>' : ''}
                </div>
                <div class="modal-content">
                    <div class="city-name-form">
                        <label for="city-name-input" style="display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500;">Enter a name for your sustainable city:</label>
                        <input type="text" 
                               id="city-name-input" 
                               placeholder="e.g., Green Valley, Eco Harbor, Solar Springs"
                               maxlength="30"
                               value="${this.cityName || ''}"
                               autofocus
                               style="
                                   width: 100%;
                                   padding: 0.75rem;
                                   border: 2px solid #ddd;
                                   border-radius: 6px;
                                   font-size: 1rem;
                                   box-sizing: border-box;
                                   margin-bottom: 1rem;
                               ">
                        <div class="name-suggestions" style="margin-bottom: 1.5rem;">
                            <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">Suggestions:</p>
                            <div class="suggestion-buttons" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                <button class="suggestion-btn" data-name="Green Valley" style="padding: 0.4rem 0.8rem; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Green Valley</button>
                                <button class="suggestion-btn" data-name="Eco Harbor" style="padding: 0.4rem 0.8rem; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Eco Harbor</button>
                                <button class="suggestion-btn" data-name="Solar Springs" style="padding: 0.4rem 0.8rem; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Solar Springs</button>
                                <button class="suggestion-btn" data-name="Wind Ridge" style="padding: 0.4rem 0.8rem; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Wind Ridge</button>
                                <button class="suggestion-btn" data-name="Renewable City" style="padding: 0.4rem 0.8rem; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Renewable City</button>
                            </div>
                        </div>
                        <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button id="confirm-city-name" class="btn-primary" style="
                                background: #2c5530;
                                color: white;
                                border: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 1rem;
                                font-weight: 500;
                            ">
                                ${isEdit ? 'Update Name' : 'Start Building'}
                            </button>
                            ${isEdit ? '<button id="cancel-city-name" class="btn-secondary" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">Cancel</button>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('City name modal added to DOM');
        
        // Focus the input
        const input = document.getElementById('city-name-input');
        if (input) {
            input.focus();
            input.select();
            console.log('Input focused');
        } else {
            console.log('Input not found');
        }
        
        this.setupCityNameDialogHandlers(modal, isEdit);
    }
    
    setupCityNameDialogHandlers(modal, isEdit) {
        const input = modal.querySelector('#city-name-input');
        const confirmBtn = modal.querySelector('#confirm-city-name');
        const cancelBtn = modal.querySelector('#cancel-city-name');
        const closeBtn = modal.querySelector('.modal-close');
        const suggestionBtns = modal.querySelectorAll('.suggestion-btn');
        
        // Handle suggestion buttons
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                input.value = btn.dataset.name;
                input.focus();
            });
        });
        
        // Handle input validation
        const validateInput = () => {
            const name = input.value.trim();
            confirmBtn.disabled = name.length === 0;
            confirmBtn.textContent = name.length === 0 ? 
                (isEdit ? 'Enter a name' : 'Enter city name') : 
                (isEdit ? 'Update Name' : 'Start Building');
        };
        
        input.addEventListener('input', validateInput);
        validateInput();
        
        // Handle enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !confirmBtn.disabled) {
                this.setCityName(input.value.trim());
                this.closeCityNameDialog(modal);
            }
        });
        
        // Handle confirm
        confirmBtn.addEventListener('click', () => {
            const name = input.value.trim();
            if (name) {
                this.setCityName(name);
                this.closeCityNameDialog(modal);
            }
        });
        
        // Handle cancel/close
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeCityNameDialog(modal);
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeCityNameDialog(modal);
            });
        }
        
        // Handle background click (only for edit mode)
        if (isEdit) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeCityNameDialog(modal);
                }
            });
        }
    }
    
    setCityName(name) {
        this.cityName = name;
        this.isNameSet = true;
        this.updateCityNameDisplay();
        this.saveCityName();
    }
    
    updateCityNameDisplay() {
        const cityNameText = document.getElementById('city-name-text');
        if (cityNameText) {
            cityNameText.textContent = this.cityName || this.defaultName;
        }
        
        // Update page title
        document.title = `${this.cityName || this.defaultName} - Renewable Energy City Simulator`;
    }
    
    closeCityNameDialog(modal) {
        if (modal && modal.parentNode) {
            modal.remove();
        }
    }
    
    showCityNameDialogAfterTutorial() {
        // Only show if name hasn't been set yet
        if (!this.isNameSet) {
            setTimeout(() => {
                this.showCityNameDialog(false);
            }, 1000);
        }
    }
    
    saveCityName() {
        try {
            localStorage.setItem('cityName', this.cityName);
            localStorage.setItem('cityNameSet', 'true');
        } catch (error) {
            console.log('Could not save city name to localStorage');
        }
    }
    
    loadSavedCityName() {
        try {
            const savedName = localStorage.getItem('cityName');
            const nameSet = localStorage.getItem('cityNameSet') === 'true';
            
            if (savedName && nameSet) {
                this.cityName = savedName;
                this.isNameSet = true;
                this.updateCityNameDisplay();
            }
        } catch (error) {
            console.log('Could not load city name from localStorage');
        }
    }
    
    reset() {
        this.cityName = '';
        this.isNameSet = false;
        this.updateCityNameDisplay();
        
        try {
            localStorage.removeItem('cityName');
            localStorage.removeItem('cityNameSet');
        } catch (error) {
            console.log('Could not clear city name from localStorage');
        }
    }
    
    getCityName() {
        return this.cityName || this.defaultName;
    }
    
    isCityNameSet() {
        return this.isNameSet;
    }
    
    injectCityNameStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .city-name-display {
                margin-left: 2rem;
                flex-shrink: 0;
            }
            
            .city-name-container {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .city-badge {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                padding: 0.75rem 1.25rem;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .city-badge::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #2c5530, #4a7c59, #2c5530);
                opacity: 0.8;
            }
            
            .city-badge:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.9));
            }
            
            .city-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #2c5530, #4a7c59);
                border-radius: 8px;
                font-size: 18px;
                box-shadow: 0 2px 8px rgba(44, 85, 48, 0.3);
            }
            
            .city-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                min-width: 0;
            }
            
            .city-label {
                font-size: 0.7rem;
                font-weight: 500;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                line-height: 1;
            }
            
            .city-name {
                font-size: 1rem;
                font-weight: 700;
                color: #2c5530;
                line-height: 1.2;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 140px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .edit-name-btn {
                background: rgba(44, 85, 48, 0.1);
                border: none;
                color: #2c5530;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 6px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 32px;
                height: 32px;
                font-size: 14px;
            }
            
            .edit-name-btn:hover {
                background: rgba(44, 85, 48, 0.15);
                transform: scale(1.05);
            }
            
            .edit-name-btn:active {
                transform: scale(0.95);
            }
            
            @media (max-width: 768px) {
                .city-name-display {
                    margin-left: 1rem;
                }
                
                .city-badge {
                    gap: 0.5rem;
                    padding: 0.6rem 1rem;
                }
                
                .city-icon {
                    width: 30px;
                    height: 30px;
                    font-size: 14px;
                }
                
                .city-label {
                    font-size: 0.65rem;
                }
                
                .city-name {
                    font-size: 0.9rem;
                    max-width: 100px;
                }
                
                .edit-name-btn {
                    min-width: 28px;
                    height: 28px;
                    font-size: 12px;
                }
            }
            
            @media (max-width: 480px) {
                .city-name-display {
                    margin-left: 0.5rem;
                }
                
                .city-badge {
                    gap: 0.4rem;
                    padding: 0.5rem 0.8rem;
                }
                
                .city-name {
                    max-width: 80px;
                }
            }
            
            .city-name-modal .modal {
                max-width: 500px;
                width: 90%;
            }
            
            .city-name-form {
                padding: 20px 0;
            }
            
            .city-name-form label {
                display: block;
                margin-bottom: 10px;
                font-weight: 600;
                color: #2c3e50;
            }
            
            .city-name-form input {
                width: 100%;
                padding: 12px;
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                font-size: 1.1rem;
                margin-bottom: 15px;
                transition: border-color 0.2s ease;
            }
            
            .city-name-form input:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }
            
            .name-suggestions {
                margin: 15px 0;
            }
            
            .name-suggestions p {
                margin: 0 0 8px 0;
                font-size: 0.9rem;
                color: #7f8c8d;
            }
            
            .suggestion-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .suggestion-btn {
                background: #ecf0f1;
                border: 1px solid #bdc3c7;
                border-radius: 20px;
                padding: 6px 12px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #2c3e50;
            }
            
            .suggestion-btn:hover {
                background: #3498db;
                color: white;
                border-color: #3498db;
            }
            
            .modal-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #ecf0f1;
            }
            
            .modal-actions button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            @media (max-width: 768px) {
                .city-name-container {
                    font-size: 1rem;
                }
                
                .suggestion-buttons {
                    justify-content: center;
                }
                
                .modal-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for use in main application
window.CityNameManager = CityNameManager;