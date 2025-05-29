/**
 * Tutorial System - Rebuilt with Consistent Formatting
 * Provides interactive educational guidance for students
 */

class TutorialSystem {
    constructor(mainApp) {
        this.mainApp = mainApp;
        this.isActive = false;
        this.currentStep = 0;
        this.tutorialSteps = [];
        this.modal = null;
        
        this.initializeTutorialSteps();
        this.setupEventListeners();
        this.injectTutorialStyles();
        
        console.log('TutorialSystem initialized');
    }

    initializeTutorialSteps() {
        this.tutorialSteps = [
            {
                title: "Welcome to Sustainable City Challenge!",
                content: `
                    <div class="tutorial-content">
                        <h3>🌱 Learn to Build a Sustainable City!</h3>
                        <p>This advanced simulation teaches you about renewable energy sources and sustainable urban planning.</p>
                        
                        <h4>What you'll learn:</h4>
                        <ul>
                            <li>🌞 7 different energy sources (5 renewable + 2 fossil fuels)</li>
                            <li>🏙️ How city zones generate income when powered</li>
                            <li>🌤️ How weather affects energy production</li>
                            <li>💰 Budget management and economic sustainability</li>
                            <li>🗻 Terrain bonuses for optimal energy placement</li>
                            <li>📊 Real-time performance tracking</li>
                        </ul>
                        
                        <p><strong>Goal:</strong> Build a profitable, sustainable city with $250,000 starting budget!</p>
                    </div>
                `,
                highlight: null,
                action: null
            },
            {
                title: "Understanding Your Budget System",
                content: `
                    <div class="tutorial-content">
                        <h3>💰 Managing Your City Budget</h3>
                        <p>You start with <strong>$250,000</strong> to build your city. Here's how money works:</p>
                        
                        <h4>💸 Expenses:</h4>
                        <ul>
                            <li>Energy sources cost money to build</li>
                            <li>You get 70% refund when removing energy sources</li>
                        </ul>
                        
                        <h4>💵 Income (Monthly):</h4>
                        <ul>
                            <li><strong>Residential:</strong> $120/month (when powered)</li>
                            <li><strong>Commercial:</strong> $250/month (when powered)</li>
                            <li><strong>Industrial:</strong> $400/month (when powered)</li>
                        </ul>
                        
                        <h4>🔋 Power Requirements:</h4>
                        <ul>
                            <li>Zones only generate income if they have enough power</li>
                            <li>Energy is shared across the entire city grid</li>
                            <li>Unpowered zones get red borders and warning icons</li>
                        </ul>
                        
                        <p><strong>Tip:</strong> Click the budget amount to see detailed financial information!</p>
                    </div>
                `,
                highlight: ".budget-display",
                action: null
            },
            {
                title: "City Zones & Strategic Planning",
                content: `
                    <div class="tutorial-content">
                        <h3>🏘️ Building Your City Layout</h3>
                        <p>Create different zones, each with unique energy demands and income potential when properly powered:</p>
                        
                        <div class="zone-explanation">
                            <div class="zone-item">
                                <div class="zone-color residential"></div>
                                <div>
                                    <strong>Residential Zones</strong><br>
                                    <span class="energy-requirement">50kW needed</span> • <span class="income-value">$120/month</span>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color commercial"></div>
                                <div>
                                    <strong>Commercial Zones</strong><br>
                                    <span class="energy-requirement">100kW needed</span> • <span class="income-value">$250/month</span>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color industrial"></div>
                                <div>
                                    <strong>Industrial Zones</strong><br>
                                    <span class="energy-requirement">200kW needed</span> • <span class="income-value">$400/month</span>
                                </div>
                            </div>
                        </div>
                        
                        <h4>💡 Pro Tips:</h4>
                        <ul>
                            <li>Drag across multiple cells for bulk zone creation</li>
                            <li>Unpowered zones show red borders - they generate no income!</li>
                            <li>Plan zone layout before placing expensive energy sources</li>
                            <li>Industrial zones offer highest income but need most power</li>
                        </ul>
                    </div>
                `,
                highlight: ".city-grid",
                action: "enableZoneMode"
            },
            {
                title: "Understanding Energy Sources",
                content: `
                    <div class="tutorial-content">
                        <h3>⚡ Energy Source Types & Costs</h3>
                        <p>Choose from 7 different energy sources, each with unique characteristics:</p>
                        
                        <h4>🌱 Renewable Energy:</h4>
                        <ul>
                            <li><strong>Solar:</strong> $15,000 • 100kW • Enhanced by sunny weather</li>
                            <li><strong>Wind:</strong> $20,000 • 150kW • Boosted by windy conditions</li>
                            <li><strong>Hydro:</strong> $25,000 • 200kW • +60% bonus near rivers</li>
                            <li><strong>Geothermal:</strong> $30,000 • 180kW • +50% bonus in mountains</li>
                            <li><strong>Biomass:</strong> $18,000 • 120kW • +40% bonus in forests</li>
                        </ul>
                        
                        <h4>🏭 Fossil Fuels:</h4>
                        <ul>
                            <li><strong>Coal:</strong> $35,000 • 400kW • High pollution impact</li>
                            <li><strong>Natural Gas:</strong> $28,000 • 300kW • Lower emissions than coal</li>
                        </ul>
                        
                        <p><strong>Advanced Placement:</strong> Drag to select multiple cells, then auto-place energy sources!</p>
                    </div>
                `,
                highlight: ".energy-sources",
                action: null
            },
            {
                title: "Terrain Bonuses & Strategic Placement",
                content: `
                    <div class="tutorial-content">
                        <h3>🗻 Terrain Features & Strategic Placement</h3>
                        <p>The city has specialized terrain that provides efficiency bonuses and penalties. Use the terrain legend to see all effects!</p>
                        
                        <h4>🌲 Forest Terrain:</h4>
                        <ul>
                            <li><span style="color: #28a745;">+40% Biomass</span> <span style="color: #28a745;">+20% Hydro</span></li>
                            <li><span style="color: #dc3545;">-10% Solar</span> <span style="color: #dc3545;">-5% Wind</span></li>
                        </ul>
                        
                        <h4>🏔️ Mountain Terrain:</h4>
                        <ul>
                            <li><span style="color: #28a745;">+50% Geothermal</span> <span style="color: #28a745;">+30% Wind</span> <span style="color: #28a745;">+10% Solar</span></li>
                            <li><span style="color: #dc3545;">-20% Hydro</span></li>
                        </ul>
                        
                        <h4>🏖️ Beach Terrain:</h4>
                        <ul>
                            <li><span style="color: #28a745;">+35% Wind</span> <span style="color: #28a745;">+25% Solar</span></li>
                            <li><span style="color: #dc3545;">-30% Hydro</span></li>
                        </ul>
                        
                        <h4>🌊 River Terrain:</h4>
                        <ul>
                            <li><span style="color: #28a745;">+60% Hydro</span> <span style="color: #28a745;">+20% Biomass</span></li>
                            <li><span style="color: #dc3545;">-10% Geothermal</span></li>
                        </ul>
                        
                        <p><strong>Pro Tip:</strong> Check the terrain legend for complete bonus/penalty information!</p>
                    </div>
                `,
                highlight: ".city-grid",
                action: null
            },
            {
                title: "Weather System & Production",
                content: `
                    <div class="tutorial-content">
                        <h3>🌤️ Dynamic Weather Effects</h3>
                        <p>Weather conditions change every 30-60 seconds and affect energy production:</p>
                        
                        <ul>
                            <li><strong>☀️ Sunny:</strong> Solar +20%, others normal</li>
                            <li><strong>☁️ Cloudy:</strong> Solar -30%, others normal</li>
                            <li><strong>🌧️ Rainy:</strong> Solar -50%, Hydro +30%</li>
                            <li><strong>💨 Windy:</strong> Wind +40%, Solar -10%</li>
                        </ul>
                        
                        <h4>Advanced Features:</h4>
                        <ul>
                            <li>Weather forecast shows upcoming conditions</li>
                            <li>Real-time production updates based on weather</li>
                            <li>Diversify energy sources to handle weather changes</li>
                            <li>Income calculations adjust with production changes</li>
                        </ul>
                    </div>
                `,
                highlight: ".weather-display",
                action: null
            },
            {
                title: "Dashboard & Performance Monitoring",
                content: `
                    <div class="tutorial-content">
                        <h3>📊 Real-Time Performance Dashboard</h3>
                        <p>The dashboard provides comprehensive city performance metrics:</p>
                        
                        <h4>📈 Key Metrics:</h4>
                        <ul>
                            <li><strong>Energy Production:</strong> Total kW generated vs demanded</li>
                            <li><strong>Efficiency:</strong> How well your city meets energy needs</li>
                            <li><strong>Carbon Reduction:</strong> Environmental impact tracking</li>
                            <li><strong>Sustainability Score:</strong> Overall city performance grade</li>
                        </ul>
                        
                        <h4>💡 Performance Insights:</h4>
                        <ul>
                            <li>Energy mix breakdown showing source diversity</li>
                            <li>Zone-by-zone performance analysis</li>
                            <li>Financial projections and trends</li>
                            <li>Achievement system for milestones</li>
                        </ul>
                        
                        <p><strong>Use the dashboard to:</strong> Track progress, identify problems, and optimize your city design!</p>
                    </div>
                `,
                highlight: ".dashboard",
                action: null
            },
            {
                title: "Dashboard & Sustainability Scoring",
                content: `
                    <div class="tutorial-content">
                        <h3>📊 Advanced Performance Tracking</h3>
                        <p>The dashboard provides comprehensive performance metrics and sustainability scoring:</p>
                        
                        <h4>📈 Key Metrics:</h4>
                        <ul>
                            <li><strong>Base Production:</strong> Energy output with terrain bonuses</li>
                            <li><strong>Current Production:</strong> Real-time output with weather effects</li>
                            <li><strong>Grid Efficiency:</strong> How well production meets demand</li>
                            <li><strong>Monthly Income:</strong> Revenue from powered zones</li>
                        </ul>
                        
                        <h4>🌟 Sustainability Score (0-100):</h4>
                        <ul>
                            <li><strong>Energy Efficiency (25 pts):</strong> Production vs demand ratio</li>
                            <li><strong>Carbon Impact (20 pts):</strong> CO₂ reduction achievements</li>
                            <li><strong>Energy Diversity (20 pts):</strong> Variety of renewable sources</li>
                            <li><strong>Grid Reliability (15 pts):</strong> Consistent power coverage</li>
                            <li><strong>Innovation (10 pts):</strong> Advanced technology usage</li>
                            <li><strong>Community Impact (10 pts):</strong> Zones fully powered</li>
                        </ul>
                        
                        <p><strong>Grades:</strong> Achieve A+ (90+) for exceptional sustainability leadership!</p>
                    </div>
                `,
                highlight: ".dashboard",
                action: null
            },
            {
                title: "Creating Your First Zone",
                content: `
                    <div class="tutorial-content">
                        <h3>🎯 Let's Create a Residential Zone</h3>
                        <p>Follow these steps:</p>
                        <ol>
                            <li>Make sure "Zone Mode" is selected (orange button)</li>
                            <li>Select "Residential" from the dropdown</li>
                            <li>Click on any empty grid cell to create a residential zone</li>
                        </ol>
                        
                        <p>The cell will turn green and display its energy requirements. Remember: zones only generate income when properly powered!</p>
                        
                        <div class="tutorial-tip">
                            💡 <strong>Advanced Tip:</strong> Drag across multiple cells to create zones in bulk!
                        </div>
                    </div>
                `,
                highlight: ".grid-controls",
                action: "waitForZoneCreation"
            },
            {
                title: "You're Ready to Build!",
                content: `
                    <div class="tutorial-content">
                        <h3>🎉 Ready for Advanced City Planning!</h3>
                        <p>You now understand all the advanced features of the renewable energy city simulator!</p>
                        
                        <h4>Your Next Steps:</h4>
                        <ol>
                            <li><strong>Plan strategically:</strong> Use terrain bonuses for optimal placement</li>
                            <li><strong>Manage budget:</strong> Balance costs with income potential</li>
                            <li><strong>Diversify energy:</strong> Mix renewable sources for weather resilience</li>
                            <li><strong>Monitor performance:</strong> Use the dashboard to track efficiency</li>
                            <li><strong>Experiment:</strong> Try different city layouts and energy mixes</li>
                            <li><strong>Compare options:</strong> Test renewable vs fossil fuel scenarios</li>
                        </ol>
                        
                        <div class="tutorial-tip">
                            🎯 <strong>Challenge:</strong> Can you build a 100% renewable city that's profitable?
                        </div>
                        
                        <p><strong>Remember:</strong> You can restart this tutorial anytime by clicking the "Tutorial" button!</p>
                    </div>
                `,
                highlight: null,
                action: "completeTutorial"
            }
        ];
    }

    setupEventListeners() {
        // Listen for tutorial completion events
        document.addEventListener('tutorialStepCompleted', (event) => {
            if (this.isActive) {
                this.nextStep();
            }
        });
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.showTutorialModal();
        this.showCurrentStep();
        
        console.log('Tutorial started');
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.hideTutorialModal();
        this.clearHighlights();
        
        console.log('Tutorial stopped');
    }

    nextStep() {
        if (!this.isActive) return;
        
        this.clearHighlights();
        this.currentStep++;
        
        if (this.currentStep >= this.tutorialSteps.length) {
            this.completeTutorial();
        } else {
            this.showCurrentStep();
        }
    }

    previousStep() {
        if (!this.isActive || this.currentStep <= 0) return;
        
        this.clearHighlights();
        this.currentStep--;
        this.showCurrentStep();
    }

    showCurrentStep() {
        const step = this.tutorialSteps[this.currentStep];
        if (!step) return;
        
        this.updateTutorialContent(step);
        this.updateNavigationButtons();
        
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }
        
        if (step.action) {
            this.executeStepAction(step.action);
        }
    }

    showTutorialModal() {
        this.createTutorialModal();
        this.setupModalHandlers();
    }

    createTutorialModal() {
        // Create spotlight overlay
        const overlay = document.createElement('div');
        overlay.id = 'tutorialSpotlightOverlay';
        overlay.className = 'tutorial-spotlight-overlay';
        
        // Create floating tutorial panel
        const panel = document.createElement('div');
        panel.id = 'tutorialPanel';
        panel.className = 'tutorial-spotlight-panel';
        panel.innerHTML = `
            <div class="tutorial-header">
                <h2 id="tutorialTitle">Tutorial</h2>
                <button class="tutorial-close" id="tutorialClose">&times;</button>
            </div>
            <div class="tutorial-body" id="tutorialBody">
                <!-- Content will be inserted here -->
            </div>
            <div class="tutorial-footer">
                <button class="tutorial-btn tutorial-btn-secondary" id="tutorialPrev">Previous</button>
                <span class="tutorial-progress" id="tutorialProgress">1 / 10</span>
                <button class="tutorial-btn tutorial-btn-primary" id="tutorialNext">Next</button>
                <button class="tutorial-btn tutorial-btn-danger" id="tutorialExit">Exit Tutorial</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(panel);
        
        this.overlay = overlay;
        this.modal = panel;
    }

    hideTutorialModal() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    setupModalHandlers() {
        const modal = this.modal;
        if (!modal) return;
        
        const closeBtn = modal.querySelector('#tutorialClose');
        const exitBtn = modal.querySelector('#tutorialExit');
        const nextBtn = modal.querySelector('#tutorialNext');
        const prevBtn = modal.querySelector('#tutorialPrev');
        const overlay = modal.querySelector('#tutorialOverlay');
        
        closeBtn.addEventListener('click', () => this.confirmExit());
        exitBtn.addEventListener('click', () => this.confirmExit());
        nextBtn.addEventListener('click', () => this.nextStep());
        prevBtn.addEventListener('click', () => this.previousStep());
        overlay.addEventListener('click', () => this.confirmExit());
    }

    updateTutorialContent(step) {
        if (!this.modal) return;
        
        const title = this.modal.querySelector('#tutorialTitle');
        const body = this.modal.querySelector('#tutorialBody');
        const progress = this.modal.querySelector('#tutorialProgress');
        
        title.textContent = step.title;
        body.innerHTML = step.content;
        progress.textContent = `${this.currentStep + 1} / ${this.tutorialSteps.length}`;
    }

    updateNavigationButtons() {
        if (!this.modal) return;
        
        const prevBtn = this.modal.querySelector('#tutorialPrev');
        const nextBtn = this.modal.querySelector('#tutorialNext');
        
        prevBtn.disabled = this.currentStep === 0;
        
        if (this.currentStep === this.tutorialSteps.length - 1) {
            nextBtn.textContent = 'Complete';
        } else {
            nextBtn.textContent = 'Next';
        }
    }

    highlightElement(selector) {
        this.clearHighlights();
        
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('tutorial-highlight');
            this.positionPanelNearElement(element);
        } else {
            this.centerPanel();
        }
    }
    
    positionPanelNearElement(element) {
        if (!this.modal) return;
        
        const rect = element.getBoundingClientRect();
        const panel = this.modal;
        const panelWidth = 400;
        const panelHeight = 500;
        const margin = 20;
        
        // Calculate available space
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;
        const spaceTop = rect.top;
        const spaceBottom = window.innerHeight - rect.bottom;
        
        let left, top;
        
        // Prefer positioning to the right, then left, then top/bottom
        if (spaceRight >= panelWidth + margin) {
            left = rect.right + margin;
            top = Math.max(margin, rect.top - (panelHeight - rect.height) / 2);
        } else if (spaceLeft >= panelWidth + margin) {
            left = rect.left - panelWidth - margin;
            top = Math.max(margin, rect.top - (panelHeight - rect.height) / 2);
        } else if (spaceBottom >= panelHeight + margin) {
            left = Math.max(margin, rect.left - (panelWidth - rect.width) / 2);
            top = rect.bottom + margin;
        } else {
            left = Math.max(margin, rect.left - (panelWidth - rect.width) / 2);
            top = rect.top - panelHeight - margin;
        }
        
        // Ensure panel stays within viewport
        left = Math.min(left, window.innerWidth - panelWidth - margin);
        left = Math.max(left, margin);
        top = Math.min(top, window.innerHeight - panelHeight - margin);
        top = Math.max(top, margin);
        
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
    }
    
    centerPanel() {
        if (!this.modal) return;
        
        this.modal.style.left = '50%';
        this.modal.style.top = '50%';
        this.modal.style.transform = 'translate(-50%, -50%)';
    }

    clearHighlights() {
        const highlighted = document.querySelectorAll('.tutorial-highlight');
        highlighted.forEach(el => el.classList.remove('tutorial-highlight'));
    }

    executeStepAction(action) {
        switch (action) {
            case 'enableZoneMode':
                if (this.mainApp && this.mainApp.setMode) {
                    this.mainApp.setMode('zone');
                }
                break;
            case 'waitForZoneCreation':
                // Wait for user to create a zone
                break;
            case 'completeTutorial':
                this.completeTutorial();
                break;
        }
    }

    waitForUserAction(actionType) {
        // This method can be called by the main app when user completes an action
        return new Promise((resolve) => {
            const checkAction = () => {
                // Implementation depends on the specific action
                resolve();
            };
            
            setTimeout(checkAction, 1000);
        });
    }

    showActionCompleted(actionType) {
        this.showTutorialNotification(`Great! You completed: ${actionType}`, 'success');
    }

    showTutorialNotification(message, type = 'info') {
        if (this.mainApp && this.mainApp.showNotification) {
            this.mainApp.showNotification(message, type);
        }
    }

    confirmExit() {
        this.showExitConfirmationModal();
    }

    showExitConfirmationModal() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'tutorial-exit-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'tutorial-exit-modal';
        modal.innerHTML = `
            <div class="exit-modal-header">
                <h3>Exit Tutorial</h3>
            </div>
            <div class="exit-modal-body">
                <div class="exit-icon">⚠️</div>
                <p>Are you sure you want to exit the tutorial?</p>
                <p class="exit-subtitle">You can open the tutorial anytime by clicking Tutorial Button</p>
            </div>
            <div class="exit-modal-footer">
                <button class="exit-btn exit-btn-cancel" id="exitCancel">Stay in Tutorial</button>
                <button class="exit-btn exit-btn-confirm" id="exitConfirm">Exit Tutorial</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add event listeners
        const cancelBtn = modal.querySelector('#exitCancel');
        const confirmBtn = modal.querySelector('#exitConfirm');
        
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
        });
        
        confirmBtn.addEventListener('click', () => {
            overlay.remove();
            this.stop();
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    completeTutorial() {
        this.showTutorialNotification('Congratulations! You\'ve completed the tutorial!', 'success');
        this.stop();
    }

    injectTutorialStyles() {
        const styles = `
            <style id="tutorial-styles">
                .tutorial-spotlight-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                    pointer-events: none;
                }
                
                .tutorial-spotlight-panel {
                    position: fixed;
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border-radius: 16px;
                    width: 400px;
                    max-height: 600px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    z-index: 10001;
                    display: flex;
                    flex-direction: column;
                    animation: tutorialSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    pointer-events: auto;
                }
                
                .tutorial-header {
                    padding: 20px 24px 16px;
                    border-bottom: 1px solid #e1e8ed;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .tutorial-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #2c3e50;
                }
                
                .tutorial-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 4px;
                    line-height: 1;
                }
                
                .tutorial-body {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }
                
                .tutorial-content h3 {
                    margin: 0 0 16px 0;
                    color: #2c3e50;
                    font-size: 1.25rem;
                }
                
                .tutorial-content h4 {
                    margin: 20px 0 8px 0;
                    color: #2c3e50;
                    font-size: 1.1rem;
                    font-weight: 600;
                }
                
                .tutorial-content p {
                    margin: 12px 0;
                    line-height: 1.6;
                    color: #34495e;
                }
                
                .tutorial-content ul {
                    margin: 12px 0;
                    padding-left: 24px;
                }
                
                .tutorial-content ol {
                    margin: 12px 0;
                    padding-left: 24px;
                }
                
                .tutorial-content li {
                    margin: 6px 0;
                    line-height: 1.5;
                    color: #34495e;
                }
                
                .tutorial-tip {
                    background: linear-gradient(135deg, rgba(23, 162, 184, 0.05), rgba(23, 162, 184, 0.15));
                    border: 1px solid rgba(23, 162, 184, 0.3);
                    border-left: 4px solid #17a2b8;
                    border-radius: 8px;
                    padding: 18px;
                    margin: 24px 0;
                    box-shadow: 0 2px 8px rgba(23, 162, 184, 0.1);
                }
                
                .energy-requirement {
                    color: #fd7e14;
                    font-weight: 600;
                    background: rgba(253, 126, 20, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid rgba(253, 126, 20, 0.2);
                }
                
                .income-value {
                    color: #198754;
                    font-weight: 600;
                    background: rgba(25, 135, 84, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid rgba(25, 135, 84, 0.2);
                }
                
                .zone-explanation {
                    margin: 16px 0;
                }
                
                .zone-item {
                    display: flex;
                    align-items: center;
                    margin: 12px 0;
                    gap: 12px;
                }
                
                .zone-color {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }
                
                .zone-color.residential {
                    background: #81C784;
                }
                
                .zone-color.commercial {
                    background: #64B5F6;
                }
                
                .zone-color.industrial {
                    background: #FFB74D;
                }
                
                .tutorial-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #e1e8ed;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }
                
                .tutorial-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .tutorial-btn-primary {
                    background: #3498db;
                    color: white;
                }
                
                .tutorial-btn-primary:hover {
                    background: #2980b9;
                }
                
                .tutorial-btn-secondary {
                    background: #ecf0f1;
                    color: #2c3e50;
                }
                
                .tutorial-btn-secondary:hover {
                    background: #d5dbdb;
                }
                
                .tutorial-btn-secondary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .tutorial-btn-danger {
                    background: #e74c3c;
                    color: white;
                }
                
                .tutorial-btn-danger:hover {
                    background: #c0392b;
                }
                
                .tutorial-progress {
                    color: #7f8c8d;
                    font-size: 14px;
                    white-space: nowrap;
                }
                
                .tutorial-highlight {
                    position: relative;
                    z-index: 10000;
                    box-shadow: 0 0 0 4px #007bff, 0 0 25px rgba(0, 123, 255, 0.6);
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    animation: tutorialPulse 2.5s infinite ease-in-out;
                }
                
                .tutorial-exit-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 10003;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: tutorialSlideIn 0.3s ease-out;
                }
                
                .tutorial-exit-modal {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    border-radius: 16px;
                    max-width: 450px;
                    width: 90%;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    animation: tutorialSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .exit-modal-header {
                    padding: 24px 28px 16px;
                    border-bottom: 1px solid #e9ecef;
                    background: linear-gradient(135deg, #f8f9fa, #ffffff);
                }
                
                .exit-modal-header h3 {
                    margin: 0;
                    font-size: 1.4em;
                    font-weight: 700;
                    color: #1a252f;
                    text-align: center;
                }
                
                .exit-modal-body {
                    padding: 28px;
                    text-align: center;
                }
                
                .exit-icon {
                    font-size: 3em;
                    margin-bottom: 16px;
                    display: block;
                }
                
                .exit-modal-body p {
                    margin: 8px 0;
                    font-size: 1.1em;
                    color: #2c3e50;
                    line-height: 1.5;
                }
                
                .exit-subtitle {
                    font-size: 0.95em !important;
                    color: #6c757d !important;
                    font-style: italic;
                }
                
                .exit-modal-footer {
                    padding: 20px 28px 28px;
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                
                .exit-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    min-width: 140px;
                }
                
                .exit-btn-cancel {
                    background: linear-gradient(135deg, #6c757d, #545b62);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .exit-btn-cancel:hover {
                    background: linear-gradient(135deg, #545b62, #383d41);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
                }
                
                .exit-btn-confirm {
                    background: linear-gradient(135deg, #dc3545, #c82333);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .exit-btn-confirm:hover {
                    background: linear-gradient(135deg, #c82333, #a71e2a);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
                }
                
                @media (max-width: 768px) {
                    .tutorial-content-wrapper {
                        width: 95%;
                        max-height: 90vh;
                    }
                    
                    .tutorial-footer {
                        flex-wrap: wrap;
                        gap: 8px;
                    }
                    
                    .tutorial-btn {
                        flex: 1;
                        min-width: 80px;
                    }
                }
            </style>
        `;
        
        if (!document.getElementById('tutorial-styles')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
}