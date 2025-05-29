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
                title: "Welcome to Renewable Energy City Simulator!",
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
                title: "Understanding City Zones",
                content: `
                    <div class="tutorial-content">
                        <h3>🏘️ City Zones and Energy Needs</h3>
                        <p>Cities are divided into different zones with unique energy and income characteristics:</p>
                        
                        <div class="zone-explanation">
                            <div class="zone-item">
                                <div class="zone-color residential"></div>
                                <div>
                                    <strong>Residential Zones</strong><br>
                                    <small>50 kW demand • $120/month income when powered</small>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color commercial"></div>
                                <div>
                                    <strong>Commercial Zones</strong><br>
                                    <small>100 kW demand • $250/month income when powered</small>
                                </div>
                            </div>
                            
                            <div class="zone-item">
                                <div class="zone-color industrial"></div>
                                <div>
                                    <strong>Industrial Zones</strong><br>
                                    <small>200 kW demand • $400/month income when powered</small>
                                </div>
                            </div>
                        </div>
                        
                        <h4>Advanced Features:</h4>
                        <ul>
                            <li>Drag to select multiple cells for bulk zone creation</li>
                            <li>Monthly income updates in real-time</li>
                            <li>Visual indicators show powered vs unpowered zones</li>
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
                            <li><strong>Solar:</strong> $15,000 • 100kW • Works best in sunny weather</li>
                            <li><strong>Wind:</strong> $20,000 • 150kW • Enhanced by windy weather</li>
                            <li><strong>Hydro:</strong> $25,000 • 200kW • +60% bonus near rivers</li>
                            <li><strong>Geothermal:</strong> $30,000 • 120kW • +50% bonus in mountains</li>
                            <li><strong>Biomass:</strong> $18,000 • 80kW • +40% bonus in forests</li>
                        </ul>
                        
                        <h4>🏭 Fossil Fuels:</h4>
                        <ul>
                            <li><strong>Coal:</strong> $35,000 • 300kW • High pollution</li>
                            <li><strong>Natural Gas:</strong> $28,000 • 250kW • Lower emissions than coal</li>
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
                        <h3>🗻 Terrain Features & Efficiency Bonuses</h3>
                        <p>The city has specialized terrain that provides efficiency bonuses for certain energy sources:</p>
                        
                        <ul>
                            <li><strong>🌲 Forest Areas:</strong> +40% biomass efficiency</li>
                            <li><strong>🏔️ Mountain Areas:</strong> +50% geothermal, +30% wind efficiency</li>
                            <li><strong>🏖️ Beach Areas:</strong> +35% wind, +25% solar efficiency</li>
                            <li><strong>🌊 River Areas:</strong> +60% hydro efficiency</li>
                        </ul>
                        
                        <h4>Strategy Tips:</h4>
                        <ul>
                            <li>Place hydro plants near rivers for maximum efficiency</li>
                            <li>Mountain areas are perfect for geothermal and wind</li>
                            <li>Forests boost biomass production significantly</li>
                            <li>Beach areas enhance both wind and solar</li>
                        </ul>
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
                        
                        <p>The cell will turn green and show it needs 50 kW of power to generate $120/month income.</p>
                        
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
        const modal = document.createElement('div');
        modal.className = 'tutorial-modal';
        modal.innerHTML = `
            <div class="tutorial-overlay" id="tutorialOverlay"></div>
            <div class="tutorial-content-wrapper">
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
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
    }

    hideTutorialModal() {
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
        }
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
        if (confirm('Are you sure you want to exit the tutorial?')) {
            this.stop();
        }
    }

    completeTutorial() {
        this.showTutorialNotification('Congratulations! You\'ve completed the tutorial!', 'success');
        this.stop();
    }

    injectTutorialStyles() {
        const styles = `
            <style id="tutorial-styles">
                .tutorial-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .tutorial-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                }
                
                .tutorial-content-wrapper {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    max-height: 80vh;
                    width: 90%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
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
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
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
                    z-index: 9999;
                    box-shadow: 0 0 0 4px #f39c12, 0 0 20px rgba(243, 156, 18, 0.3);
                    border-radius: 4px;
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