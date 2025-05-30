/**
 * Budget Management System
 * Handles city budget, costs, and financial constraints for energy infrastructure
 */

class BudgetManager {
    constructor() {
        this.initialBudget = 1000000; // Starting budget in dollars
        this.currentBudget = this.initialBudget;
        this.totalSpent = 0;
        this.incomePerTurn = 0;
        this.expenses = [];
        this.revenue = [];
        this.eventListeners = [];
    }

    // Initialize budget display and controls
    initialize() {
        this.createBudgetPanel();
        this.updateBudgetDisplay();
    }

    // Create the budget panel UI
    createBudgetPanel() {
        const existingPanel = document.getElementById('budget-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const budgetPanel = document.createElement('div');
        budgetPanel.id = 'budget-panel';
        budgetPanel.className = 'budget-panel';
        budgetPanel.innerHTML = `
            <h3>City Budget</h3>
            <div class="budget-info">
                <div class="budget-item">
                    <span class="budget-label">Available:</span>
                    <span class="budget-value" id="current-budget">$${this.formatMoney(this.currentBudget)}</span>
                </div>
                <div class="budget-item">
                    <span class="budget-label">Total Spent:</span>
                    <span class="budget-value spent" id="total-spent">$${this.formatMoney(this.totalSpent)}</span>
                </div>
                <div class="budget-item">
                    <span class="budget-label">Monthly Income:</span>
                    <span class="budget-value income" id="monthly-income">$${this.formatMoney(this.incomePerTurn)}</span>
                </div>
            </div>
            <div class="budget-controls">
                <button id="budget-details-btn" class="btn-secondary">View Details</button>
            </div>
        `;

        // Insert budget panel into the dashboard sidebar
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            // Insert after the dashboard title but before other sections
            const dashboardTitle = dashboard.querySelector('h3');
            if (dashboardTitle) {
                dashboardTitle.insertAdjacentElement('afterend', budgetPanel);
            } else {
                dashboard.insertBefore(budgetPanel, dashboard.firstChild);
            }
        }

        this.setupBudgetEventListeners();
    }

    // Set up event listeners for budget controls
    setupBudgetEventListeners() {
        const detailsBtn = document.getElementById('budget-details-btn');

        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => this.showBudgetDetails());
        }
    }

    // Check if the city can afford a specific energy source
    canAfford(energySourceType, quantity = 1) {
        const energyManager = window.simulator?.energyManager;
        if (!energyManager) return false;

        const source = energyManager.getSource(energySourceType);
        if (!source) return false;

        const totalCost = source.baseCost * quantity;
        return this.currentBudget >= totalCost;
    }

    // Purchase energy source and deduct from budget
    purchaseEnergySource(energySourceType, quantity = 1) {
        const energyManager = window.simulator?.energyManager;
        if (!energyManager) return false;

        const source = energyManager.getSource(energySourceType);
        if (!source) return false;

        const totalCost = source.baseCost * quantity;

        if (!this.canAfford(energySourceType, quantity)) {
            this.showInsufficientFundsMessage(totalCost);
            return false;
        }

        // Deduct from budget
        this.currentBudget -= totalCost;
        this.totalSpent += totalCost;

        // Record expense
        this.recordExpense({
            type: 'energy_source',
            item: source.name,
            quantity: quantity,
            cost: totalCost,
            timestamp: new Date()
        });

        this.updateBudgetDisplay();
        this.notifyBudgetChange();

        return true;
    }

    // Remove energy source and refund to budget (partial refund)
    sellEnergySource(energySourceType, quantity = 1) {
        const energyManager = window.simulator?.energyManager;
        if (!energyManager) return false;

        const source = energyManager.getSource(energySourceType);
        if (!source) return false;

        // Refund 70% of original cost
        const refundRate = 0.7;
        const totalRefund = source.baseCost * quantity * refundRate;

        this.currentBudget += totalRefund;
        this.totalSpent = Math.max(0, this.totalSpent - totalRefund);

        // Record refund
        this.recordRevenue({
            type: 'energy_source_sale',
            item: source.name,
            quantity: quantity,
            revenue: totalRefund,
            timestamp: new Date()
        });

        this.updateBudgetDisplay();
        this.notifyBudgetChange();

        return true;
    }

    // Update monthly income from city zones
    updateIncome(zoneManager, energyManager, weatherSystem) {
        if (!zoneManager || !energyManager || !weatherSystem) {
            this.incomePerTurn = 0;
            return;
        }

        const weather = weatherSystem.getCurrentWeather();
        this.incomePerTurn = zoneManager.getTotalIncome(energyManager, weather);
        this.updateBudgetDisplay();
    }

    // Apply monthly income to budget
    applyMonthlyIncome() {
        this.currentBudget += this.incomePerTurn;
        
        if (this.incomePerTurn > 0) {
            this.recordRevenue({
                type: 'zone_income',
                item: 'Monthly city revenue',
                revenue: this.incomePerTurn,
                timestamp: new Date()
            });
        }

        this.updateBudgetDisplay();
        this.notifyBudgetChange();
    }

    // Record an expense
    recordExpense(expense) {
        this.expenses.push(expense);
        // Keep only last 50 transactions
        if (this.expenses.length > 50) {
            this.expenses = this.expenses.slice(-50);
        }
    }

    // Record revenue
    recordRevenue(revenue) {
        this.revenue.push(revenue);
        // Keep only last 50 transactions
        if (this.revenue.length > 50) {
            this.revenue = this.revenue.slice(-50);
        }
    }

    // Update budget display
    updateBudgetDisplay() {
        const currentBudgetEl = document.getElementById('current-budget');
        const totalSpentEl = document.getElementById('total-spent');
        const monthlyIncomeEl = document.getElementById('monthly-income');

        if (currentBudgetEl) {
            currentBudgetEl.textContent = `$${this.formatMoney(this.currentBudget)}`;
            currentBudgetEl.className = 'budget-value ' + this.getBudgetStatusClass();
        }

        if (totalSpentEl) {
            totalSpentEl.textContent = `$${this.formatMoney(this.totalSpent)}`;
        }

        if (monthlyIncomeEl) {
            monthlyIncomeEl.textContent = `$${this.formatMoney(this.incomePerTurn)}`;
        }
    }

    // Get CSS class based on budget status
    getBudgetStatusClass() {
        const budgetPercentage = (this.currentBudget / this.initialBudget) * 100;
        
        if (budgetPercentage < 10) return 'critical';
        if (budgetPercentage < 25) return 'low';
        if (budgetPercentage < 50) return 'warning';
        return 'healthy';
    }

    // Show insufficient funds message
    showInsufficientFundsMessage(requiredAmount) {
        const shortage = requiredAmount - this.currentBudget;
        const message = `Insufficient funds! Need $${this.formatMoney(requiredAmount)}, but only have $${this.formatMoney(this.currentBudget)}. Short by $${this.formatMoney(shortage)}.`;
        
        this.showNotification(message, 'error');
    }

    // Show budget details modal
    showBudgetDetails() {
        const modalHtml = `
            <div class="modal-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            ">
                <div class="modal-container" style="
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease;
                ">
                    <div class="modal-header" style="
                        background: linear-gradient(135deg, #3498db, #2c3e50);
                        color: white;
                        padding: 20px;
                        border-radius: 12px 12px 0 0;
                        position: relative;
                    ">
                        <h2 style="margin: 0; font-size: 1.5em;">💰 Budget Details</h2>
                        <button class="modal-close-btn" style="
                            position: absolute;
                            top: 15px;
                            right: 20px;
                            background: none;
                            border: none;
                            color: white;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 5px;
                            border-radius: 50%;
                            transition: background 0.3s ease;
                        ">&times;</button>
                    </div>
                    
                    <div class="modal-content" style="padding: 25px;">
                        <div class="budget-summary-section" style="
                            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                            border-radius: 8px;
                            padding: 20px;
                            margin-bottom: 25px;
                            border-left: 4px solid #3498db;
                        ">
                            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">📊 Financial Overview</h3>
                            
                            <div class="summary-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div class="summary-item" style="
                                    background: white;
                                    padding: 15px;
                                    border-radius: 6px;
                                    border: 1px solid #dee2e6;
                                ">
                                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">Initial Budget</div>
                                    <div style="font-size: 1.3em; font-weight: bold; color: #495057;">$${this.formatMoney(this.initialBudget)}</div>
                                </div>
                                
                                <div class="summary-item" style="
                                    background: white;
                                    padding: 15px;
                                    border-radius: 6px;
                                    border: 1px solid #dee2e6;
                                ">
                                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">Current Budget</div>
                                    <div style="font-size: 1.3em; font-weight: bold;" class="${this.getBudgetStatusClass()}">$${this.formatMoney(this.currentBudget)}</div>
                                </div>
                                
                                <div class="summary-item" style="
                                    background: white;
                                    padding: 15px;
                                    border-radius: 6px;
                                    border: 1px solid #dee2e6;
                                ">
                                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">Total Spent</div>
                                    <div style="font-size: 1.3em; font-weight: bold; color: #dc3545;">$${this.formatMoney(this.totalSpent)}</div>
                                </div>
                                
                                <div class="summary-item" style="
                                    background: white;
                                    padding: 15px;
                                    border-radius: 6px;
                                    border: 1px solid #dee2e6;
                                ">
                                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">Monthly Income</div>
                                    <div style="font-size: 1.3em; font-weight: bold; color: #28a745;">$${this.formatMoney(this.incomePerTurn)}</div>
                                </div>
                                
                                <div class="summary-item" style="
                                    background: white;
                                    padding: 15px;
                                    border-radius: 6px;
                                    border: 1px solid #dee2e6;
                                ">
                                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 5px;">Potential Income</div>
                                    <div style="font-size: 1.3em; font-weight: bold; color: #17a2b8;">$${this.formatMoney(this.calculatePotentialIncome())}</div>
                                </div>
                            </div>
                            
                            <div style="
                                margin-top: 15px;
                                padding: 12px;
                                background: ${this.getBudgetStatusColor()};
                                color: white;
                                border-radius: 6px;
                                text-align: center;
                                font-weight: bold;
                            ">
                                Status: ${this.getBudgetStatusText()}
                            </div>
                        </div>
                        
                        <div class="transactions-section" style="
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 20px;
                            border-left: 4px solid #28a745;
                        ">
                            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">📝 Recent Transactions</h3>
                            <div class="transaction-list" style="max-height: 200px; overflow-y: auto;">
                                ${this.generateTransactionHistoryHTML()}
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 25px;">
                            <button class="close-modal-btn" style="
                                background: #3498db;
                                color: white;
                                border: none;
                                padding: 12px 30px;
                                border-radius: 6px;
                                font-size: 1em;
                                cursor: pointer;
                                transition: background 0.3s ease;
                            ">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translateY(-50px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            .modal-close-btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
            }
            .close-modal-btn:hover {
                background: #2980b9 !important;
            }
        `;
        document.head.appendChild(style);

        // Create and show modal
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHtml;
        document.body.appendChild(modalElement.firstElementChild);

        // Add event listeners
        const modal = document.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close-btn');
        const closeModalBtn = modal.querySelector('.close-modal-btn');

        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                document.head.removeChild(style);
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Get budget status as text
    getBudgetStatusText() {
        const budgetPercentage = (this.currentBudget / this.initialBudget) * 100;
        
        if (budgetPercentage < 10) return 'CRITICAL - Very Low Funds';
        if (budgetPercentage < 25) return 'LOW - Limited Funds';
        if (budgetPercentage < 50) return 'WARNING - Moderate Funds';
        return 'HEALTHY - Good Financial Status';
    }

    // Get budget status color
    getBudgetStatusColor() {
        const budgetPercentage = (this.currentBudget / this.initialBudget) * 100;
        
        if (budgetPercentage < 10) return '#e74c3c';
        if (budgetPercentage < 25) return '#e67e22';
        if (budgetPercentage < 50) return '#f39c12';
        return '#27ae60';
    }

    // Generate transaction history HTML for modal
    generateTransactionHistoryHTML() {
        const allTransactions = [
            ...this.expenses.map(e => ({...e, type: 'expense'})),
            ...this.revenue.map(r => ({...r, type: 'revenue'}))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

        if (allTransactions.length === 0) {
            return `
                <div style="
                    text-align: center;
                    padding: 30px;
                    color: #6c757d;
                    font-style: italic;
                ">
                    <div style="font-size: 2em; margin-bottom: 10px;">📋</div>
                    <div>No transactions yet</div>
                    <div style="font-size: 0.9em; margin-top: 5px;">Start building energy sources to see transaction history</div>
                </div>
            `;
        }

        return allTransactions.map(transaction => {
            const amount = transaction.cost || transaction.revenue;
            const isExpense = transaction.type === 'expense';
            const date = new Date(transaction.timestamp).toLocaleDateString();
            const time = new Date(transaction.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            return `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    margin-bottom: 8px;
                    background: white;
                    border-radius: 6px;
                    border-left: 4px solid ${isExpense ? '#dc3545' : '#28a745'};
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                    <div style="flex: 1;">
                        <div style="
                            font-weight: 500;
                            color: #2c3e50;
                            margin-bottom: 2px;
                        ">${transaction.item}</div>
                        <div style="
                            font-size: 0.85em;
                            color: #6c757d;
                        ">${date} at ${time}</div>
                    </div>
                    <div style="
                        font-weight: bold;
                        font-size: 1.1em;
                        color: ${isExpense ? '#dc3545' : '#28a745'};
                    ">
                        ${isExpense ? '-' : '+'}$${this.formatMoney(amount)}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get transaction summary for simple display
    getTransactionSummary() {
        const allTransactions = [
            ...this.expenses.map(e => ({...e, type: 'expense'})),
            ...this.revenue.map(r => ({...r, type: 'revenue'}))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

        if (allTransactions.length === 0) {
            return '• No transactions yet';
        }

        return allTransactions.map(t => {
            const amount = t.cost || t.revenue;
            const sign = t.type === 'expense' ? '-' : '+';
            const date = new Date(t.timestamp).toLocaleDateString();
            return `• ${sign}$${this.formatMoney(amount)} - ${t.item} (${date})`;
        }).join('\n');
    }

    // Generate transaction history HTML
    generateTransactionHistory() {
        const allTransactions = [
            ...this.expenses.map(e => ({...e, type: 'expense'})),
            ...this.revenue.map(r => ({...r, type: 'revenue'}))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);

        if (allTransactions.length === 0) {
            return '<p class="no-transactions">No transactions yet</p>';
        }

        return allTransactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <span class="transaction-name">${transaction.item}</span>
                    <span class="transaction-date">${new Date(transaction.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'expense' ? '-' : '+'}$${this.formatMoney(transaction.cost || transaction.revenue)}
                </div>
            </div>
        `).join('');
    }

    // Show add funds dialog
    showAddFundsDialog() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal add-funds-modal">
                <div class="modal-header">
                    <h3>Add Funds</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    <p>Add additional funding to your city budget:</p>
                    <div class="funding-options">
                        <button class="funding-btn" data-amount="10000">+$10,000 (Small Grant)</button>
                        <button class="funding-btn" data-amount="25000">+$25,000 (Federal Grant)</button>
                        <button class="funding-btn" data-amount="50000">+$50,000 (Bond Issue)</button>
                        <button class="funding-btn" data-amount="100000">+$100,000 (Major Investment)</button>
                    </div>
                    <div class="custom-amount">
                        <label for="custom-funding">Custom Amount:</label>
                        <input type="number" id="custom-funding" min="1000" max="500000" step="1000" placeholder="Enter amount">
                        <button id="add-custom-funds" class="btn-primary">Add Funds</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set up event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const fundingBtns = modal.querySelectorAll('.funding-btn');
        const customInput = modal.querySelector('#custom-funding');
        const customBtn = modal.querySelector('#add-custom-funds');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        fundingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                this.addFunds(amount, btn.textContent.split('(')[1].replace(')', ''));
                document.body.removeChild(modal);
            });
        });

        customBtn.addEventListener('click', () => {
            const amount = parseInt(customInput.value);
            if (amount && amount >= 1000) {
                this.addFunds(amount, 'Custom Funding');
                document.body.removeChild(modal);
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Add funds to budget
    addFunds(amount, source = 'Additional Funding') {
        this.currentBudget += amount;
        
        this.recordRevenue({
            type: 'funding',
            item: source,
            revenue: amount,
            timestamp: new Date()
        });

        this.updateBudgetDisplay();
        this.notifyBudgetChange();
        this.showNotification(`Added $${this.formatMoney(amount)} from ${source}`, 'success');
    }

    // Calculate potential income if all zones were fully powered
    calculatePotentialIncome() {
        if (!window.simulator || !window.simulator.zoneManager) {
            return 0;
        }
        
        const zoneManager = window.simulator.zoneManager;
        let potentialIncome = 0;
        
        // Calculate maximum possible income from all zones
        zoneManager.zones.forEach((zone, zoneType) => {
            // Only count zones that generate income (residential, commercial, industrial)
            if (zone.income > 0) {
                const maxIncomeFromZone = zone.cells.size * zone.income;
                potentialIncome += maxIncomeFromZone;
            }
        });
        
        return potentialIncome;
    }

    // Format money for display
    formatMoney(amount) {
        return new Intl.NumberFormat('en-US').format(Math.round(amount));
    }

    // Add event listener for budget changes
    addEventListener(callback) {
        this.eventListeners.push(callback);
    }

    // Remove event listener
    removeEventListener(callback) {
        const index = this.eventListeners.indexOf(callback);
        if (index > -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    // Notify listeners of budget changes
    notifyBudgetChange() {
        this.eventListeners.forEach(callback => {
            try {
                callback({
                    currentBudget: this.currentBudget,
                    totalSpent: this.totalSpent,
                    monthlyIncome: this.incomePerTurn
                });
            } catch (error) {
                console.error('Error in budget change listener:', error);
            }
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.simulator && window.simulator.showNotification) {
            window.simulator.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Reset budget to initial state
    reset() {
        this.currentBudget = this.initialBudget;
        this.totalSpent = 0;
        this.incomePerTurn = 0;
        this.expenses = [];
        this.revenue = [];
        this.updateBudgetDisplay();
        this.notifyBudgetChange();
    }

    // Export budget data
    exportData() {
        return {
            initialBudget: this.initialBudget,
            currentBudget: this.currentBudget,
            totalSpent: this.totalSpent,
            incomePerTurn: this.incomePerTurn,
            expenses: this.expenses,
            revenue: this.revenue
        };
    }

    // Import budget data
    importData(data) {
        if (data) {
            this.initialBudget = data.initialBudget || 50000;
            this.currentBudget = data.currentBudget || this.initialBudget;
            this.totalSpent = data.totalSpent || 0;
            this.incomePerTurn = data.incomePerTurn || 0;
            this.expenses = data.expenses || [];
            this.revenue = data.revenue || [];
            this.updateBudgetDisplay();
            this.notifyBudgetChange();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BudgetManager;
}