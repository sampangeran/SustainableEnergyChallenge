/**
 * Budget Planner
 * Interactive city energy budget planner for educational purposes
 */

class BudgetPlanner {
    constructor(energyManager, zoneManager) {
        this.energyManager = energyManager;
        this.zoneManager = zoneManager;
        
        // Budget settings
        this.initialBudget = 500000; // $500,000 starting budget
        this.currentBudget = this.initialBudget;
        this.spentAmount = 0;
        
        // Financial parameters
        this.electricityRate = 0.12; // $0.12 per kWh
        this.carbonCreditRate = 25; // $25 per ton CO2
        this.maintenanceRate = 0.02; // 2% of installation cost per year
        this.inflationRate = 0.03; // 3% annual inflation
        this.projectLifetime = 25; // 25-year project lifetime
        
        // Budget categories
        this.budgetCategories = {
            solar: { allocated: 0, spent: 0, planned: 0 },
            wind: { allocated: 0, spent: 0, planned: 0 },
            hydro: { allocated: 0, spent: 0, planned: 0 },
            geothermal: { allocated: 0, spent: 0, planned: 0 },
            biomass: { allocated: 0, spent: 0, planned: 0 },
            infrastructure: { allocated: 50000, spent: 0, planned: 0 },
            maintenance: { allocated: 0, spent: 0, planned: 0 },
            contingency: { allocated: 50000, spent: 0, planned: 0 }
        };
        
        // Financing options
        this.financingOptions = {
            cash: { rate: 0, term: 0, description: "Pay in full" },
            loan: { rate: 0.05, term: 15, description: "15-year loan at 5%" },
            lease: { rate: 0.07, term: 20, description: "20-year lease at 7%" },
            grant: { rate: 0, term: 0, description: "Government grant (limited)" }
        };
        
        // Available grants
        this.availableGrants = {
            renewable: { amount: 100000, used: 0, description: "Renewable Energy Grant" },
            efficiency: { amount: 50000, used: 0, description: "Energy Efficiency Grant" },
            community: { amount: 75000, used: 0, description: "Community Development Grant" }
        };
        
        this.projectedSavings = [];
        this.isVisible = false;
        
        console.log('BudgetPlanner initialized');
    }

    show() {
        this.isVisible = true;
        this.createBudgetModal();
        this.updateBudgetDisplay();
    }

    hide() {
        this.isVisible = false;
        const modal = document.getElementById('budget-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    createBudgetModal() {
        let modal = document.getElementById('budget-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'budget-modal';
            modal.className = 'modal budget-modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content budget-content">
                <span class="close">&times;</span>
                <h2>💰 Energy Budget Planner</h2>
                
                <div class="budget-tabs">
                    <button class="budget-tab active" data-tab="overview">Overview</button>
                    <button class="budget-tab" data-tab="allocation">Budget Allocation</button>
                    <button class="budget-tab" data-tab="financing">Financing Options</button>
                    <button class="budget-tab" data-tab="projections">Financial Projections</button>
                    <button class="budget-tab" data-tab="comparison">Cost Comparison</button>
                </div>

                <div class="budget-tab-content" id="overview-tab">
                    <div class="budget-overview">
                        <div class="budget-summary-cards">
                            <div class="budget-card total-budget">
                                <h3>Total Budget</h3>
                                <div class="budget-amount" id="total-budget">$${this.initialBudget.toLocaleString()}</div>
                                <div class="budget-subtitle">Initial allocation</div>
                            </div>
                            <div class="budget-card remaining-budget">
                                <h3>Remaining</h3>
                                <div class="budget-amount" id="remaining-budget">$${this.currentBudget.toLocaleString()}</div>
                                <div class="budget-subtitle">Available to spend</div>
                            </div>
                            <div class="budget-card spent-budget">
                                <h3>Spent</h3>
                                <div class="budget-amount" id="spent-budget">$${this.spentAmount.toLocaleString()}</div>
                                <div class="budget-subtitle">Total expenditure</div>
                            </div>
                        </div>
                        
                        <div class="budget-progress">
                            <h4>Budget Utilization</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" id="budget-progress-fill"></div>
                            </div>
                            <div class="progress-labels">
                                <span>$0</span>
                                <span id="budget-percentage">0%</span>
                                <span>$${this.initialBudget.toLocaleString()}</span>
                            </div>
                        </div>

                        <div class="quick-actions">
                            <h4>Quick Actions</h4>
                            <button class="btn btn-primary" id="reset-budget">Reset Budget</button>
                            <button class="btn btn-secondary" id="optimize-budget">Optimize Allocation</button>
                            <button class="btn btn-accent" id="export-budget">Export Plan</button>
                        </div>
                    </div>
                </div>

                <div class="budget-tab-content" id="allocation-tab" style="display: none;">
                    <div class="budget-allocation">
                        <h4>Category Budget Allocation</h4>
                        <div id="budget-categories" class="budget-categories">
                            <!-- Categories will be populated by JavaScript -->
                        </div>
                        
                        <div class="allocation-controls">
                            <h4>Adjust Budget</h4>
                            <div class="budget-adjuster">
                                <label for="budget-slider">Total Budget: $<span id="budget-value">${this.initialBudget.toLocaleString()}</span></label>
                                <input type="range" id="budget-slider" min="100000" max="2000000" step="25000" value="${this.initialBudget}">
                                <div class="slider-labels">
                                    <span>$100k</span>
                                    <span>$2M</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="budget-tab-content" id="financing-tab" style="display: none;">
                    <div class="financing-options">
                        <h4>Financing Options</h4>
                        <div class="financing-cards">
                            ${Object.entries(this.financingOptions).map(([key, option]) => `
                                <div class="financing-card" data-option="${key}">
                                    <h5>${option.description}</h5>
                                    <div class="financing-details">
                                        <div class="financing-rate">Rate: ${(option.rate * 100).toFixed(1)}%</div>
                                        <div class="financing-term">Term: ${option.term} years</div>
                                    </div>
                                    <button class="btn btn-outline" onclick="budgetPlanner.selectFinancing('${key}')">Select</button>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="grants-section">
                            <h4>Available Grants</h4>
                            <div class="grants-list">
                                ${Object.entries(this.availableGrants).map(([key, grant]) => `
                                    <div class="grant-item">
                                        <div class="grant-info">
                                            <h5>${grant.description}</h5>
                                            <div class="grant-amount">$${grant.amount.toLocaleString()} available</div>
                                            <div class="grant-used">Used: $${grant.used.toLocaleString()}</div>
                                        </div>
                                        <button class="btn btn-success" onclick="budgetPlanner.applyGrant('${key}')" 
                                                ${grant.used >= grant.amount ? 'disabled' : ''}>
                                            Apply Grant
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="budget-tab-content" id="projections-tab" style="display: none;">
                    <div class="financial-projections">
                        <h4>25-Year Financial Projection</h4>
                        <div class="projection-summary">
                            <div class="projection-metric">
                                <label>Total Investment:</label>
                                <span id="total-investment">$0</span>
                            </div>
                            <div class="projection-metric">
                                <label>Annual Energy Savings:</label>
                                <span id="annual-savings">$0</span>
                            </div>
                            <div class="projection-metric">
                                <label>Payback Period:</label>
                                <span id="payback-period">-- years</span>
                            </div>
                            <div class="projection-metric">
                                <label>Net Present Value:</label>
                                <span id="net-present-value">$0</span>
                            </div>
                            <div class="projection-metric">
                                <label>Return on Investment:</label>
                                <span id="roi-percentage">0%</span>
                            </div>
                        </div>
                        
                        <div class="projection-chart">
                            <canvas id="financial-chart" width="600" height="300"></canvas>
                        </div>
                    </div>
                </div>

                <div class="budget-tab-content" id="comparison-tab" style="display: none;">
                    <div class="cost-comparison">
                        <h4>Energy Source Cost Analysis</h4>
                        <div class="comparison-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Energy Source</th>
                                        <th>Initial Cost</th>
                                        <th>Cost per kW</th>
                                        <th>Annual Maintenance</th>
                                        <th>Lifetime Cost</th>
                                        <th>Efficiency Rating</th>
                                    </tr>
                                </thead>
                                <tbody id="comparison-table-body">
                                    <!-- Comparison data will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="recommendation-panel">
                            <h4>Budget Recommendations</h4>
                            <div id="budget-recommendations">
                                <!-- Recommendations will be generated based on current city state -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        this.setupBudgetEventListeners();
        this.updateAllTabs();
    }

    setupBudgetEventListeners() {
        const modal = document.getElementById('budget-modal');
        
        // Close modal
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => this.hide();
        
        // Tab switching
        const tabs = modal.querySelectorAll('.budget-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
        
        // Budget slider
        const budgetSlider = document.getElementById('budget-slider');
        if (budgetSlider) {
            budgetSlider.addEventListener('input', (e) => {
                this.updateBudgetAmount(parseInt(e.target.value));
            });
        }
        
        // Quick action buttons
        const resetBtn = document.getElementById('reset-budget');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetBudget());
        }
        
        const optimizeBtn = document.getElementById('optimize-budget');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => this.optimizeBudget());
        }
        
        const exportBtn = document.getElementById('export-budget');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportBudgetPlan());
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        const allTabs = document.querySelectorAll('.budget-tab-content');
        allTabs.forEach(tab => tab.style.display = 'none');
        
        // Remove active class from all tab buttons
        const allTabButtons = document.querySelectorAll('.budget-tab');
        allTabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }
        
        // Add active class to selected tab button
        const selectedTabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedTabButton) {
            selectedTabButton.classList.add('active');
        }
        
        // Update tab-specific content
        this.updateTabContent(tabName);
    }

    updateTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                this.updateOverviewTab();
                break;
            case 'allocation':
                this.updateAllocationTab();
                break;
            case 'financing':
                this.updateFinancingTab();
                break;
            case 'projections':
                this.updateProjectionsTab();
                break;
            case 'comparison':
                this.updateComparisonTab();
                break;
        }
    }

    updateAllTabs() {
        this.updateOverviewTab();
        this.updateAllocationTab();
        this.updateFinancingTab();
        this.updateProjectionsTab();
        this.updateComparisonTab();
    }

    updateBudgetDisplay() {
        if (!this.isVisible) return;
        
        this.currentBudget = this.initialBudget - this.spentAmount;
        
        // Update overview elements
        const totalBudgetEl = document.getElementById('total-budget');
        const remainingBudgetEl = document.getElementById('remaining-budget');
        const spentBudgetEl = document.getElementById('spent-budget');
        const budgetProgressEl = document.getElementById('budget-progress-fill');
        const budgetPercentageEl = document.getElementById('budget-percentage');
        
        if (totalBudgetEl) totalBudgetEl.textContent = `$${this.initialBudget.toLocaleString()}`;
        if (remainingBudgetEl) remainingBudgetEl.textContent = `$${this.currentBudget.toLocaleString()}`;
        if (spentBudgetEl) spentBudgetEl.textContent = `$${this.spentAmount.toLocaleString()}`;
        
        const spentPercentage = (this.spentAmount / this.initialBudget) * 100;
        if (budgetProgressEl) budgetProgressEl.style.width = `${spentPercentage}%`;
        if (budgetPercentageEl) budgetPercentageEl.textContent = `${spentPercentage.toFixed(1)}%`;
    }

    updateOverviewTab() {
        this.updateBudgetDisplay();
    }

    updateAllocationTab() {
        const categoriesContainer = document.getElementById('budget-categories');
        if (!categoriesContainer) return;
        
        categoriesContainer.innerHTML = Object.entries(this.budgetCategories).map(([category, data]) => `
            <div class="budget-category-item">
                <div class="category-header">
                    <h5>${this.formatCategoryName(category)}</h5>
                    <div class="category-amounts">
                        <span class="allocated">Allocated: $${data.allocated.toLocaleString()}</span>
                        <span class="spent">Spent: $${data.spent.toLocaleString()}</span>
                    </div>
                </div>
                <div class="category-controls">
                    <input type="range" 
                           class="category-slider" 
                           data-category="${category}"
                           min="0" 
                           max="${Math.floor(this.initialBudget * 0.5)}" 
                           step="5000" 
                           value="${data.allocated}">
                    <div class="category-percentage">
                        ${((data.allocated / this.initialBudget) * 100).toFixed(1)}%
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to sliders
        const sliders = categoriesContainer.querySelectorAll('.category-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const category = e.target.getAttribute('data-category');
                const amount = parseInt(e.target.value);
                this.updateCategoryAllocation(category, amount);
            });
        });
    }

    updateCategoryAllocation(category, amount) {
        this.budgetCategories[category].allocated = amount;
        this.updateAllocationTab();
        this.updateOverviewTab();
    }

    updateBudgetAmount(newAmount) {
        this.initialBudget = newAmount;
        this.currentBudget = newAmount - this.spentAmount;
        
        const budgetValueEl = document.getElementById('budget-value');
        if (budgetValueEl) {
            budgetValueEl.textContent = newAmount.toLocaleString();
        }
        
        this.updateBudgetDisplay();
    }

    formatCategoryName(category) {
        const names = {
            solar: '☀️ Solar Energy',
            wind: '💨 Wind Energy',
            hydro: '💧 Hydro Energy',
            geothermal: '🌋 Geothermal Energy',
            biomass: '🌱 Biomass Energy',
            infrastructure: '🏗️ Infrastructure',
            maintenance: '🔧 Maintenance',
            contingency: '🛡️ Contingency'
        };
        return names[category] || category;
    }

    // Calculate costs based on current city state
    calculateCurrentCosts() {
        this.spentAmount = this.energyManager.getTotalCost();
        
        // Update category spending based on energy installations
        const energyMix = this.energyManager.getEnergyMix();
        Object.entries(energyMix).forEach(([type, data]) => {
            if (this.budgetCategories[type]) {
                const source = this.energyManager.getSource(type);
                this.budgetCategories[type].spent = data.count * source.baseCost;
            }
        });
        
        this.updateBudgetDisplay();
    }

    // Additional methods for financing, projections, etc. will be added...
    
    selectFinancing(option) {
        // Implementation for financing selection
        console.log(`Selected financing option: ${option}`);
    }
    
    applyGrant(grantType) {
        // Implementation for grant application
        console.log(`Applying for grant: ${grantType}`);
    }
    
    resetBudget() {
        this.initialBudget = 500000;
        this.currentBudget = this.initialBudget;
        this.spentAmount = 0;
        Object.keys(this.budgetCategories).forEach(category => {
            this.budgetCategories[category] = { allocated: 0, spent: 0, planned: 0 };
        });
        this.budgetCategories.infrastructure.allocated = 50000;
        this.budgetCategories.contingency.allocated = 50000;
        this.updateAllTabs();
    }
    
    optimizeBudget() {
        // Implementation for budget optimization
        console.log('Optimizing budget allocation...');
    }
    
    exportBudgetPlan() {
        // Implementation for exporting budget plan
        console.log('Exporting budget plan...');
    }

    updateFinancingTab() {
        // Update financing options display
    }

    updateProjectionsTab() {
        // Update financial projections
    }

    updateComparisonTab() {
        // Update cost comparison table
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BudgetPlanner };
}