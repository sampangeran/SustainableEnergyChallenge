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
                    <i class="fas fa-city"></i>
                    <span id="city-name-text">${this.cityName || this.defaultName}</span>
                    <button id="edit-city-name" class="edit-name-btn" title="Edit city name">
                        <i class="fas fa-edit"></i>
                    </button>
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
                    this.showCityNameDialog(true);
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
        
        // Show success message
        if (window.simulator && window.simulator.showNotification) {
            window.simulator.showNotification(`Welcome to ${name}!`, 'success');
        }
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
                margin: 10px 0;
                padding: 8px 0;
            }
            
            .city-name-container {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 1.2rem;
                color: #2c3e50;
                font-weight: 600;
            }
            
            .city-name-container i {
                color: #3498db;
                font-size: 1.1rem;
            }
            
            .edit-name-btn {
                background: none;
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                padding: 4px 6px;
                cursor: pointer;
                color: #7f8c8d;
                font-size: 0.8rem;
                transition: all 0.2s ease;
            }
            
            .edit-name-btn:hover {
                background: #ecf0f1;
                color: #2c3e50;
                border-color: #95a5a6;
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