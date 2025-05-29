/**
 * Budget Management System
 * Handles city budget, costs, and financial constraints for energy infrastructure
 */

class BudgetManager {
    constructor() {
        this.initialBudget = 50000; // Starting budget in dollars
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
                <button id="add-funds-btn" class="btn-primary">Add Funds</button>
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
        const addFundsBtn = document.getElementById('add-funds-btn');

        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => this.showBudgetDetails());
        }

        if (addFundsBtn) {
            addFundsBtn.addEventListener('click', () => this.showAddFundsDialog());
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
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        modal.innerHTML = `
            <div class="modal budget-details-modal" style="
                background: white;
                border-radius: 8px;
                padding: 20px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            ">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">Budget Details</h3>
                    <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="budget-summary" style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <div class="summary-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                            <span>Initial Budget:</span>
                            <span>$${this.formatMoney(this.initialBudget)}</span>
                        </div>
                        <div class="summary-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                            <span>Current Budget:</span>
                            <span class="${this.getBudgetStatusClass()}">$${this.formatMoney(this.currentBudget)}</span>
                        </div>
                        <div class="summary-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                            <span>Total Spent:</span>
                            <span>$${this.formatMoney(this.totalSpent)}</span>
                        </div>
                        <div class="summary-item" style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span>Monthly Income:</span>
                            <span>$${this.formatMoney(this.incomePerTurn)}</span>
                        </div>
                    </div>
                    
                    <div class="transactions">
                        <h4>Recent Transactions</h4>
                        <div class="transaction-list">
                            ${this.generateTransactionHistory()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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